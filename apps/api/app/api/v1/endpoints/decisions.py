"""
Decision endpoints — HITL decision making.

POST /api/v1/applications/{id}/decisions → Credit Officer submits decision
GET  /api/v1/applications/{id}/decisions → List decisions for an application
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_roles
from app.schemas.decision import DecisionCreate, DecisionOut
from app.services.audit_service import AuditService
from app.services.decision_service import DecisionService

router = APIRouter(tags=["decisions"])


@router.post(
    "/applications/{application_id}/decisions",
    response_model=DecisionOut,
    status_code=status.HTTP_201_CREATED,
    summary="Submit HITL credit decision (Credit Officer)",
)
async def create_decision(
    application_id: str,
    body: DecisionCreate,
    token_data: dict = Depends(require_roles("credit_officer")),
    db: AsyncSession = Depends(get_db),
) -> DecisionOut:
    """
    Credit Officer submits approve / decline / refer decision.
    Rationale is mandatory (min 20 chars) — EU AI Act Art.12.
    Decision is written immutably to audit log.
    AI snapshot is captured at time of decision.
    """
    decision = await DecisionService.create(
        db=db,
        application_id=application_id,
        officer_id=token_data["sub"],
        officer_username=token_data.get("username"),
        data=body,
    )

    await AuditService.log(
        db=db,
        event_type=f"decision.{body.outcome}",
        application_id=application_id,
        actor_id=token_data["sub"],
        actor_username=token_data.get("username"),
        description=f"Decision: {body.outcome.upper()} — {body.rationale[:100]}",
        payload={
            "outcome": body.outcome,
            "model_version": decision.model_version,
            "integrity_hash": decision.integrity_hash,
        },
    )

    return DecisionOut.model_validate(decision)


@router.get(
    "/applications/{application_id}/decisions",
    response_model=list[DecisionOut],
    summary="List decisions for an application",
)
async def list_decisions(
    application_id: str,
    token_data: dict = Depends(
        require_roles("credit_officer", "compliance_officer", "it_admin")
    ),
    db: AsyncSession = Depends(get_db),
) -> list[DecisionOut]:
    from app.models.decision import Decision

    result = await db.execute(
        select(Decision)
        .where(Decision.application_id == application_id)
        .order_by(Decision.decided_at)
    )
    return [DecisionOut.model_validate(d) for d in result.scalars().all()]
