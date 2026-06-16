"""
test_worker.py — Phase E end-to-end: submit -> worker runs OCR+AI -> status progresses.

Creates an application with an attached document, runs the worker (as the queue consumer would),
then shows the real step progression and the final assessment. Run against the DB:

    .venv/Scripts/python scripts/test_worker.py
"""

import asyncio
import os
import sys
import uuid
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import delete, select

import app.models  # noqa: F401
from app.core.database import AsyncSessionLocal, Base, engine
from app.models.application import Application, ApplicationStatus
from app.models.document import Document
from app.models.processing_job import JobStatus, ProcessingJob
from app.services.ai.worker import process_job

SAMPLE_PDF = Path(__file__).resolve().parent / "sample_docs" / "finpal_sme_pdf_07.pdf"


async def main() -> int:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        ref = "WJOB-" + uuid.uuid4().hex[:8].upper()
        app_row = Application(
            reference=ref,
            status=ApplicationStatus.draft,
            company_name="Placeholder Ltd",
            crn="000000",
            sector="Retail",
            director_name="N A",
            director_email="n@a.ie",
            director_phone="+353 0",
            address="1 Test St",
            years_trading="1",
            loan_amount=50_000,
            loan_purpose="Working Capital",
            loan_term_months=36,
            purpose_detail="test",
            has_collateral=False,
        )
        db.add(app_row)
        await db.flush()
        app_id = app_row.id
        db.add(
            Document(
                application_id=app_id,
                doc_type="FINANCIALS",
                filename=SAMPLE_PDF.name,
                s3_key=str(SAMPLE_PDF),
                content_type="application/pdf",
                size_bytes=SAMPLE_PDF.stat().st_size,
            )
        )
        job = ProcessingJob(
            application_id=app_id, status=JobStatus.queued, progress=0, steps_log=[]
        )
        db.add(job)
        await db.commit()
        job_id = job.id
        print(f"created application {ref} + job {job_id[:8]} (queued)\n")

    # the worker consumes the job (same call the queue loop makes)
    await process_job(job_id)

    async with AsyncSessionLocal() as db:
        job = (
            await db.execute(select(ProcessingJob).where(ProcessingJob.id == job_id))
        ).scalar_one()
        app_row = (
            await db.execute(select(Application).where(Application.id == app_id))
        ).scalar_one()

        print("step progression (real, from worker):")
        for s in job.steps_log or []:
            print(f"   {s['step']}")
        print(f"\njob status   : {job.status.value}  (progress {job.progress}%)")
        print(f"app status   : {app_row.status.value}")
        print(
            f"extracted    : {app_row.company_name} | {app_row.sector} | "
            f"revenue €{float(app_row.annual_revenue or 0):,.0f}"
        )
        print(
            f"assessment   : grade {app_row.risk_grade} | PD {float(app_row.pd or 0):.1%} | "
            f"DSCR {app_row.dscr} | IFRS9 stage {app_row.ifrs9_stage} | "
            f"ECL €{float(app_row.ecl_12m or 0):,.0f}"
        )

        ok = (
            job.status == JobStatus.completed
            and job.progress == 100
            and app_row.status == ApplicationStatus.hitl_queue
            and app_row.pd is not None
            and [s["step"] for s in (job.steps_log or [])][-1] == "COMPLETED"
            and app_row.company_name != "Placeholder Ltd"
        )  # proves extraction overwrote it

        # cleanup
        await db.execute(delete(Document).where(Document.application_id == app_id))
        await db.execute(
            delete(ProcessingJob).where(ProcessingJob.application_id == app_id)
        )
        await db.execute(delete(Application).where(Application.id == app_id))
        await db.commit()

    print("\nRESULT:", "ALL CHECKS PASSED" if ok else "CHECKS FAILED")
    await engine.dispose()
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
