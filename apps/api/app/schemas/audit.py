"""Audit schemas."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AuditLogOut(BaseModel):
    id: str
    event_type: str
    application_id: str | None = None
    actor_username: str | None = None
    description: str
    payload: dict[str, Any] | None = None
    entry_hash: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class EvidenceBundle(BaseModel):
    """Complete evidence package — exported per EU AI Act Art.12."""

    application_id: str
    application_reference: str
    company_name: str
    loan_amount: float
    loan_purpose: str
    decision_outcome: str | None = None
    risk_grade: str | None = None
    model_version: str
    ai_score: float | None = None
    pd: float | None = None
    shap_codes: list[dict[str, Any]] | None = None
    ifrs9_stage: int | None = None
    approver_username: str | None = None
    rationale: str | None = None
    consent_data_processing: bool
    consent_ccr: bool
    consent_ai_decision: bool
    consent_timestamp: datetime | None = None
    decided_at: datetime | None = None
    integrity_hash: str | None = None
    retrieved_by: str
    retrieved_at: datetime
    audit_events: list[AuditLogOut] = []
