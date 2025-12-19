
from flask import Flask, request, g
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_caching import Cache
from flask_mail import Mail
from config import Config
import logging
import os

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
bcrypt = Bcrypt()
cache = Cache()
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Enhanced CORS configuration
    cors.init_app(app, resources={r"/*": {
        "origins": [
            "http://localhost:5173", 
            "http://127.0.0.1:5173",
            "https://imarisha-loans.vercel.app",
            r"https://.*\.vercel\.app",
            r"https://.*\.netlify\.app"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allowed_headers": [
            "Content-Type", 
            "Authorization", 
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ],
        "supports_credentials": True,
        "expose_headers": ["X-Total-Count", "X-Page-Count"],
        "max_age": 86400
    }})
    
    bcrypt.init_app(app)
    

    # Initialize caching (use simple cache to avoid Redis dependency)
    cache.init_app(app, config={
        'CACHE_TYPE': 'SimpleCache',
        'CACHE_DEFAULT_TIMEOUT': 300
    })
    
    # Initialize email service
    mail.init_app(app)
    
    # Create logs directory if it doesn't exist
    os.makedirs('logs', exist_ok=True)
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/app.log'),
            logging.StreamHandler()
        ]
    )
    
    
    # Initialize services
    from app.services import mfa_service, audit_service, notification_service, payment_service, risk_service, dashboard_service, currency_service, ussd_service, bi_service, kyc_service, aml_service, gdpr_service, voice_assistant, voice_analytics, demand_forecasting, inventory_optimization, etl_service
    mfa_service.init_app(app)
    audit_service.init_app(app)
    notification_service.init_app(app)
    payment_service.init_app(app)
    risk_service.init_app(app)
    dashboard_service.init_app(app)
    currency_service.init_app(app)
    ussd_service.init_app(app)
    bi_service.init_app(app)
    kyc_service.init_app(app)
    aml_service.init_app(app)
    gdpr_service.init_app(app)
    voice_assistant.init_app(app)
    voice_analytics.init_app(app)
    demand_forecasting.init_app(app)
    inventory_optimization.init_app(app)
    etl_service.init_app(app)
    
    # Register blueprints
    from app.routes import auth, branches, groups, members, loans, products, transactions, dashboard, payments, jobs, reports, field, gamification, notifications, risk, dashboards, ai_analytics, reporting, field_operations, currency, alternative_payments, ussd, bi_integration, compliance, voice_assistant as voice_assistant_routes, inventory_intelligence, etl_pipeline, users, suppliers, stock, permissions
    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(branches.bp)
    app.register_blueprint(permissions.bp)
    app.register_blueprint(suppliers.bp)
    app.register_blueprint(stock.bp)
    app.register_blueprint(groups.bp)
    app.register_blueprint(members.bp)
    app.register_blueprint(loans.bp)
    app.register_blueprint(products.bp)
    app.register_blueprint(transactions.bp)
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(dashboards.bp)
    app.register_blueprint(payments.bp)
    app.register_blueprint(jobs.bp)
    app.register_blueprint(reports.bp)
    app.register_blueprint(field.bp)
    app.register_blueprint(gamification.bp)
    app.register_blueprint(field_operations.bp)
    app.register_blueprint(notifications.bp)
    app.register_blueprint(risk.bp)
    app.register_blueprint(currency.bp)
    app.register_blueprint(alternative_payments.bp)
    app.register_blueprint(ussd.bp)
    app.register_blueprint(bi_integration.bp)
    app.register_blueprint(ai_analytics.ai_analytics_bp)
    app.register_blueprint(reporting.reporting_bp)
    app.register_blueprint(compliance.bp)
    app.register_blueprint(voice_assistant_routes.bp)
    app.register_blueprint(inventory_intelligence.bp)
    app.register_blueprint(etl_pipeline.bp)
    

    # Health check endpoint
    @app.route('/health')
    def health_check():
        try:
            # Test database connection
            db.session.execute('SELECT 1')
            
            # Test cache connection (simple cache doesn't need Redis)
            cache.get('health_check')
            
            return {
                'status': 'healthy',
                'database': 'connected',
                'cache': 'connected',
                'redis': 'not_configured',
                'timestamp': '2024-01-15T10:30:00Z',
                'version': '1.0.0-enterprise'
            }, 200
            
        except Exception as e:
            logging.error(f"Health check failed: {str(e)}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': '2024-01-15T10:30:00Z'
            }, 500
    
    # API info endpoint
    @app.route('/api')
    def api_info():
        return {
            'name': 'Imarisha Loan Management API',
            'version': '1.0.0',
            'description': 'Enterprise-grade microfinance management system',
            'features': [
                'JWT Authentication with refresh tokens',
                'M-Pesa integration',
                'AI-powered risk scoring',
                'Real-time notifications',
                'Mobile PWA support',
                'Advanced analytics'
            ],
            'documentation': '/api/docs',
            'status': 'operational'
        }
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500
    
    # Before request handlers
    @app.before_request
    def before_request():
        # Add request ID for tracking
        import uuid
        g.request_id = str(uuid.uuid4())
        
        # Log request
        app.logger.info(f"Request {g.request_id}: {request.method} {request.url}")
    
    @app.after_request
    def after_request(response):
        # Add security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Add request ID to response headers
        if hasattr(g, 'request_id'):
            response.headers['X-Request-ID'] = g.request_id
        
        return response
    
    app.logger.info("Application initialized successfully")
    return app
