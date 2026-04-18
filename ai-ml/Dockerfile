FROM python:3.10-slim

WORKDIR /app

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

# Expose port
EXPOSE 8000

# Run the application - single worker to save memory
CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:8000", "--timeout", "120", "--workers", "1", "--threads", "2", "wsgi:app"]
