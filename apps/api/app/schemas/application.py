"""Application schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, field_validator


class ApplicationCreate(BaseModel):
    """Submitted by borrower via loan application form."""

    company_name: str
    crn: str
    sector: str
    director_name: str
    director_email: str
    director_phone: str
    address: str
    eircode: str | None = None
    years_trading: str
    loan_amount: Decimal
    loan_purpose: str
    loan_term_months: int
    purpose_detail: str
    has_collateral: bool = False
    collateral_detail: str | None = None
    annual_revenue: Decimal | None = None
    net_profit: Decimal | None = None
    total_assets: Decimal | None = None
    total_liabilities: Decimal | None = None
    existing_debt: Decimal | None = None
    monthly_repayment: Decimal | None = None
    consent_data_processing: bool
    consent_ccr: bool
    consent_ai_decision: bool

    @field_validator("loan_amount")
    @classmethod
    def min_loan(cls, v: Decimal) -> Decimal:
        if v < 10000:
            raise ValueError("Minimum loan amount is €10,000")
        return v

    @field_validator("consent_data_processing", "consent_ccr", "consent_ai_decision")
    @classmethod
    def must_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("All consents are required to proceed")
        return v


class AIAssessmentUpdate(BaseModel):
    """Posted by Nathan's Credit Officer AI agent."""

    ai_score: float | None = None
    risk_grade: str | None = None
    pd: float | None = None
    dscr: float | None = None
    apr: float | None = None
    affordability: float | None = None
    ecl_12m: float | None = None
    shap_codes: list[dict[str, Any]] | None = None
    ifrs9_stage: int | None = None
    model_version: str = "finpal-pd-v2.4.1"


class ApplicationOut(BaseModel):
    id: str
    reference: str
    company_name: str
    crn: str
    sector: str
    loan_amount: Decimal
    loan_purpose: str
    loan_term_months: int
    status: str
    risk_grade: str | None = None
    pd: float | None = None
    dscr: float | None = None
    apr: float | None = None
    ai_score: float | None = None
    ifrs9_stage: int | None = None
    shap_codes: list[dict[str, Any]] | None = None
    model_version: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApplicationListOut(BaseModel):
    id: str
    reference: str
    company_name: str
    sector: str
    loan_amount: Decimal
    loan_purpose: str
    status: str
    risk_grade: str | None = None
    pd: float | None = None
    dscr: float | None = None
    ifrs9_stage: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProgressOut(BaseModel):
    step: int
    total_steps: int
    completed: bool
