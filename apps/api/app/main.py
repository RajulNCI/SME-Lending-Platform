"""
FinPal API — FastAPI application entry point.
Registers all routers, middleware, and startup/shutdown events.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.database import engine, Base
from app.api.v1.router import router as api_v1_router
from app.middleware.cors import add_cors


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    setup_logging()
    logger.info("finpal.startup", environment=settings.ENVIRONMENT, version=settings.VERSION)

    # Create tables if they don't exist (use Alembic in production)
    if settings.ENVIRONMENT in ("development", "test"):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    yield

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


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error("unhandled_exception", error=str(exc), path=str(request.url))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "correlation_id": "see logs"},
    )
