# config.py — Application configuration
# ============================================================
# Edit the SECRET_KEY in production (use a random 32-char string)
# ============================================================

import os
from pathlib import Path

# Base directory of this file
BASE_DIR = Path(__file__).parent

class Config:
    # Flask secret key — used to sign session cookies
    SECRET_KEY = os.environ.get('SECRET_KEY', 'civictrack-dev-secret-change-in-prod-2025')

    # SQLite database path
    DATABASE = os.environ.get('DATABASE_URL', str(BASE_DIR / 'database' / 'db.sqlite3'))

    # Upload folder for issue images
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', str(BASE_DIR / 'uploads'))

    # Allowed file extensions for uploads
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # Max file upload size: 5 MB
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024

    # Debug mode — set to False in production
    DEBUG = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'
