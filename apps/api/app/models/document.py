"""
Document model — uploaded files (P&L, bank statements, ID, etc.)
stored in S3. Only metadata is stored in DB.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id:             Mapped[str]  = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id: Mapped[str]  = mapped_column(String(36), ForeignKey("applications.id"), nullable=False, index=True)
    doc_type:       Mapped[str]  = mapped_column(String(50), nullable=False)
    filename:       Mapped[str]  = mapped_column(String(255), nullable=False)
    s3_key:         Mapped[str]  = mapped_column(String(500), nullable=False)
    content_type:   Mapped[str]  = mapped_column(String(100), nullable=False)
    size_bytes:     Mapped[int]  = mapped_column(Integer, nullable=False)
    is_processed:   Mapped[bool] = mapped_column(Boolean, default=False)
    extracted_data: Mapped[str | None] = mapped_column(String(36), nullable=True)
    uploaded_at:    Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    application = relationship("Application", back_populates="documents")

    def __repr__(self) -> str:
        return f"<Document {self.doc_type} — {self.filename}>"