import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # PostgreSQL Database Configuration
    # Default to local database if DATABASE_URL not set
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:postgres@localhost/imarisha_loan'
    
    # Render Production Database (Commented out)
    # 'postgresql://imarisha_postgres_gua6_user:YeQSmgRC6Wg4o4l2d0fCfCiF3jAiJmnt@dpg-d53ddtmmcj7s73e5knbg-a.oregon-postgres.render.com/imarisha_postgres_gua6'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # PostgreSQL-specific configuration
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'max_overflow': 0
    }

    # Redis Configuration
    REDIS_URL = os.environ.get('REDIS_URL') or os.environ.get('REDISCLOUD_URL') or 'redis://localhost:6379/0'

    # Celery Configuration
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', REDIS_URL)
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', REDIS_URL)
    
    # Session Configuration
    SESSION_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'None' if SESSION_COOKIE_SECURE else 'Lax'
    PERMANENT_SESSION_LIFETIME = 86400
    SESSION_PERMANENT = True
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_TOKEN_LOCATION = ['headers', 'cookies']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    JWT_ACCESS_TOKEN_EXPIRES = 86400
    JWT_REFRESH_TOKEN_EXPIRES = 2592000
    JWT_ALGORITHM = 'HS256'

    # CORS Configuration
    ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '').split(',') if os.environ.get('ALLOWED_ORIGINS') else []
