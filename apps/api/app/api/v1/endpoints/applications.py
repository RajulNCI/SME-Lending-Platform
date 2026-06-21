"""
Application endpoints — intake, status, AI assessment update.

GET    /api/v1/applications           → list (Credit Officer, Compliance, Ops)
POST   /api/v1/applications           → submit new application (Borrower)
GET    /api/v1/applications/{id}      → get detail (all roles with access)
PATCH  /api/v1/applications/{id}/ai   → Nathan's agent posts AI assessment results
GET    /api/v1/applications/{id}/evidence → evidence bundle (Compliance Officer)
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.models.application import Application, ApplicationStatus
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationOut, ApplicationListOut, AIAssessmentUpdate, ProgressOut
from app.schemas.audit import EvidenceBundle
from app.services.audit_service import AuditService
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["applications"])

CREDIT_ROLES = ("credit_officer", "risk_manager", "compliance_officer", "ops_manager", "it_admin")


@router.get("", response_model=list[ApplicationListOut], summary="List applications")
async def list_applications(
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    token_data: dict = Depends(require_roles(*CREDIT_ROLES, "borrower_sme")),
    db: AsyncSession = Depends(get_db),
) -> list[ApplicationListOut]:
    query = select(Application).order_by(desc(Application.created_at)).limit(limit).offset(offset)
    if status_filter:
        query = query.where(Application.status == status_filter)

    if token_data.get("role") == "borrower_sme":
        # Applications are linked to a User row (upserted on intake by username),
        # so borrower_id is that user's UUID — not the token `sub`. Match by
        # username → user.id so borrowers see their own applications.
        username = token_data.get("username")
        user_result = await db.execute(select(User.id).where(User.username == username))
        user_id = user_result.scalar_one_or_none()
        query = query.where(Application.borrower_id == user_id)

    result = await db.execute(query)
    apps = result.scalars().all()
    return [ApplicationListOut.model_validate(a) for a in apps]


@router.post("", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED,
             summary="Submit new loan application")
async def create_application(
    body: ApplicationCreate,
    token_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApplicationOut:
    """
    Submit a new SME loan application.
    Accessible by any authenticated user (borrowers submit their own applications).
    Validates all required GDPR consents before accepting.
    """
    app = await ApplicationService.create(db=db, data=body, borrower_id=token_data["sub"])

    await AuditService.log(
        db=db,
        event_type="application.submitted",
        application_id=app.id,
        actor_id=token_data["sub"],
        actor_username=token_data.get("username"),
        description=f"Application {app.reference} submitted by {body.company_name}",
        payload={"loan_amount": float(body.loan_amount), "purpose": body.loan_purpose},
    )

    return ApplicationOut.model_validate(app)


@router.get("/queue", response_model=list[ApplicationListOut], summary="Credit officer HITL queue")
async def get_queue(
    token_data: dict = Depends(require_roles(*CREDIT_ROLES)),
    db: AsyncSession = Depends(get_db),
) -> list[ApplicationListOut]:
    result = await db.execute(
        select(Application)
        .where(Application.status == ApplicationStatus.hitl_queue)
        .order_by(desc(Application.created_at))
        .limit(100)
    )
    apps = result.scalars().all()
    return [ApplicationListOut.model_validate(a) for a in apps]


@router.get("/{application_id}", response_model=ApplicationOut, summary="Get application detail")
async def get_application(
    application_id: str,
    token_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApplicationOut:
    app = await ApplicationService.get_or_404(db, application_id)
    return ApplicationOut.model_validate(app)


@router.patch("/{application_id}/ai", response_model=ApplicationOut,
              summary="Post AI assessment results (Nathan's agent endpoint)")
async def update_ai_assessment(
    application_id: str,
    body: AIAssessmentUpdate,
    token_data: dict = Depends(require_roles(*CREDIT_ROLES, "mrm_analyst")),
    db: AsyncSession = Depends(get_db),
) -> ApplicationOut:
    """
    Nathan's Credit Officer AI agent posts its assessment results here.
    Populates: PD score, risk grade, DSCR, APR, affordability, SHAP codes, IFRS 9 stage.
    Triggers HITL routing if score is below auto-approve threshold.
    """
    app = await ApplicationService.get_or_404(db, application_id)
    app = await ApplicationService.apply_ai_assessment(db=db, app=app, assessment=body)

    await AuditService.log(
        db=db,
        event_type="application.ai_assessed",
        application_id=app.id,
        actor_username=token_data.get("username"),
        description=f"AI assessment posted for {app.reference} — grade {body.risk_grade}, PD {body.pd}%",
        payload=body.model_dump(),
    )

    return ApplicationOut.model_validate(app)


@router.get("/{application_id}/evidence", response_model=EvidenceBundle,
            summary="Retrieve evidence bundle (Compliance Officer)")
async def get_evidence_bundle(
    application_id: str,
    token_data: dict = Depends(require_roles("compliance_officer", "it_admin")),
    db: AsyncSession = Depends(get_db),
) -> EvidenceBundle:
    """
    Returns complete evidence package for a credit decision.
    Includes: AI inputs, SHAP codes, model version, approver, consents.
    Logged to audit trail per EU AI Act Art.12.
    """
    bundle = await ApplicationService.build_evidence_bundle(
        db=db,
        application_id=application_id,
        retrieved_by=token_data.get("username", "unknown"),
    )

    await AuditService.log(
        db=db,
        event_type="audit.evidence_retrieved",
        application_id=application_id,
        actor_username=token_data.get("username"),
        description=f"Evidence bundle retrieved for {application_id}",
        payload={"retrieved_by": token_data.get("username")},
    )

    return bundle


@router.get("/{application_id}/progress", response_model=ProgressOut, summary="Get application processing progress")
async def get_application_progress(
    application_id: str,
    token_data: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProgressOut:
    app = await ApplicationService.get_or_404(db, application_id)
    
    elapsed = (datetime.now(timezone.utc) - app.created_at).total_seconds()
    
    step = 0
    if elapsed >= 0.9:
        step = 1
    if elapsed >= 2.3:
        step = 2
    if elapsed >= 3.5:
        step = 3
    if elapsed >= 5.1:
        step = 4
    if elapsed >= 6.2:
        step = 5
    if elapsed >= 7.1:
        step = 6
        
    if app.status in [ApplicationStatus.ai_assessment, ApplicationStatus.hitl_queue, ApplicationStatus.approved, ApplicationStatus.declined, ApplicationStatus.referred]:
        step = 6

    return ProgressOut(
        step=step,
        total_steps=6,
        completed=step >= 6
    )