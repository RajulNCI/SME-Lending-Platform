"""
ml_server — standalone FastAPI microservice for the ML models (port 8001).

Loads the two .joblib artifacts once at startup and exposes:
  POST /idp/extract      → CRF field extraction from raw text
  POST /pd/score         → full AI credit assessment (PD, DSCR, SHAP, narrative)
  POST /pipeline/full    → combined: extraction + assessment in one call
  GET  /health           → health check

Run with:
  cd apps/api
  uvicorn app.services.ai.ml_server:app --port 8001 --reload
"""

from __future__ import annotations

import os
import sys

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Ensure the project root is on sys.path so "app.services.ai.*" imports work ──
_THIS = os.path.dirname(os.path.abspath(__file__))
_API_ROOT = os.path.abspath(os.path.join(_THIS, "..", "..", ".."))
if _API_ROOT not in sys.path:
    sys.path.insert(0, _API_ROOT)


app = FastAPI(title="FinPal ML Microservice", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / response schemas ───────────────────────────────────────────────


class ExtractRequest(BaseModel):
    raw_text: str | None = None


class ExtractResponse(BaseModel):
    extracted_data: dict


class AssessRequest(BaseModel):
    """Application fields for the PD scoring + credit assessment pipeline."""

    sector: str = "Wholesale"
    years_trading: str | int | None = None
    annual_revenue: float = 500_000
    ebitda: float | None = None
    net_profit: float | None = None
    total_assets: float | None = None
    total_liabilities: float | None = None
    existing_debt: float | None = None
    monthly_repayment: float | None = None
    loan_amount: float = 50_000
    loan_term_months: int | None = 36
    loan_purpose: str = "Working Capital"
    has_collateral: bool = False


class PipelineRequest(BaseModel):
    """Combined IDP + assessment in one call."""

    raw_text: str | None = None
    # Override / supplement extracted data with known fields
    overrides: dict | None = None


# ── Endpoints ─────────────────────────────────────────────────────────────────


@app.get("/health")
def health():
    return {"status": "ok", "service": "ml-microservice"}


@app.post("/idp/extract", response_model=ExtractResponse)
def extract(req: ExtractRequest):
    """Engine 1: raw document text → structured application fields via CRF."""
    from app.services.ai.idp.extractor import extract_application_fields

    text = req.raw_text or ""
    if not text.strip():
        return ExtractResponse(extracted_data={})

    try:
        fields = extract_application_fields(text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {exc}")

    return ExtractResponse(extracted_data=fields)


@app.post("/pd/score")
def score(req: AssessRequest):
    """Engine 2: application fields → full AI credit assessment."""
    from app.services.ai.assessment_service import assess

    data = req.model_dump()
    try:
        result = assess(data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {exc}")

    return {"assessment": result}


@app.post("/pipeline/full")
def full_pipeline(req: PipelineRequest):
    """Combined pipeline: extract text → build features → PD score → assessment."""
    from app.services.ai.assessment_service import assess
    from app.services.ai.idp.extractor import extract_application_fields

    # Step 1: extract fields from text (if provided)
    extracted: dict = {}
    if req.raw_text and req.raw_text.strip():
        try:
            extracted = extract_application_fields(req.raw_text)
        except Exception:
            pass  # extraction is best-effort

    # Step 2: merge overrides
    if req.overrides:
        extracted.update(req.overrides)

    # Step 3: fill reasonable defaults for assessment
    app_data = {
        "sector": extracted.get("sector", "Wholesale"),
        "annual_revenue": float(extracted.get("annual_revenue", 500_000)),
        "loan_amount": float(extracted.get("loan_amount", 50_000)),
        "loan_purpose": extracted.get("loan_purpose", "Working Capital"),
        "loan_term_months": int(extracted.get("loan_term_months", 36)),
        "has_collateral": bool(extracted.get("has_collateral", False)),
    }
    # overlay any additional numeric fields that were extracted
    for key in (
        "ebitda",
        "net_profit",
        "total_assets",
        "total_liabilities",
        "existing_debt",
        "monthly_repayment",
        "years_trading",
    ):
        if key in extracted and extracted[key] is not None:
            app_data[key] = extracted[key]

    # Step 4: run the assessment
    try:
        assessment = assess(app_data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {exc}")

    return {
        "extracted_data": extracted,
        "assessment": assessment,
    }
