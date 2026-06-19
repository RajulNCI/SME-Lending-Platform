"""
Lambda entry point for the async document processing worker.

Flow: SQS event → download doc from S3 → IDP extraction → AI assessment
      → rules engine → persist result to RDS → update ProcessingJob status
"""

import json
import logging
import os

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client("s3")
MODELS_BUCKET = os.environ["S3_MODELS_BUCKET"]


def handler(event: dict, context) -> dict:
    for record in event.get("Records", []):
        body = json.loads(record["body"])
        application_id = body["application_id"]
        try:
            _process_application(application_id, body)
        except Exception as exc:
            logger.exception("Failed processing application %s", application_id)
            _update_job_status(application_id, "failed", error=str(exc))
            raise  # Re-raise so SQS retries (up to maxReceiveCount = 3)
    return {"statusCode": 200}


def _process_application(application_id: str, payload: dict) -> None:
    from app.services.ai.assessment_service import AssessmentService
    from app.services.ai.idp.extractor import FinPalExtractor
    from app.services.rules_engine.engine import RulesEngine

    _update_job_status(application_id, "processing", step="OCR_STARTED")

    # 1. Download uploaded documents from S3
    doc_paths = _download_documents(payload.get("s3_keys", []))

    # 2. IDP extraction
    _update_job_status(application_id, "processing", step="AI_EXTRACTION")
    extractor = FinPalExtractor()
    extracted = {}
    for path in doc_paths:
        fields = extractor.extract(path)
        extracted.update({k: v for k, v in fields.items() if v is not None})

    # 3. AI credit assessment
    _update_job_status(application_id, "processing", step="RISK_SCORING")
    assessment = AssessmentService().assess(extracted)

    # 4. Rules engine
    rules_result = RulesEngine().evaluate(extracted, assessment)

    # 5. Merge and persist
    result = {**assessment, "rules_engine": rules_result}
    _persist_result(application_id, extracted, result)
    _update_job_status(
        application_id, "completed", step="DECISION_GENERATED", progress=100
    )
    logger.info("Application %s processed successfully", application_id)


def _download_documents(s3_keys: list[str]) -> list[str]:
    import tempfile

    paths = []
    for key in s3_keys:
        tmp = tempfile.NamedTemporaryFile(
            suffix=os.path.splitext(key)[-1], delete=False
        )
        s3.download_fileobj(MODELS_BUCKET, key, tmp)
        tmp.close()
        paths.append(tmp.name)
    return paths


def _persist_result(application_id: str, extracted: dict, result: dict) -> None:
    import asyncio

    from sqlalchemy import update

    from app.core.database import AsyncSessionLocal
    from app.models.application import Application

    async def _write():
        async with AsyncSessionLocal() as session:
            await session.execute(
                update(Application)
                .where(Application.id == application_id)
                .values(
                    ai_score=result.get("ai_score"),
                    risk_grade=result.get("risk_grade"),
                    pd=result.get("pd"),
                    dscr=result.get("dscr"),
                    apr=result.get("apr"),
                    affordability=result.get("affordability"),
                    ecl_12m=result.get("ecl_12m"),
                    ifrs9_stage=result.get("ifrs9_stage"),
                    shap_codes=result.get("shap_codes"),
                    model_version=result.get("model_version"),
                    # Extracted company fields (fill blanks from OCR)
                    company_name=extracted.get("company_name"),
                    annual_revenue=extracted.get("annual_revenue"),
                    net_profit=extracted.get("net_profit"),
                    total_assets=extracted.get("total_assets"),
                    total_liabilities=extracted.get("total_liabilities"),
                    status="hitl_queue",
                )
            )
            await session.commit()

    asyncio.run(_write())


def _update_job_status(
    application_id: str,
    status: str,
    step: str | None = None,
    progress: int | None = None,
    error: str | None = None,
) -> None:
    import asyncio

    from sqlalchemy import update

    from app.core.database import AsyncSessionLocal
    from app.models.processing_job import ProcessingJob

    async def _write():
        async with AsyncSessionLocal() as session:
            values: dict = {"status": status}
            if step:
                values["current_step"] = step
            if progress is not None:
                values["progress"] = progress
            if error:
                values["error"] = error
            await session.execute(
                update(ProcessingJob)
                .where(ProcessingJob.application_id == application_id)
                .values(**values)
            )
            await session.commit()

    asyncio.run(_write())
