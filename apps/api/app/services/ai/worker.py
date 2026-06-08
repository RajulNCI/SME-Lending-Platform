"""
worker — asynchronous processing of a submitted application (mirrors the team HLD worker).

Consumes a job, then runs the real pipeline writing genuine status/progress to the DB:
  OCR_STARTED -> OCR_COMPLETED  (Engine 1: parse/OCR documents -> extract fields)
  AI_EXTRACTION -> RISK_SCORING -> DECISION_GENERATED -> COMPLETED  (Engine 2: PD + metrics)
The borrower UI polls /status to see these steps live.
"""
from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.application import Application, ApplicationStatus
from app.models.document import Document
from app.models.processing_job import STEPS, JobStatus, ProcessingJob

ASSESS_FIELDS = ("sector", "years_trading", "annual_revenue", "ebitda", "net_profit",
                 "total_assets", "total_liabilities", "existing_debt", "monthly_repayment",
                 "loan_amount", "loan_term_months", "loan_purpose", "has_collateral")


def _extract_from_paths(paths: list[str]) -> dict:
    """Engine 1 (blocking): parse/OCR each document and merge extracted fields."""
    from app.services.ai.idp.extractor import extract_document
    merged: dict = {}
    for p in paths:
        path = Path(p)
        if path.exists():
            try:
                merged.update(extract_document(path))
            except Exception:  # noqa: BLE001
                pass
    return merged


def _run_assessment(data: dict) -> dict:
    from app.services.ai.assessment_service import assess
    return assess(data)


async def _step(db, job, app, step, app_status=None, pause=0.0):
    job.current_step = step
    job.progress = int((STEPS.index(step) + 1) / len(STEPS) * 100)
    log = list(job.steps_log or [])
    log.append({"step": step, "at": datetime.now(timezone.utc).isoformat()})
    job.steps_log = log
    if app_status is not None:
        app.status = app_status
    await db.commit()
    if pause:
        await asyncio.sleep(pause)


async def process_job(job_id: str, session_factory=AsyncSessionLocal) -> None:
    async with session_factory() as db:
        job = (await db.execute(
            select(ProcessingJob).where(ProcessingJob.id == job_id))).scalar_one_or_none()
        if job is None:
            return
        app = (await db.execute(
            select(Application).where(Application.id == job.application_id))).scalar_one_or_none()
        if app is None:
            job.status, job.error = JobStatus.failed, "application not found"
            await db.commit()
            return

        try:
            job.status = JobStatus.processing
            await db.commit()

            # ---- Engine 1: documents -> fields ----
            await _step(db, job, app, "OCR_STARTED", ApplicationStatus.idp_processing)
            docs = (await db.execute(
                select(Document).where(Document.application_id == app.id))).scalars().all()
            paths = [d.s3_key for d in docs]
            extracted = await asyncio.to_thread(_extract_from_paths, paths)
            for k, v in extracted.items():
                if hasattr(app, k) and v is not None:
                    setattr(app, k, v)
            await _step(db, job, app, "OCR_COMPLETED")

            # ---- Engine 2: PD + credit metrics -> decision ----
            await _step(db, job, app, "AI_EXTRACTION", ApplicationStatus.ai_assessment)
            data = {f: getattr(app, f, None) for f in ASSESS_FIELDS}
            # overlay freshly extracted fields (e.g. EBITDA has no DB column but feeds the model)
            data.update({k: v for k, v in extracted.items()
                         if k in ASSESS_FIELDS and v is not None})
            result = await asyncio.to_thread(_run_assessment, data)

            from app.services.ai.assessment_service import apply_to_orm
            apply_to_orm(app, result)
            await _step(db, job, app, "RISK_SCORING")
            await _step(db, job, app, "DECISION_GENERATED")
            await _step(db, job, app, "COMPLETED", ApplicationStatus.hitl_queue)

            job.status = JobStatus.completed
            await db.commit()
        except Exception as exc:  # noqa: BLE001
            job.status = JobStatus.failed
            job.error = f"{type(exc).__name__}: {exc}"
            await db.commit()


async def worker_loop(queue, session_factory=AsyncSessionLocal) -> None:
    """Long-running consumer: dequeue job ids and process them."""
    while True:
        job_id = await queue.dequeue()
        try:
            await process_job(job_id, session_factory)
        finally:
            if hasattr(queue, "task_done"):
                queue.task_done()
