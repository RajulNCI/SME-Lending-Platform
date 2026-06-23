"""
Application configuration — loaded from environment variables.
All settings have safe defaults for local development.
"""

import json

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── App ───────────────────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "FinPal API"
    VERSION: str = "0.1.0"

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = (
        "postgresql+asyncpg://creditcore:password@localhost:5432/creditcore_dev"
    )

    # ── JWT / Cognito ─────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "dev-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480  # 8 hours

    COGNITO_USER_POOL_ID: str = ""
    COGNITO_CLIENT_ID: str = ""
    COGNITO_REGION: str = "us-east-1"

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return json.loads(v)
        return v

    # ── AWS ───────────────────────────────────────────────────────────────────
    AWS_REGION: str = "us-east-1"
    AWS_S3_DOCUMENTS_BUCKET: str = "creditcore-documents-dev"
    AWS_S3_MODELS_BUCKET: str = "creditcore-ai-models-dev"
    AWS_SQS_QUEUE_URL: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_SESSION_TOKEN: str = ""

    # ── Logging ───────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
