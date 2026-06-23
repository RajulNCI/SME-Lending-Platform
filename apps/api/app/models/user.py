"""
User model — stores all 8 FinPal platform roles.
Passwords are bcrypt-hashed. Never store plaintext.
"""

import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UserRole(str, enum.Enum):
    credit_officer = "credit_officer"
    risk_manager = "risk_manager"
    compliance_officer = "compliance_officer"
    ops_manager = "ops_manager"
    it_admin = "it_admin"
    mrm_analyst = "mrm_analyst"
    collections_officer = "collections_officer"
    borrower_sme = "borrower_sme"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    username: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    hashed_pw: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    def __repr__(self) -> str:
        return f"<User {self.username} ({self.role})>"
