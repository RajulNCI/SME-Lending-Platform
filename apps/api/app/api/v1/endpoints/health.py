"""Health check endpoint — used by AWS ECS, Vercel, and smoke tests."""
from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(tags=["health"])


@router.get("/health", summary="Platform health check")
async def health() -> dict:
    return {
        "status": "ok",
        "service": "finpal-api",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }