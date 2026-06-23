"""
local_ai — routes for the local AI pipeline orchestration.

Mounted at /local-ai so the frontend's /local-ai/* paths work unchanged.

Flow:
  1. Load application from DB
  2. Build feature dict from application fields
  3. Call ML microservice for PD scoring + full assessment
  4. Run rules engine
  5. Persist combined result, advance status to hitl_queue
"""

from __future__ import annotations

import logging
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.application import Application, ApplicationStatus
from app.services.rules_engine.engine import evaluate as rules_evaluate

logger = logging.getLogger("finpal.local_ai")

router = APIRouter(prefix="/local-ai", tags=["local-ai"])

ML_SERVICE_URL = "http://localhost:8001"


class ProcessAIRequest(BaseModel):
    documents: list[dict[str, Any]] | None = None


async def _call_ml_service(endpoint: str, payload: dict) -> dict:
    url = f"{ML_SERVICE_URL}{endpoint}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            return resp.json()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=(
                "ML microservice unavailable. Start it with: "
                "uvicorn app.services.ai.ml_server:app --port 8001"
            ),
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502, detail=f"ML service error: {exc.response.text}"
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to call ML service: {exc}")


def _build_feature_dict(app: Application) -> dict:
    return {
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


def _persist_assessment(app: Application, assessment: dict) -> None:
    fields = [
        "ai_score",
        "risk_grade",
        "pd",
        "dscr",
        "apr",
        "affordability",
        "ecl_12m",
        "shap_codes",
        "ifrs9_stage",
        "model_version",
    ]
    for field in fields:
        value = assessment.get(field)
        if value is not None:
            setattr(app, field, value)
    app.status = ApplicationStatus.hitl_queue


@router.post("/applications/{application_id}/process-ai")
async def process_ai(
    application_id: str,
    body: ProcessAIRequest | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict:
    stage = "load"
    try:
        result = await db.execute(
            select(Application).where(Application.id == application_id)
        )
        app = result.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")

        stage = "pd"
        features = _build_feature_dict(app)
        ml_result = await _call_ml_service("/pd/score", features)
        assessment = ml_result.get("assessment", {})

        stage = "rules"
        rules_result = rules_evaluate(
            {**features, "dscr": assessment.get("dscr", 1.2)},
        )

        stage = "persist"
        _persist_assessment(app, assessment)
        await db.flush()

        logger.info("AI pipeline completed for application %s", application_id)
        return {
            "id": application_id,
            "status": "WAITING_OFFICER",
            "assessment": {**assessment, "rules": rules_result},
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("AI pipeline failed at stage [%s]: %s", stage, exc)
        raise HTTPException(
            status_code=500, detail=f"AI processing failed at stage '{stage}': {exc}"
        )


@router.get("/applications/{application_id}/assessment")
async def get_assessment(
    application_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        select(Application).where(Application.id == application_id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    pd_val = float(app.pd) if app.pd else None
    recommended = (
        (
            "APPROVED"
            if pd_val and pd_val < 0.2
            else "REFERRED"
            if pd_val and pd_val < 0.4
            else "DECLINED"
        )
        if pd_val
        else None
    )

    return {
        "pd": pd_val,
        "riskGrade": app.risk_grade,
        "aiScore": float(app.ai_score) if app.ai_score else None,
        "dscr": float(app.dscr) if app.dscr else None,
        "apr": float(app.apr) if app.apr else None,
        "affordability": float(app.affordability) if app.affordability else None,
        "ecl12m": float(app.ecl_12m) if app.ecl_12m else None,
        "ifrs9Stage": app.ifrs9_stage,
        "shapValues": app.shap_codes,
        "modelVersion": app.model_version,
        "recommendedStatus": recommended,
    }
