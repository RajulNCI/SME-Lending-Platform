FROM python:3.12-slim

WORKDIR /app

# Install system dependencies + Node.js (for the JS bridge/mock files)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Copy application code
COPY . .

# Install JS dependencies for the bridge script, if any
RUN if [ -f app/services/ai/package.json ]; then \
      cd app/services/ai && npm install --omit=dev; \
    fi

# Non-root user for security
RUN adduser --disabled-password --gecos "" appuser
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import httpx; httpx.get('http://localhost:8000/api/v1/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]