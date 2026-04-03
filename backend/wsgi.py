"""
Sole — WSGI Entry Point for Production
Use with gunicorn: gunicorn -b 0.0.0.0:5000 wsgi:app
"""

import os
from app import app

if __name__ == "__main__":
    app.run()
