FROM python:3.10-slim

WORKDIR /app

# Don't buffer Python output (for Render logs)
ENV PYTHONUNBUFFERED=1

# Install system dependencies (minimal for MediaPipe + OpenCV)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Render assigns its own via $PORT)
EXPOSE 8000

# Run the application - use $PORT for Render compatibility
CMD gunicorn --bind 0.0.0.0:${PORT:-8000} --timeout 120 --workers 1 --threads 2 api.app:app
