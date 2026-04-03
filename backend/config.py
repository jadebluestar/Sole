"""
Sole — Configuration Management
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration."""
    
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    SECRET_KEY = os.environ.get('SECRET_KEY', 'sole_secret_2026')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///sole.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ML Model
    MODEL_PATH = os.environ.get('MODEL_PATH', 'sole_best.pth')
    
    # API Keys
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
    
    # Security
    CLINICIAN_PASSWORD = os.environ.get('CLINICIAN_PASSWORD', 'sole2026')
    
    # CORS
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5173']
    
    # Limits
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file
    JSON_SORT_KEYS = False


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration."""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


# Config selector
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
}

env = os.environ.get('FLASK_ENV', 'development')
current_config = config.get(env, DevelopmentConfig)
