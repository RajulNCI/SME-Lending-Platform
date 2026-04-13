"""Audit schemas."""
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class AuditLogOut(BaseModel):
    id: str
    event_type: str
    application_id: Optional[str] = None
    actor_username: Optional[str] = None
    description: str
    payload: Optional[dict[str, Any]] = None
    entry_hash: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class EvidenceBundle(BaseModel):
    """Complete evidence package — exported per EU AI Act Art.12."""
    application_id: str
    application_reference: str
    company_name: str
    loan_amount: float
    loan_purpose: str
    decision_outcome: Optional[str] = None
    risk_grade: Optional[str] = None
    model_version: str
    ai_score: Optional[float] = None
    pd: Optional[float] = None
    shap_codes: Optional[list[dict[str, Any]]] = None
    ifrs9_stage: Optional[int] = None
    approver_username: Optional[str] = None
    rationale: Optional[str] = None
    consent_data_processing: bool
    consent_ccr: bool
    consent_ai_decision: bool
    consent_timestamp: Optional[datetime] = None
    decided_at: Optional[datetime] = None
    integrity_hash: Optional[str] = None
    retrieved_by: str
    retrieved_at: datetime
    audit_events: list[AuditLogOut] = []