"""
Audit log — append-only, tamper-evident log of all platform events.
EU AI Act Art.12 · GDPR Art.30 · NFR-002 (7-year retention).
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    application_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("applications.id"), nullable=True, index=True
    )
    actor_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    actor_username: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    correlation_id: Mapped[str | None] = mapped_column(
        String(36), nullable=True, index=True
    )
    # SHA-256 hash chain — each entry hashes previous entry (NFR-002)
    prev_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    entry_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    # Immutable timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
        index=True,
    )

    # Relationships
    application = relationship("Application", back_populates="audit_logs")

    def __repr__(self) -> str:
        return f"<AuditLog {self.event_type} @ {self.created_at}>"
