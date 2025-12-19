from flask import Blueprint, request, jsonify
from app.models import User
from app import db, bcrypt
from app.services import audit_service, mfa_service, AuditEventType, RiskLevel

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()
        
        if user and bcrypt.check_password_hash(user.password, password):
            audit_service.log_event(
                event_type=AuditEventType.AUTH_LOGIN,
                user_id=user.id,
                resource="auth",
                action="login",
                details={'username': username},
                risk_level=RiskLevel.LOW
            )
            
            return jsonify({
                'status': 'success',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    'firstName': user.first_name,
                    'lastName': user.last_name
                }
            })
        
        audit_service.log_event(
            event_type=AuditEventType.AUTH_FAILURE,
            resource="auth",
            action="login_failed",
            details={'username': username},
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify({'error': 'Invalid credentials'}), 401
    
    except Exception as e:
        logger.error(f"Login error for user {data.get('username') if data else 'unknown'}: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    phone = data.get('phone')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    role = data.get('role', 'customer')
    branch_id = data.get('branchId')
    
    if not all([username, password, phone, first_name, last_name]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    if User.query.filter_by(phone=phone).first():
        return jsonify({'error': 'Phone number already exists'}), 400
        
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    user = User(
        username=username,
        password=hashed_password,
        phone=phone,
        first_name=first_name,
        last_name=last_name,
        role=role,
        branch_id=branch_id,
        is_active=True
    )
    
    db.session.add(user)
    db.session.commit()
    
    audit_service.log_event(
        event_type=AuditEventType.USER_CREATED,
        user_id=user.id,
        resource="user",
        action="register",
        details={'username': username, 'role': role},
        risk_level=RiskLevel.LOW
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict()
    }), 201

@bp.route('/logout', methods=['POST'])
def logout():
    audit_service.log_event(
        event_type=AuditEventType.AUTH_LOGOUT,
        resource="auth",
        action="logout",
        risk_level=RiskLevel.LOW
    )
    
    return jsonify({'success': True})

@bp.route('/refresh', methods=['POST'])
def refresh():
    return jsonify({'error': 'Token refresh not supported - stateless authentication in use'}), 501

@bp.route('/me', methods=['GET'])
def me():
    data = request.get_json()
    user_id = data.get('user_id') if data else None
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'firstName': user.first_name,
            'lastName': user.last_name
        }
    })

@bp.route('/mfa/setup', methods=['POST'])
def setup_mfa():
    data = request.get_json()
    user_id = data.get('user_id') if data else None
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        secret = mfa_service.generate_secret(user_id)
        qr_code = mfa_service.generate_qr_code(user_id, user.username, secret)
        
        audit_service.log_event(
            event_type=AuditEventType.AUTH_MFA,
            user_id=user_id,
            resource="auth",
            action="mfa_setup_initiated",
            risk_level=RiskLevel.LOW
        )
        
        return jsonify({
            'secret': secret,
            'qr_code': qr_code,
            'message': 'Scan the QR code with your authenticator app'
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to setup MFA: {str(e)}'}), 500

@bp.route('/mfa/verify', methods=['POST'])
def verify_mfa():
    data = request.get_json()
    user_id = data.get('user_id') if data else None
    token = data.get('token')
    mfa_type = data.get('type', 'totp')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    if not token:
        return jsonify({'error': 'Token is required'}), 400
    
    try:
        if mfa_type == 'totp':
            is_valid = mfa_service.verify_totp(user_id, token)
        elif mfa_type == 'backup':
            is_valid = mfa_service.verify_backup_code(user_id, token)
        else:
            return jsonify({'error': 'Invalid MFA type'}), 400
        
        if is_valid:
            audit_service.log_event(
                event_type=AuditEventType.AUTH_MFA,
                user_id=user_id,
                resource="auth",
                action="mfa_verified",
                details={'mfa_type': mfa_type},
                risk_level=RiskLevel.LOW
            )
            
            return jsonify({
                'message': 'MFA verification successful',
                'mfa_enabled': True
            }), 200
        else:
            audit_service.log_event(
                event_type=AuditEventType.AUTH_MFA,
                user_id=user_id,
                resource="auth",
                action="mfa_verification_failed",
                details={'mfa_type': mfa_type},
                risk_level=RiskLevel.MEDIUM
            )
            
            return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': f'MFA verification failed: {str(e)}'}), 500

@bp.route('/mfa/status', methods=['GET'])
def mfa_status():
    user_id = request.args.get('user_id', type=int)
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        status = mfa_service.get_mfa_status(user_id)
        return jsonify(status), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get MFA status: {str(e)}'}), 500

@bp.route('/mfa/backup-codes', methods=['POST'])
def generate_backup_codes():
    data = request.get_json()
    user_id = data.get('user_id') if data else None
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        codes = mfa_service.generate_backup_codes(user_id, count=8)
        
        audit_service.log_event(
            event_type=AuditEventType.AUTH_MFA,
            user_id=user_id,
            resource="auth",
            action="backup_codes_generated",
            risk_level=RiskLevel.MEDIUM
        )
        
        return jsonify({
            'backup_codes': codes,
            'message': 'Save these codes in a secure location. Each code can be used once.'
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to generate backup codes: {str(e)}'}), 500

@bp.route('/mfa/disable', methods=['POST'])
def disable_mfa():
    data = request.get_json()
    user_id = data.get('user_id') if data else None
    password = data.get('password')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    if not password:
        return jsonify({'error': 'Password is required to disable MFA'}), 400
    
    user = User.query.get(user_id)
    
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid password'}), 401
    
    try:
        mfa_service.disable_mfa(user_id)
        
        audit_service.log_event(
            event_type=AuditEventType.AUTH_MFA,
            user_id=user_id,
            resource="auth",
            action="mfa_disabled",
            risk_level=RiskLevel.HIGH
        )
        
        return jsonify({'message': 'MFA disabled successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to disable MFA: {str(e)}'}), 500
