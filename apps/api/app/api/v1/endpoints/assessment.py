"""
AI assessment endpoints — Engine 2 (credit decisioning).

POST /api/v1/assess  -> STATELESS: fields in -> assessment out (JSON). Backend persists.
POST /api/v1/applications/{id}/assess  -> DB-coupled convenience (dev DB).
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.application import Application, ApplicationStatus
from app.schemas.assessment import AssessmentIn, AssessmentOut
from app.services.ai.assessment_service import apply_to_orm, assess
from app.services.audit_service import AuditService

router = APIRouter(tags=["assessment"])


@router.post(
    "/assess",
    response_model=AssessmentOut,
    summary="Stateless AI assessment (fields in -> assessment out, no DB)",
)
async def assess_stateless(
    body: AssessmentIn,
    token_data: dict[str, Any] = Depends(get_current_user),
) -> AssessmentOut:
    """Production integration point: backend sends fields, gets the assessment JSON to
    store in its own database (DynamoDB). No persistence here."""
    data = body.model_dump(exclude={"reference"})
    assessment = assess(data)
    return AssessmentOut(application_id=body.reference, **assessment)


_FIELDS = (
    "sector",
    "years_trading",
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
)


@router.post(
    "/applications/{application_id}/assess",
    response_model=AssessmentOut,
    summary="Run AI credit assessment (Engine 2)",
)
async def run_assessment(
    application_id: str,
    token_data: dict[str, Any] = Depends(
        require_roles("credit_officer", "ops_manager", "it_admin")
    ),
    db: AsyncSession = Depends(get_db),
) -> AssessmentOut:
    result = await db.execute(
        select(Application).where(Application.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    app_data = {f: getattr(application, f, None) for f in _FIELDS}
    assessment = assess(app_data)

    apply_to_orm(application, assessment)
    application.status = ApplicationStatus.hitl_queue
    await db.flush()

    await AuditService.log(
        db=db,
        event_type="ai.assessment",
        application_id=application_id,
        actor_id=token_data["sub"],
        actor_username=token_data.get("username"),
        description=(
            f"AI assessment: grade {assessment['risk_grade']} "
            f"PD {assessment['pd']:.1%} rec {assessment['recommendation']}"
        ),
        payload={
            "model_version": assessment["model_version"],
            "risk_grade": assessment["risk_grade"],
            "pd": assessment["pd"],
        },
    )

    return AssessmentOut(application_id=application_id, **assessment)
