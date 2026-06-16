"""
ProcessingJob model — tracks asynchronous processing of an application.

Mirrors the team HLD: on submit a job is enqueued; a worker runs OCR -> AI -> decision
and writes real status/progress here, which the borrower UI polls.
"""

import enum
import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class JobStatus(str, enum.Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"


# ordered processing steps (mirrors Borrower API Details)
STEPS = [
    "OCR_STARTED",
    "OCR_COMPLETED",
    "AI_EXTRACTION",
    "RISK_SCORING",
    "DECISION_GENERATED",
    "COMPLETED",
]


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    application_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("applications.id"), nullable=False, index=True
    )
    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus), default=JobStatus.queued, nullable=False
    )
    current_step: Mapped[str | None] = mapped_column(String(40), nullable=True)
    progress: Mapped[int] = mapped_column(Integer, default=0)  # 0..100
    steps_log: Mapped[list[dict[str, str]] | None] = mapped_column(
        JSON, nullable=True
    )  # [{step, at}]
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    application = relationship("Application")

    def __repr__(self) -> str:
        return f"<ProcessingJob {self.id[:8]} {self.status} {self.current_step}>"
