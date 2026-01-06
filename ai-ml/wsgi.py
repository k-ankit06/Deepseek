"""
WSGI entry point for Gunicorn
This ensures Python path is set before importing the app
"""
import sys
import os

# Add current directory to Python path FIRST
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Now import the app
from api.app import app

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000)
