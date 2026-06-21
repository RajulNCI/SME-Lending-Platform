"""
FinPal API — FastAPI application entry point.
Registers all routers, middleware, and startup/shutdown events.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.api.v1.router import router as api_v1_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.logging import logger, setup_logging
from app.middleware.cors import add_cors


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    import asyncio

    from app.services.ai.worker import worker_loop
    from app.services.queue import job_queue

    setup_logging()
    logger.info(
        "finpal.startup", environment=settings.ENVIRONMENT, version=settings.VERSION
    )

    # Create tables if they don't exist (use Alembic in production)
    if settings.ENVIRONMENT in ("development", "test"):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("finpal.db.tables_ready")
        except Exception as e:
            logger.warning("finpal.db.unreachable", error=str(e))

    # Local in-process worker — only used when SQS is not configured.
    # In production, Lambda reads from SQS instead.
    worker_task = None
    if not settings.AWS_SQS_QUEUE_URL:
        worker_task = asyncio.create_task(worker_loop(job_queue))
        logger.info("finpal.worker.started")

    yield

    if worker_task:
        worker_task.cancel()
    logger.info("finpal.shutdown")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
FinPal — AI-driven SME Lending Platform API.

## Authentication
All endpoints (except /health) require a JWT bearer token.
Obtain a token via `POST /api/v1/auth/login`.

## Roles
- `credit_officer` — HITL queue, application review, decisions
- `risk_manager` — model monitoring, stress testing
- `compliance_officer` — audit evidence, GDPR requests
- `ops_manager` — dashboard, payments, SLA
- `it_admin` — user management, DORA, TPRM
- `mrm_analyst` — model inventory, PSI/Gini, drift alerts
- `collections_officer` — collections, bureau reporting, SDD
- `borrower_sme` — submit applications, view status

## Regulatory compliance
- EU AI Act Art.12 — immutable audit log with SHA-256 hash chain
- GDPR Art.22 — consent capture and human review workflow
- EBA LOM — creditworthiness assessment and pricing audit trail
- NFR-002 — WORM audit log, 7-year retention
    """,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
add_cors(app)

# Routers
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

# Local AI routes only in dev (not needed in production — Lambda handles AI)
if settings.ENVIRONMENT != "production":
    try:
        from app.api.v1.endpoints.local_ai import router as local_ai_router
        app.include_router(local_ai_router)
    except ImportError:
        pass


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error("unhandled_exception", error=str(exc), path=str(request.url))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "correlation_id": "see logs"},
    )
