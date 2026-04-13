"""
Auth endpoints — login, logout, current user.
POST /api/v1/auth/login  → returns JWT
GET  /api/v1/auth/me     → returns current user info
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UserOut
from app.services.audit_service import AuditService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse, summary="Sign in and receive JWT token")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> LoginResponse:
    """
    Authenticate with username + password.
    Returns a JWT bearer token valid for {JWT_EXPIRE_MINUTES} minutes.
    Role is embedded in the token for RBAC checks.
    """
    result = await db.execute(select(User).where(User.username == body.username))
    user: User | None = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_pw):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive — contact IT Admin",
        )

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    token = create_access_token(
        subject=user.id,
        role=user.role.value,
        extra={"username": user.username, "display_name": user.display_name},
    )

    # Write to audit log
    await AuditService.log(
        db=db,
        event_type="user.login",
        actor_id=user.id,
        actor_username=user.username,
        description=f"User {user.username} logged in successfully",
        payload={"role": user.role.value},
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        role=user.role.value,
        display_name=user.display_name,
        expires_in=settings.JWT_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserOut, summary="Get current authenticated user")
async def me(
    token_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    result = await db.execute(select(User).where(User.id == token_data["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut.model_validate(user)