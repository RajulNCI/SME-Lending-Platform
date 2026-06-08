"""
Async processing endpoints — mirrors the team HLD (submit -> queue -> worker -> poll status).

POST /api/v1/applications/{id}/submit  -> create a processing job, enqueue, return immediately
GET  /api/v1/applications/{id}/status  -> live status/step/progress from the worker
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.application import Application, ApplicationStatus
from app.models.processing_job import JobStatus, ProcessingJob
from app.schemas.processing import StatusOut, SubmitOut
from app.services.audit_service import AuditService
from app.services.queue import job_queue

router = APIRouter(tags=["processing"])


@router.post("/applications/{application_id}/submit", response_model=SubmitOut,
             summary="Submit application for async processing")
async def submit_application(
    application_id: str,
    token_data: dict = Depends(require_roles("borrower_sme", "credit_officer", "ops_manager", "it_admin")),
    db: AsyncSession = Depends(get_db),
) -> SubmitOut:
    app = (await db.execute(
        select(Application).where(Application.id == application_id))).scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    job = ProcessingJob(application_id=application_id, status=JobStatus.queued,
                        current_step=None, progress=0, steps_log=[])
    db.add(job)
    app.status = ApplicationStatus.submitted
    await db.flush()

    await AuditService.log(
        db=db, event_type="application.submitted", application_id=application_id,
        actor_id=token_data["sub"], actor_username=token_data.get("username"),
        description=f"Submitted for processing (job {job.id[:8]})",
        payload={"job_id": job.id},
    )
    await db.commit()
    await job_queue.enqueue(job.id)        # worker picks it up asynchronously

    return SubmitOut(application_id=application_id, job_id=job.id,
                     status="SUBMITTED", message="Application submitted for processing")


@router.get("/applications/{application_id}/status", response_model=StatusOut,
            summary="Poll async processing status")
async def get_status(
    application_id: str,
    token_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StatusOut:
    job = (await db.execute(
        select(ProcessingJob)
        .where(ProcessingJob.application_id == application_id)
        .order_by(ProcessingJob.created_at.desc()))).scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="No processing job for this application")
    return StatusOut(
        application_id=application_id, job_id=job.id, status=job.status.value,
        current_step=job.current_step, progress=job.progress, error=job.error,
    )
