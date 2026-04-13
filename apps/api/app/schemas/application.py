"""Application schemas."""
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, Any
from datetime import datetime
from decimal import Decimal


class ApplicationCreate(BaseModel):
    """Submitted by borrower via loan application form."""
    company_name: str
    crn: str
    sector: str
    director_name: str
    director_email: str
    director_phone: str
    address: str
    eircode: Optional[str] = None
    years_trading: str
    loan_amount: Decimal
    loan_purpose: str
    loan_term_months: int
    purpose_detail: str
    has_collateral: bool = False
    collateral_detail: Optional[str] = None
    annual_revenue: Optional[Decimal] = None
    net_profit: Optional[Decimal] = None
    total_assets: Optional[Decimal] = None
    total_liabilities: Optional[Decimal] = None
    existing_debt: Optional[Decimal] = None
    monthly_repayment: Optional[Decimal] = None
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
    ai_score: Optional[float] = None
    risk_grade: Optional[str] = None
    pd: Optional[float] = None
    dscr: Optional[float] = None
    apr: Optional[float] = None
    affordability: Optional[float] = None
    ecl_12m: Optional[float] = None
    shap_codes: Optional[list[dict[str, Any]]] = None
    ifrs9_stage: Optional[int] = None
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
    risk_grade: Optional[str] = None
    pd: Optional[float] = None
    dscr: Optional[float] = None
    apr: Optional[float] = None
    ai_score: Optional[float] = None
    ifrs9_stage: Optional[int] = None
    shap_codes: Optional[list[dict[str, Any]]] = None
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
    risk_grade: Optional[str] = None
    pd: Optional[float] = None
    dscr: Optional[float] = None
    ifrs9_stage: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}