"""Schemas for async submit / status."""

from pydantic import BaseModel


class SubmitOut(BaseModel):
    application_id: str
    job_id: str
    status: str
    message: str


class StatusOut(BaseModel):
    application_id: str
    job_id: str
    status: str  # queued | processing | completed | failed
    current_step: str | None
    progress: int  # 0..100
    error: str | None = None
