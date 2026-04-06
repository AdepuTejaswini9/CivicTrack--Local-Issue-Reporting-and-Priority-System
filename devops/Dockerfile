# devops/Dockerfile
# ============================================================
# Builds the CivicTrack Flask app into a Docker image.
# ============================================================

# Use an official lightweight Python image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install dependencies first (cached layer if requirements.txt unchanged)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create directories that the app writes to at runtime
RUN mkdir -p backend/uploads backend/database frontend/static/images

# Expose the Flask port
EXPOSE 5000

# Set environment variables for production
ENV FLASK_DEBUG=false
ENV SECRET_KEY=change-this-in-production

# Start with gunicorn (production WSGI server)
# Workers: 2 * CPU_cores + 1 is a good starting point
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "run:app"]
