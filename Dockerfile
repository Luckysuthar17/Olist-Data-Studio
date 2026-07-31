# Use official lightweight Python image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirement specifications
COPY backend/requirements.txt ./backend/requirements.txt

# Install Python packages
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application files
COPY backend ./backend

# Initialize database
RUN python3 backend/init_db.py

EXPOSE 8000

# Start FastAPI server using Uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
