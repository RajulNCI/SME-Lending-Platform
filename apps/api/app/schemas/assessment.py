"""Schemas for the AI credit assessment (Engine 2 output)."""
from pydantic import BaseModel


class ReasonCode(BaseModel):
    feature: str
    direction: str          # increases_risk | reduces_risk
    weight: float


class AssessmentOut(BaseModel):
    application_id: str
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
