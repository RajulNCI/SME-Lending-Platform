"""
intake — simplified application submission for the React borrower form.

Flow:
  1. Accept minimal form fields (company, sector, amount, documents)
  2. Save Application + ProcessingJob to RDS
  3. Upload documents to S3
  4. Send SQS message → Lambda AI worker picks it up asynchronously
  5. Return app_id immediately — UI polls /status for progress
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.models.application import Application, ApplicationStatus
from app.models.processing_job import JobStatus, ProcessingJob
from app.models.user import User, UserRole
from app.services.queue import job_queue

router = APIRouter(tags=["intake"])

_s3 = boto3.client("s3", region_name=settings.AWS_REGION)

PURPOSE_MAP = {
    "WORKING_CAPITAL": "Working Capital",
    "EQUIPMENT_FINANCE": "Equipment Finance",
    "EXPANSION": "Expansion",
    "COMMERCIAL_MORTGAGE": "Commercial Mortgage",
    "REFINANCE": "Refinance",
    "OTHER": "Other",
}


@router.post("/applications/submit", summary="Borrower application submission")
async def submit_application(
    companyName: str = Form("Borrower SME Ltd"),
    sector: str = Form("Technology"),
    loanAmount: str = Form("50000"),
    loanType: str = Form("WORKING_CAPITAL"),
    requestedBy: Optional[str] = Form(None),
    files: list[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
) -> dict:
    import random

    app_id = str(uuid.uuid4())
    job_id = str(uuid.uuid4())
    reference = f"FP-{datetime.now().year}-{random.randint(1000, 9999)}"
    now = datetime.now(timezone.utc)

    # 1. Upload documents to S3, collect keys
    s3_document_keys: list[str] = []
    for upload in files:
        if not upload.filename:
            continue
        key = f"documents/{app_id}/{upload.filename}"
        try:
            content = await upload.read()
            _s3.put_object(
                Bucket=settings.AWS_S3_DOCUMENTS_BUCKET,
                Key=key,
                Body=content,
                ContentType=upload.content_type or "application/octet-stream",
            )
            s3_document_keys.append(key)
        except (BotoCoreError, ClientError):
            pass  # non-fatal — Lambda will still run with whatever was uploaded

    # 2. Ensure borrower exists in users table (upsert)
    borrower_db_id: str | None = None
    if requestedBy:
        result = await db.execute(select(User).where(User.username == requestedBy))
        user = result.scalar_one_or_none()
        if not user:
            user = User(
                username=requestedBy,
                email=requestedBy if "@" in requestedBy else f"{requestedBy}@finpal.ie",
                display_name=requestedBy,
                role=UserRole.borrower_sme,
                is_active=True,
                hashed_pw="cognito",
            )
            db.add(user)
            await db.flush()
        borrower_db_id = user.id

    # 3. Save Application to RDS
    app = Application(
        id=app_id,
        reference=reference,
        company_name=companyName,
        crn=f"CRN-{random.randint(100000, 999999)}",
        sector=sector,
        director_name=requestedBy or "Demo Director",
        director_email=f"{(requestedBy or 'demo').replace(' ', '.').lower()}@example.com",
        director_phone="+353 1 234 5678",
        address="123 Demo Street, Dublin",
        eircode="D01 AB12",
        years_trading="5",
        loan_amount=float(loanAmount),
        loan_purpose=PURPOSE_MAP.get(loanType, loanType),
        loan_term_months=36,
        purpose_detail=f"{PURPOSE_MAP.get(loanType, loanType)} loan for {companyName}",
        has_collateral=False,
        annual_revenue=500_000,
        net_profit=75_000,
        total_assets=800_000,
        total_liabilities=300_000,
        existing_debt=50_000,
        monthly_repayment=2_500,
        consent_data_processing=True,
        consent_ccr=True,
        consent_ai_decision=True,
        consent_timestamp=now,
        borrower_id=borrower_db_id,
        status=ApplicationStatus.submitted,
    )
    db.add(app)

    # 4. Create ProcessingJob so UI can poll progress
    job = ProcessingJob(
        id=job_id,
        application_id=app_id,
        status=JobStatus.pending,
        current_step=None,
        progress=0,
        steps_log=[],
    )
    db.add(job)
    await db.commit()

    # 5. Enqueue message — Lambda AI worker picks it up from SQS
    message = {
        "job_id": job_id,
        "application_id": app_id,
        "s3_document_keys": s3_document_keys,
    }
    await job_queue.enqueue(message)

    return {
        "id": app_id,
        "applicationId": app_id,
        "jobId": job_id,
        "reference": reference,
        "status": "SUBMITTED",
        "createdAt": now.isoformat(),
        "message": "Application submitted — AI processing started",
    }
