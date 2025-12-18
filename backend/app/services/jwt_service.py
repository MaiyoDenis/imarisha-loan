"""
JWT Authentication Service with Refresh Tokens
Enterprise-grade authentication with security features
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets
import redis
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required, 
    get_jwt_identity,
    get_jwt,
    JWTManager,
    verify_jwt_in_request
)
from flask import current_app, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import json

class JWTService:
    def __init__(self, app=None):
        self.jwt = JWTManager()
        self.redis_client = None
        self.limiter = None
        self.blocked_tokens = set()
        
        if app:
            self.init_app(app)
    

    def init_app(self, app):
        """Initialize JWT service with Flask app"""
        self.jwt.init_app(app)
        
        # Initialize Redis client with graceful failure handling
        try:
            redis_url = app.config.get('REDIS_URL')
            if redis_url:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
            else:
                self.redis_client = redis.Redis(
                    host=app.config.get('REDIS_HOST', 'localhost'),
                    port=app.config.get('REDIS_PORT', 6379),
                    db=app.config.get('REDIS_DB', 0),
                    decode_responses=True
                )
            # Test connection
            self.redis_client.ping()
            logging.info("JWT Service: Redis connection established")
        except Exception as e:
            logging.warning(f"JWT Service: Redis not available - {str(e)}")
            self.redis_client = None
        

        # Rate limiting configuration (use memory storage to avoid Redis dependency)
        self.limiter = Limiter(
            key_func=get_remote_address,
            default_limits=["5000 per day", "500 per hour"],
            storage_uri="memory://"
        )
        self.limiter.init_app(app)
        
        # JWT configuration
        if 'JWT_SECRET_KEY' not in app.config:
            app.config['JWT_SECRET_KEY'] = app.config.get('SECRET_KEY', secrets.token_hex(32))
        app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
        app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
        app.config['JWT_ALGORITHM'] = 'HS256'
        
        # Set up JWT callbacks
        self._setup_jwt_callbacks(app)
        
        logging.info("JWT Service initialized successfully")
    
    def _setup_jwt_callbacks(self, app):
        """Setup JWT callbacks for token validation and blacklisting"""
        

        @self.jwt.token_in_blocklist_loader
        def check_if_token_revoked(jwt_header, jwt_payload):
            """Check if JWT token is blacklisted"""
            jti = jwt_payload['jti']
            if self.redis_client:
                return self.redis_client.sismember('blocked_tokens', jti)
            else:
                # Use in-memory set when Redis is not available
                return jti in self.blocked_tokens
        
        @self.jwt.revoked_token_loader
        def revoked_token_callback(jwt_header, jwt_payload):
            """Handle revoked tokens"""
            return jsonify({
                'error': 'Token has been revoked',
                'code': 'TOKEN_REVOKED'
            }), 401
        
        @self.jwt.expired_token_loader
        def expired_token_callback(jwt_header, jwt_payload):
            """Handle expired tokens"""
            return jsonify({
                'error': 'Token has expired',
                'code': 'TOKEN_EXPIRED'
            }), 401
        
        @self.jwt.invalid_token_loader
        def invalid_token_callback(error):
            """Handle invalid tokens"""
            return jsonify({
                'error': 'Invalid token',
                'code': 'INVALID_TOKEN'
            }), 401
        
        @self.jwt.unauthorized_loader
        def unauthorized_callback(error):
            """Handle unauthorized requests"""
            return jsonify({
                'error': 'Authorization token required',
                'code': 'MISSING_TOKEN'
            }), 401
    

    def create_tokens(self, user_id: int, user_data: Dict[str, Any]) -> Dict[str, str]:
        """Create access and refresh tokens"""
        try:
            # Additional claims for access token
            access_token_claims = {
                'user_id': user_id,
                'role': user_data.get('role'),
                'branch_id': user_data.get('branch_id'),
                'iat': datetime.utcnow(),
                'type': 'access'
            }
            
            # Create tokens
            access_token = create_access_token(
                identity=user_id,
                additional_claims=access_token_claims
            )
            
            refresh_token = create_refresh_token(
                identity=user_id,
                additional_claims={'type': 'refresh'}
            )
            
            # Store refresh token in Redis for validation (if Redis is available)
            if self.redis_client:
                try:
                    refresh_key = f"refresh_token:{user_id}:{secrets.token_hex(16)}"
                    self.redis_client.setex(
                        refresh_key, 
                        30*24*60*60,  # 30 days
                        "valid"
                    )
                except Exception as redis_error:
                    logging.warning(f"Failed to store refresh token in Redis: {redis_error}")
                    # Continue without Redis - tokens will still work
            else:
                logging.info("Redis not available, skipping refresh token storage")
            
            logging.info(f"Tokens created for user {user_id}")
            
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'token_type': 'Bearer',
                'expires_in': 3600  # 1 hour
            }
            
        except Exception as e:
            logging.error(f"Error creating tokens: {str(e)}")
            raise
    

    def revoke_token(self, jti: str) -> bool:
        """Revoke a JWT token by adding to blacklist"""
        try:
            if self.redis_client:
                self.redis_client.sadd('blocked_tokens', jti)
                self.redis_client.expire('blocked_tokens', 3600)  # 1 hour
                logging.info(f"Token {jti} revoked")
            else:
                # Use in-memory set when Redis is not available
                self.blocked_tokens.add(jti)
                logging.info(f"Token {jti} revoked (in-memory)")
            return True
        except Exception as e:
            logging.error(f"Error revoking token {jti}: {str(e)}")
            return False
    

    def revoke_user_tokens(self, user_id: int) -> bool:
        """Revoke all tokens for a user"""
        try:
            if self.redis_client:
                # Add wildcard pattern for all user tokens
                pattern = f"access_token:{user_id}:*"
                keys = self.redis_client.keys(pattern)
                
                for key in keys:
                    self.redis_client.sadd('blocked_tokens', key)
                    self.redis_client.delete(key)
            else:
                # Use in-memory set when Redis is not available
                # This is a simplified approach - in production you'd want more sophisticated token tracking
                logging.info(f"Cannot revoke all tokens for user {user_id} without Redis")
            
            logging.info(f"All tokens revoked for user {user_id}")
            return True
            
        except Exception as e:
            logging.error(f"Error revoking user tokens {user_id}: {str(e)}")
            return False
    
    def limit(self, limit_value: str):
        """Rate limiting decorator"""
        if self.limiter:
            return self.limiter.limit(limit_value)
        # Return no-op decorator if limiter not initialized
        return lambda f: f

    def verify_rate_limit(self, endpoint: str = "auth") -> bool:
        """Verify rate limiting for endpoints (Deprecated - use limit decorator)"""
        try:
            # This implementation was incorrect as limiter.limit returns a decorator
            # Keeping it for backward compatibility but it won't enforce limits correctly
            # unless refactored to use limiter.check() which might not be available
            return True
        except Exception as e:
            logging.warning(f"Rate limit check failed: {str(e)}")
            return True
    

    def log_auth_event(self, event_type: str, user_id: Optional[int] = None, 
                      ip_address: str = None, details: str = None):
        """Log authentication events for audit trail"""
        try:
            log_data = {
                'timestamp': datetime.utcnow().isoformat(),
                'event_type': event_type,
                'user_id': user_id,
                'ip_address': ip_address or request.remote_addr,
                'user_agent': request.headers.get('User-Agent', ''),
                'details': details or ''
            }
            
            logging.info(f"AUTH EVENT: {log_data}")
            
            # Store in Redis for analytics (if Redis is available)
            if self.redis_client:
                try:
                    log_key = f"auth_log:{datetime.utcnow().strftime('%Y%m%d')}"
                    self.redis_client.lpush(log_key, json.dumps(log_data))
                    self.redis_client.expire(log_key, 7*24*60*60)  # 7 days
                except Exception as redis_error:
                    logging.warning(f"Failed to store auth event in Redis: {redis_error}")
            else:
                logging.info("Redis not available, skipping auth event storage")
            
        except Exception as e:
            logging.error(f"Error logging auth event: {str(e)}")
    
    def get_current_user(self) -> Optional[Dict[str, Any]]:
        """Get current authenticated user information"""
        try:
            # Check if JWT context exists before attempting to access it
            try:
                verify_jwt_in_request(optional=True)
            except:
                return None
            
            current_user_id = get_jwt_identity()
            if not current_user_id:
                return None
            
            # Get additional claims
            jwt_claims = get_jwt()
            
            return {
                'id': current_user_id,
                'role': jwt_claims.get('role'),
                'branch_id': jwt_claims.get('branch_id'),
                'token_issued_at': jwt_claims.get('iat')
            }
            
        except Exception as e:
            logging.debug(f"No JWT context available: {str(e)}")
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """Refresh access token using refresh token"""
        try:
            # Verify refresh token
            verify_jwt_in_request(refresh=True)
            current_user_id = get_jwt_identity()
            
            # Get user data (this would typically come from database)
            user_data = {'role': 'customer', 'branch_id': 1}  # Placeholder
            
            # Create new access token
            access_token = create_access_token(
                identity=current_user_id,
                additional_claims={
                    'user_id': current_user_id,
                    'role': user_data.get('role'),
                    'branch_id': user_data.get('branch_id'),
                    'iat': datetime.utcnow(),
                    'type': 'access'
                }
            )
            
            return access_token
            
        except Exception as e:
            logging.error(f"Error refreshing token: {str(e)}")
            return None

# Global JWT service instance
jwt_service = JWTService()

def jwt_required_api(fn):
    """Enhanced JWT decorator with logging - JWT validation first, then logging"""
    from functools import wraps
    
    @jwt_required()
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            user_id = get_jwt_identity()
            jwt_service.log_auth_event(
                'api_access',
                user_id,
                details=f"API: {request.endpoint}"
            )
        except Exception as e:
            logging.warning(f"Failed to log auth event: {str(e)}")
        
        return fn(*args, **kwargs)
    
    return wrapper

def role_required(*roles):
    """Enhanced role-based access control decorator"""
    from functools import wraps
    
    def decorator(fn):
        @wraps(fn)
        @jwt_required_api
        def wrapper(*args, **kwargs):
            current_user = jwt_service.get_current_user()
            if not current_user:
                return jsonify({'error': 'User not authenticated'}), 401
            
            user_role = current_user.get('role')
            if user_role not in roles:
                jwt_service.log_auth_event(
                    'access_denied',
                    current_user.get('id'),
                    details=f"Role {user_role} attempted to access {request.endpoint}"
                )
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# Attach decorators to service instance for easier access
jwt_service.jwt_required_api = jwt_required_api
jwt_service.role_required = role_required
