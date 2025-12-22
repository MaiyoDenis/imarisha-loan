import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # PostgreSQL Database Configuration (Production)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://imarisha_postgres_gua6_user:YeQSmgRC6Wg4o4l2d0fCfCiF3jAiJmnt@dpg-d53ddtmmcj7s73e5knbg-a.oregon-postgres.render.com/imarisha_postgres_gua6'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # PostgreSQL-specific configuration
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'max_overflow': 0
    }

    # Redis Configuration
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

    # Celery Configuration
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', REDIS_URL)
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', REDIS_URL)
