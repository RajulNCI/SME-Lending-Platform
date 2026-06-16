"""Schemas for the AI credit assessment (Engine 2 output)."""

from pydantic import BaseModel


class ReasonCode(BaseModel):
    feature: str
    direction: str  # increases_risk | reduces_risk
    weight: float


class AssessmentIn(BaseModel):
    """Application fields for the stateless /assess endpoint (no DB).

    The backend sends these; the AI returns the assessment JSON to persist (DynamoDB).
    Missing financials are imputed by the feature builder.
    """

    sector: str = "Wholesale"
    years_trading: str | int | None = None
    annual_revenue: float
    ebitda: float | None = None
    net_profit: float | None = None
    total_assets: float | None = None
    total_liabilities: float | None = None
    existing_debt: float | None = None
    monthly_repayment: float | None = None
    loan_amount: float
    loan_term_months: int | None = 36
    loan_purpose: str = "Working Capital"
    has_collateral: bool = False
    reference: str | None = None  # optional client id, echoed back as application_id


class AssessmentOut(BaseModel):
    application_id: str | None = None
    pd: float
    risk_grade: str
    ai_score: float
    dscr: float
    apr: float
    affordability: float
    lgd: float
    ead: float
    ecl_12m: float
    ifrs9_stage: int
    shap_codes: list[ReasonCode]
    recommendation: str
    model_version: str
    narrative: str
