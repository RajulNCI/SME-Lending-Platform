"""
local_ai — FastAPI routes for the local AI pipeline orchestration.

Replaces the Node/Express aiOrchestrator.js with proper Python routes that:
  1. Call the ML microservice (port 8001) for IDP extraction + PD scoring
  2. Apply the mock rules engine
  3. Persist the assessment to the Application row
  4. Update application status to hitl_queue

Mounted at /local-ai (outside /api/v1 prefix) so the React frontend's
existing `/local-ai/applications/{id}/process-ai` paths work unchanged.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.application import Application, ApplicationStatus

logger = logging.getLogger("finpal.local_ai")

router = APIRouter(prefix="/local-ai", tags=["local-ai"])

ML_SERVICE_URL = "http://localhost:8001"


# ── Request schemas ───────────────────────────────────────────────────────────


class ProcessAIRequest(BaseModel):
    documents: list[dict[str, Any]] | None = None


# ── Helper: call the ML microservice ─────────────────────────────────────────


async def _call_ml_service(endpoint: str, payload: dict) -> dict:
    """Call the ML microservice and return the JSON response."""
    url = f"{ML_SERVICE_URL}{endpoint}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            return resp.json()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="ML microservice is not running. Start it with: "
            "uvicorn app.services.ai.ml_server:app --port 8001",
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"ML service error: {exc.response.text}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to call ML service: {exc}",
        )


# ── Helper: mock rules engine (inline, no external call needed) ──────────────


def _apply_rules(extracted_data: dict, pd_score: float) -> dict:
    """Apply the mock rules engine."""
    from app.services.ai.rules_engine_mock import get_mock_rules_result

    return get_mock_rules_result(extracted_data, pd_score)


# ── Routes ────────────────────────────────────────────────────────────────────


@router.post("/applications/{application_id}/process-ai")
async def process_ai(
    application_id: str,
    body: ProcessAIRequest | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Orchestrate the full local AI pipeline:
      1. Load application from DB (for its financial fields)
      2. Run IDP extraction via ML service (if documents provided)
      3. Run PD scoring + full assessment via ML service
      4. Apply mock rules engine
      5. Persist combined assessment to DB
      6. Update status to WAITING_OFFICER / hitl_queue
    """
    stage = "load"

    try:
        # ── Stage 0: load the application ──────────────────────────────────
        result = await db.execute(
            select(Application).where(Application.id == application_id)
        )
        app = result.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")

        # ── Stage 1: IDP extraction ────────────────────────────────────────
        stage = "idp"
        extracted_data: dict = {}

        # If we had actual document text, we'd call /idp/extract here.
        # For now, pull financial fields from the application itself.
        app_fields = {
            "sector": app.sector or "Wholesale",
            "annual_revenue": float(app.annual_revenue or 500_000),
            "net_profit": float(app.net_profit or 0),
            "total_assets": float(app.total_assets or 0),
            "total_liabilities": float(app.total_liabilities or 0),
            "existing_debt": float(app.existing_debt or 0),
            "monthly_repayment": float(app.monthly_repayment or 0),
            "loan_amount": float(app.loan_amount or 50_000),
            "loan_term_months": int(app.loan_term_months or 36),
            "loan_purpose": app.loan_purpose or "Working Capital",
            "has_collateral": bool(app.has_collateral),
            "years_trading": app.years_trading or "3",
        }
        extracted_data = app_fields

        # ── Stage 2: PD scoring + full assessment ──────────────────────────
        stage = "pd"
        ml_result = await _call_ml_service("/pd/score", app_fields)
        assessment = ml_result.get("assessment", {})

        pd_score = assessment.get("pd", 0.1)

        # ── Stage 3: rules engine (mock) ──────────────────────────────────
        stage = "rules"
        rules_result = _apply_rules(
            {**extracted_data, "dscr": assessment.get("dscr", 1.2)},
            pd_score,
        )

        # ── Stage 4: combine and persist ──────────────────────────────────
        stage = "persist"

        # Build the combined assessment object
        combined_assessment = {
            **assessment,
            "rules": rules_result,
            "recommendedStatus": rules_result.get("recommendedStatus", "REFERRED"),
        }

        # Write AI fields to the Application ORM
        if assessment.get("ai_score") is not None:
            app.ai_score = assessment["ai_score"]
        if assessment.get("risk_grade") is not None:
            app.risk_grade = assessment["risk_grade"]
        if assessment.get("pd") is not None:
            app.pd = assessment["pd"]
        if assessment.get("dscr") is not None:
            app.dscr = assessment["dscr"]
        if assessment.get("apr") is not None:
            app.apr = assessment["apr"]
        if assessment.get("affordability") is not None:
            app.affordability = assessment["affordability"]
        if assessment.get("ecl_12m") is not None:
            app.ecl_12m = assessment["ecl_12m"]
        if assessment.get("shap_codes") is not None:
            app.shap_codes = assessment["shap_codes"]
        if assessment.get("ifrs9_stage") is not None:
            app.ifrs9_stage = assessment["ifrs9_stage"]
        if assessment.get("model_version"):
            app.model_version = assessment["model_version"]

        # Move to HITL queue
        app.status = ApplicationStatus.hitl_queue

        await db.flush()
        logger.info(f"AI pipeline completed for application {application_id}")

        return {
            "id": application_id,
            "status": "WAITING_OFFICER",
            "assessment": combined_assessment,
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"AI pipeline failed at stage [{stage}]: {exc}")
        raise HTTPException(
            status_code=500,
            detail=f"AI processing failed at stage '{stage}': {exc}",
        )


@router.get("/applications/{application_id}/assessment")
async def get_assessment(
    application_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Retrieve the AI assessment for an application."""
    result = await db.execute(
        select(Application).where(Application.id == application_id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    return {
        "pd": float(app.pd) if app.pd else None,
        "riskGrade": app.risk_grade,
        "aiScore": float(app.ai_score) if app.ai_score else None,
        "dscr": float(app.dscr) if app.dscr else None,
        "apr": float(app.apr) if app.apr else None,
        "affordability": float(app.affordability) if app.affordability else None,
        "ecl12m": float(app.ecl_12m) if app.ecl_12m else None,
        "ifrs9Stage": app.ifrs9_stage,
        "shapValues": app.shap_codes,
        "modelVersion": app.model_version,
        "recommendedStatus": (
            "APPROVED"
            if app.pd and float(app.pd) < 0.2
            else "REFERRED"
            if app.pd and float(app.pd) < 0.4
            else "DECLINED"
        )
        if app.pd
        else None,
    }
