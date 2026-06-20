"""
Application model — represents an SME loan application through
all stages of the FinPal intake pipeline.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Numeric, DateTime, Integer, JSON, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class ApplicationStatus(str, enum.Enum):
    draft              = "draft"
    submitted          = "submitted"
    documents_uploaded = "documents_uploaded"
    idp_processing     = "idp_processing"
    ccr_check          = "ccr_check"
    ai_assessment      = "ai_assessment"
    hitl_queue         = "hitl_queue"
    approved           = "approved"
    declined           = "declined"
    referred           = "referred"
    withdrawn          = "withdrawn"


class Application(Base):
    __tablename__ = "applications"

    id:            Mapped[str]   = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference:     Mapped[str]   = mapped_column(String(20), unique=True, nullable=False, index=True)
    # Borrower / company
    company_name:  Mapped[str]   = mapped_column(String(255), nullable=False)
    crn:           Mapped[str]   = mapped_column(String(20), nullable=False)
    sector:        Mapped[str]   = mapped_column(String(100), nullable=False)
    director_name: Mapped[str]   = mapped_column(String(200), nullable=False)
    director_email:Mapped[str]   = mapped_column(String(255), nullable=False)
    director_phone:Mapped[str]   = mapped_column(String(50), nullable=False)
    address:       Mapped[str]   = mapped_column(String(500), nullable=False)
    eircode:       Mapped[str | None] = mapped_column(String(10), nullable=True)
    years_trading: Mapped[str]   = mapped_column(String(20), nullable=False)
    # Loan
    loan_amount:   Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    loan_purpose:  Mapped[str]   = mapped_column(String(100), nullable=False)
    loan_term_months: Mapped[int]= mapped_column(Integer, nullable=False)
    purpose_detail:Mapped[str]   = mapped_column(Text, nullable=False)
    has_collateral:Mapped[bool]  = mapped_column(default=False)
    collateral_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Financials (declared)
    annual_revenue:    Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    net_profit:        Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    total_assets:      Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    total_liabilities: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    existing_debt:     Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    monthly_repayment: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    # AI assessment output (populated after processing)
    ai_score:       Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    risk_grade:     Mapped[str | None]   = mapped_column(String(5), nullable=True)
    pd:             Mapped[float | None] = mapped_column(Numeric(6, 4), nullable=True)
    dscr:           Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)
    apr:            Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)
    affordability:  Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    lgd:            Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    ead:            Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    ecl_12m:        Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    ecl_lifetime:   Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    ifrs9_stage:    Mapped[int | None]   = mapped_column(Integer, nullable=True)
    shap_codes:     Mapped[dict | None]  = mapped_column(JSON, nullable=True)
    rules_output:   Mapped[dict | None]  = mapped_column(JSON, nullable=True)
    narrative:      Mapped[str | None]   = mapped_column(Text, nullable=True)
    recommendation: Mapped[str | None]   = mapped_column(String(20), nullable=True)
    # GDPR consents (EU AI Act Art.22)
    consent_data_processing: Mapped[bool] = mapped_column(default=False)
    consent_ccr:             Mapped[bool] = mapped_column(default=False)
    consent_ai_decision:     Mapped[bool] = mapped_column(default=False)
    consent_timestamp:       Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # Status and metadata
    status:        Mapped[ApplicationStatus] = mapped_column(SAEnum(ApplicationStatus), default=ApplicationStatus.draft, nullable=False)
    borrower_id:   Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    model_version: Mapped[str]   = mapped_column(String(50), default="finpal-pd-v2.4.1")
    created_at:    Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at:    Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    documents = relationship("Document", back_populates="application", lazy="select")
    decisions = relationship("Decision", back_populates="application", lazy="select")
    audit_logs = relationship("AuditLog", back_populates="application", lazy="select")

    def __repr__(self) -> str:
        return f"<Application {self.reference} ({self.status})>"