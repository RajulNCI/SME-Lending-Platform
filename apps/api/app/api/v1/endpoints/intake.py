"""
intake — simplified application creation for the React frontend demo.

The full ApplicationCreate schema requires 15+ mandatory fields (CRN, director
info, GDPR consents, etc.), but the React BorrowerApplyPage form only sends
{companyName, sector, loanAmount, loanType}. This endpoint fills sensible
defaults for missing fields so the demo flow works end-to-end.

In production, the full intake form would supply everything.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.application import Application, ApplicationStatus

router = APIRouter(tags=["intake"])


@router.post("/applications/submit", summary="Simplified application submission (demo)")
async def submit_simple(
    companyName: str = Form("Borrower SME Ltd"),
    sector: str = Form("Technology"),
    loanAmount: str = Form("50000"),
    loanType: str = Form("WORKING_CAPITAL"),
    requestedBy: Optional[str] = Form(None),
    files: list[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Simplified submission that accepts the minimal fields the React form sends
    and fills in demo defaults for everything else.
    """
    import random

    app_id = str(uuid.uuid4())
    reference = f"FP-{datetime.now().year}-{random.randint(1000, 9999)}"

    # Map frontend loanType to the backend enum
    purpose_map = {
        "WORKING_CAPITAL": "Working Capital",
        "EQUIPMENT_FINANCE": "Equipment Finance",
        "EXPANSION": "Expansion",
        "COMMERCIAL_MORTGAGE": "Commercial Mortgage",
        "REFINANCE": "Refinance",
        "OTHER": "Other",
    }

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
        loan_purpose=purpose_map.get(loanType, loanType),
        loan_term_months=36,
        purpose_detail=f"{purpose_map.get(loanType, loanType)} loan for {companyName}",
        has_collateral=False,
        # Demo financial defaults
        annual_revenue=500_000,
        net_profit=75_000,
        total_assets=800_000,
        total_liabilities=300_000,
        existing_debt=50_000,
        monthly_repayment=2_500,
        # GDPR consents (auto-accepted for demo)
        consent_data_processing=True,
        consent_ccr=True,
        consent_ai_decision=True,
        consent_timestamp=datetime.now(timezone.utc),
        borrower_id=requestedBy,
        status=ApplicationStatus.submitted,
    )

    db.add(app)
    await db.flush()

    return {
        "id": app_id,
        "applicationId": app_id,
        "reference": reference,
        "status": "SUBMITTED",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "message": "Application submitted successfully",
    }
