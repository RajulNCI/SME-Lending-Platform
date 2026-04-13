"""Main API v1 router — aggregates all endpoint routers."""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, applications, decisions, health

router = APIRouter()
router.include_router(health.router)
router.include_router(auth.router)
router.include_router(applications.router)
router.include_router(decisions.router)