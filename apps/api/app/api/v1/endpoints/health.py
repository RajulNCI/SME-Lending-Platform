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


@router.post("/admin/create-tables", summary="One-time DB table creation", include_in_schema=False)
async def create_tables() -> dict:
    from app.core.database import engine, Base
    from app.models import application, document, user, decision, audit_log  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    return {"status": "ok", "message": "All tables created"}