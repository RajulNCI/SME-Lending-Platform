"""Decision schemas."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, field_validator


class DecisionCreate(BaseModel):
    """Posted by Credit Officer when making a HITL decision."""

    outcome: str  # approved | declined | referred
    rationale: str

    @field_validator("outcome")
    @classmethod
    def valid_outcome(cls, v: str) -> str:
        if v not in ("approved", "declined", "referred"):
            raise ValueError("outcome must be: approved, declined, or referred")
        return v

    @field_validator("rationale")
    @classmethod
    def min_rationale(cls, v: str) -> str:
        if len(v.strip()) < 20:
            raise ValueError(
                "Rationale must be at least 20 characters (EU AI Act Art.12)"
            )
        return v


class DecisionOut(BaseModel):
    id: str
    application_id: str
    officer_id: str
    outcome: str
    rationale: str
    model_version: str = "finpal-pd-v2.4.1"
    ai_score: float | None = None
    risk_grade: str | None = None
    shap_snapshot: list[dict[str, Any]] | None = None
    decided_at: datetime
    integrity_hash: str | None = None

    model_config = {"from_attributes": True}
