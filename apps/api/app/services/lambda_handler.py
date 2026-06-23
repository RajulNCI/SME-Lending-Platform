"""
Lambda entry point — AI processing worker.

Triggered by SQS. Each SQS record carries:
  {
    "job_id": "<processing_job uuid>",
    "application_id": "<application uuid>",
    "s3_document_keys": ["documents/<app_id>/file.pdf", ...]
  }

Pipeline:
  SQS event
    → download documents from S3
    → IDP extraction (CRF model)
    → PD scoring + credit metrics (LightGBM model)
    → Rules engine (pure Python, no model file needed)
    → write results to RDS (pg8000, pure Python — no C deps in Lambda)

Environment variables required (set in Lambda console):
  DB_HOST, DB_NAME, DB_USER, DB_PASS
  S3_MODELS_BUCKET
  S3_DOCUMENTS_BUCKET
  AWS_REGION (auto-set by Lambda)
"""

from __future__ import annotations

import json
import logging
import os
import sys
import tempfile

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)


# Install AI packages at cold start into /tmp (Lambda has no pre-installed sklearn/lightgbm)
def _bootstrap_packages():
    import subprocess

    pkgs = [
        "numpy",
        "pandas",
        "scikit-learn",
        "lightgbm",
        "shap",
        "joblib",
        "sklearn-crfsuite",
    ]
    subprocess.run(
        [
            sys.executable,
            "-m",
            "pip",
            "install",
            "--quiet",
            "--target",
            "/tmp/site-packages",
            *pkgs,
        ],
        check=True,
    )
    if "/tmp/site-packages" not in sys.path:
        sys.path.insert(0, "/tmp/site-packages")


# Only install on cold start (not on warm invocations)
import os as _os

if not _os.path.exists("/tmp/site-packages/numpy"):
    _bootstrap_packages()
elif "/tmp/site-packages" not in sys.path:
    sys.path.insert(0, "/tmp/site-packages")

s3 = boto3.client("s3")
S3_MODELS_BUCKET = os.environ["S3_MODELS_BUCKET"]
S3_DOCUMENTS_BUCKET = os.environ.get("S3_DOCUMENTS_BUCKET", S3_MODELS_BUCKET)

# Cache downloaded models across warm Lambda invocations
_MODEL_CACHE: dict[str, str] = {}


# ── Entry point ───────────────────────────────────────────────────────────────


def lambda_handler(event: dict, context) -> dict:
    records = event.get("Records", [])
    logger.info("Received %d SQS record(s)", len(records))

    for record in records:
        body = json.loads(record["body"])
        application_id = body["application_id"]
        job_id = body.get("job_id", "")
        s3_keys = body.get("s3_document_keys", [])

        try:
            _process(application_id, job_id, s3_keys)
        except Exception as exc:
            logger.exception("Failed processing application %s", application_id)
            _update_job(job_id, application_id, "failed", error=str(exc))
            raise  # re-raise so SQS retries (up to maxReceiveCount = 3)

    return {"statusCode": 200}


# ── Processing pipeline ───────────────────────────────────────────────────────


def _process(application_id: str, job_id: str, s3_keys: list[str]) -> None:
    _ensure_app_code_importable()

    # Step 1 — Application received (already submitted)
    _update_job(
        job_id, application_id, "running", step="APPLICATION_SUBMITTED", progress=10
    )

    # Step 2 — IDP / OCR extraction
    _update_job(job_id, application_id, "running", step="IDP_OCR", progress=25)
    doc_paths = _download_documents(s3_keys)
    extracted = _run_idp(doc_paths)

    # Load application base fields from RDS
    app_fields = _load_application_fields(application_id)
    data = {**app_fields, **{k: v for k, v in extracted.items() if v is not None}}

    # Step 3 — Rules engine (credit policy evaluation)
    _update_job(job_id, application_id, "running", step="RULES_ENGINE", progress=50)

    # Step 4 — PD AI model scoring (rules_evaluate + assess called together)
    _update_job(job_id, application_id, "running", step="PD_AI_MODEL", progress=75)
    result = _run_assessment(data)

    # Step 5 — Persist results to RDS (decision saved)
    _update_job(job_id, application_id, "running", step="DECISION_SAVED", progress=95)
    _persist_results(application_id, extracted, result)

    _update_job(job_id, application_id, "completed", step="COMPLETED", progress=100)
    logger.info(
        "application %s processed successfully — grade=%s pd=%.4f",
        application_id,
        result.get("risk_grade"),
        result.get("pd", 0),
    )


# ── Helpers ───────────────────────────────────────────────────────────────────


def _ensure_app_code_importable() -> None:
    """Add the Lambda package root to sys.path so app.* imports work."""
    pkg_root = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )
    if pkg_root not in sys.path:
        sys.path.insert(0, pkg_root)


def _download_model(s3_key: str) -> str:
    """Download a model file from S3 to /tmp, cache the local path."""
    if s3_key in _MODEL_CACHE:
        return _MODEL_CACHE[s3_key]
    local_path = f"/tmp/{s3_key.replace('/', '_')}"
    logger.info("Downloading model %s → %s", s3_key, local_path)
    s3.download_file(S3_MODELS_BUCKET, s3_key, local_path)
    _MODEL_CACHE[s3_key] = local_path
    return local_path


