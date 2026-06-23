"""
Application model — represents an SME loan application through
all stages of the FinPal intake pipeline.
"""

import enum
import uuid
from datetime import UTC, date, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ApplicationStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    documents_uploaded = "documents_uploaded"
    idp_processing = "idp_processing"
    ccr_check = "ccr_check"
    ai_assessment = "ai_assessment"
    hitl_queue = "hitl_queue"
    approved = "approved"
    declined = "declined"
    referred = "referred"
    withdrawn = "withdrawn"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    reference: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )
    # Borrower / company
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    crn: Mapped[str] = mapped_column(String(20), nullable=False)
    sector: Mapped[str] = mapped_column(String(100), nullable=False)
    director_name: Mapped[str] = mapped_column(String(200), nullable=False)
    director_email: Mapped[str] = mapped_column(String(255), nullable=False)
    director_phone: Mapped[str] = mapped_column(String(50), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    eircode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    years_trading: Mapped[str] = mapped_column(String(20), nullable=False)
    # Loan
    loan_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    loan_purpose: Mapped[str] = mapped_column(String(100), nullable=False)
    loan_term_months: Mapped[int] = mapped_column(Integer, nullable=False)
    purpose_detail: Mapped[str] = mapped_column(Text, nullable=False)
    has_collateral: Mapped[bool] = mapped_column(default=False)
    collateral_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Financials (declared — extracted from credit file)
    annual_revenue: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    ebitda: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    net_profit: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    total_assets: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    total_liabilities: Mapped[float | None] = mapped_column(
        Numeric(14, 2), nullable=True
    )
    existing_debt: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    free_cash_flow: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    monthly_repayment: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    annual_debt_service: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    # Open banking (bank statement)
    iban: Mapped[str | None] = mapped_column(String(40), nullable=True)
    account_mask: Mapped[str | None] = mapped_column(String(20), nullable=True)
    statement_period: Mapped[str | None] = mapped_column(String(50), nullable=True)
    actual_revenue: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    monthly_lodgements: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # Tax clearance (compliance)
    tax_reg_no: Mapped[str | None] = mapped_column(String(30), nullable=True)
    tax_access_no: Mapped[str | None] = mapped_column(String(30), nullable=True)
    tax_clearance_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    tax_clearance_issued: Mapped[date | None] = mapped_column(Date, nullable=True)
    tax_clearance_valid_until: Mapped[date | None] = mapped_column(Date, nullable=True)
    # Director ID / KYC (AML)
    director_dob: Mapped[date | None] = mapped_column(Date, nullable=True)
    director_id_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    director_nationality: Mapped[str | None] = mapped_column(String(100), nullable=True)
    id_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    # AI assessment output (populated after processing)
    ai_score: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    risk_grade: Mapped[str | None] = mapped_column(String(5), nullable=True)
    pd: Mapped[float | None] = mapped_column(Numeric(6, 4), nullable=True)
    dscr: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)
    apr: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)
    affordability: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    lgd: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    ead: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    ecl_12m: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    ecl_lifetime: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    ifrs9_stage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    shap_codes: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    rules_output: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    narrative: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommendation: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # GDPR consents (EU AI Act Art.22) — 4 consents from consent form
    consent_data_processing: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_ccr: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_ai_decision: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_data_retention: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_timestamp: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    # Status and metadata
    status: Mapped[ApplicationStatus] = mapped_column(
        SAEnum(ApplicationStatus), default=ApplicationStatus.draft, nullable=False
    )
    borrower_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    model_version: Mapped[str] = mapped_column(String(50), default="finpal-pd-v2.4.1")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    # Relationships
    documents = relationship("Document", back_populates="application", lazy="select")
    decisions = relationship("Decision", back_populates="application", lazy="select")
    audit_logs = relationship("AuditLog", back_populates="application", lazy="select")

    def __repr__(self) -> str:
        return f"<Application {self.reference} ({self.status})>"
