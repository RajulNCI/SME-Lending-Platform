"""
Decision model — immutable record of every credit decision.
Written once, never updated. EU AI Act Art.12 compliant.
"""

import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DecisionOutcome(str, enum.Enum):
    approved = "approved"
    declined = "declined"
    referred = "referred"


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    application_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("applications.id"), nullable=False, index=True
    )
    officer_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    outcome: Mapped[DecisionOutcome] = mapped_column(
        SAEnum(DecisionOutcome), nullable=False
    )
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    # Snapshot of AI assessment at time of decision (immutable)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    ai_score: Mapped[float | None] = mapped_column(nullable=True)
    risk_grade: Mapped[str | None] = mapped_column(String(5), nullable=True)
    shap_snapshot: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Immutable timestamp — set once, never changed
    decided_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    # SHA-256 hash for tamper-evidence (NFR-002)
    integrity_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Relationships
    application = relationship("Application", back_populates="decisions")
    officer = relationship("User", foreign_keys=[officer_id])

    def __repr__(self) -> str:
        return f"<Decision {self.id} — {self.outcome} on {self.application_id}>"