def _download_documents(s3_keys: list[str]) -> list[str]:
    paths = []
    for key in s3_keys:
        suffix = os.path.splitext(key)[-1] or ".pdf"
        tmp = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
        s3.download_fileobj(S3_DOCUMENTS_BUCKET, key, tmp)
        tmp.close()
        paths.append(tmp.name)
        logger.info("Downloaded document %s → %s", key, tmp.name)
    return paths


def _run_idp(doc_paths: list[str]) -> dict:
    from pathlib import Path

    from app.services.ai.idp.extractor import extract_document

    # Ensure IDP CRF model is loaded from S3
    _download_model("models/finpal_extractor.joblib")

    merged: dict = {}
    for p in doc_paths:
        path = Path(p)
        if path.exists():
            try:
                merged.update(extract_document(path))
            except Exception as exc:
                logger.warning("IDP extraction failed for %s: %s", p, exc)
    return merged


def _run_assessment(data: dict) -> dict:
    # Ensure PD model is loaded from S3
    _download_model("models/finpal_pd_model.joblib")

    from app.services.ai.assessment_service import assess

    return assess(data)


def _load_application_fields(application_id: str) -> dict:
    """Read the base application fields from RDS using pg8000.native."""
    conn = _get_db_conn()
    try:
        rows = conn.run(
            """
            SELECT sector, annual_revenue, net_profit, total_assets, total_liabilities,
                   existing_debt, monthly_repayment, loan_amount, loan_term_months,
                   loan_purpose, has_collateral, years_trading
            FROM applications
            WHERE id = :app_id
            """,
            app_id=application_id,
        )
        if not rows:
            logger.warning(
                "Application %s not found in RDS — using defaults", application_id
            )
            return {}
        row = rows[0]
        cols = [
            "sector",
            "annual_revenue",
            "net_profit",
            "total_assets",
            "total_liabilities",
            "existing_debt",
            "monthly_repayment",
            "loan_amount",
            "loan_term_months",
            "loan_purpose",
            "has_collateral",
            "years_trading",
        ]
        return {c: v for c, v in zip(cols, row, strict=False) if v is not None}
    finally:
        conn.close()


def _persist_results(application_id: str, extracted: dict, result: dict) -> None:
    """Write AI assessment results back to RDS."""
    conn = _get_db_conn()
    try:
        conn.run(
            """
            UPDATE applications SET
                ai_score          = :ai_score,
                risk_grade        = :risk_grade,
                pd                = :pd,
                dscr              = :dscr,
                apr               = :apr,
                affordability     = :affordability,
                ecl_12m           = :ecl_12m,
                ecl_lifetime      = :ecl_lifetime,
                ifrs9_stage       = :ifrs9_stage,
                shap_codes        = :shap_codes::jsonb,
                model_version     = :model_version,
                narrative         = :narrative,
                recommendation    = :recommendation,
                annual_revenue    = COALESCE(:annual_revenue, annual_revenue),
                net_profit        = COALESCE(:net_profit, net_profit),
                total_assets      = COALESCE(:total_assets, total_assets),
                total_liabilities = COALESCE(:total_liabilities, total_liabilities),
                status            = 'hitl_queue'
            WHERE id = :app_id
            """,
            ai_score=result.get("ai_score"),
            risk_grade=result.get("risk_grade"),
            pd=result.get("pd"),
            dscr=result.get("dscr"),
            apr=result.get("apr"),
            affordability=result.get("affordability"),
            ecl_12m=result.get("ecl_12m"),
            ecl_lifetime=result.get("ecl_lifetime"),
            ifrs9_stage=result.get("ifrs9_stage"),
            shap_codes=json.dumps(result.get("shap_codes") or {}),
            model_version=result.get("model_version"),
            narrative=result.get("narrative"),
            recommendation=result.get("recommendation"),
            annual_revenue=extracted.get("annual_revenue"),
            net_profit=extracted.get("net_profit"),
            total_assets=extracted.get("total_assets"),
            total_liabilities=extracted.get("total_liabilities"),
            app_id=application_id,
        )
        logger.info("Persisted assessment for application %s", application_id)
    finally:
        conn.close()


def _update_job(
    job_id: str,
    application_id: str,
    status: str,
    step: str | None = None,
    progress: int | None = None,
    error: str | None = None,
) -> None:
    if not job_id:
        return
    conn = _get_db_conn()
    try:
        sets = ["status = :status"]
        params: dict = {"status": status, "job_id": job_id}
        if step:
            sets.append("current_step = :step")
            params["step"] = step
        if progress is not None:
            sets.append("progress = :progress")
            params["progress"] = progress
        if error:
            sets.append("error = :error")
            params["error"] = error
        sql = f"UPDATE processing_jobs SET {', '.join(sets)} WHERE id = :job_id"
        sql = sql.replace("status = :status", "status = CAST(:status AS jobstatus)")
        conn.run(sql, **params)
    except Exception as exc:
        logger.warning("Could not update job status: %s", exc)
    finally:
        conn.close()


def _get_db_conn():
    """Open a pg8000.native connection (pure Python, no C deps)."""
    import pg8000.native

    return pg8000.native.Connection(
        host=os.environ["DB_HOST"],
        database=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASS"],
        ssl_context=True,
    )
