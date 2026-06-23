"""
Application service — business logic for loan applications.
"""

import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.models.decision import Decision
from app.schemas.application import AIAssessmentUpdate, ApplicationCreate
from app.schemas.audit import AuditLogOut, EvidenceBundle
from app.services.audit_service import AuditService


def _generate_reference() -> str:
    """Generate a human-readable application reference like FP-2026-0042."""
    import random

    return f"FP-{datetime.now().year}-{random.randint(1000, 9999)}"


class ApplicationService:
    @staticmethod
    async def create(
        db: AsyncSession,
        data: ApplicationCreate,
        borrower_id: str | None = None,
    ) -> Application:
        app = Application(
            id=str(uuid.uuid4()),
            reference=_generate_reference(),
            company_name=data.company_name,
            crn=data.crn,
            sector=data.sector,
            director_name=data.director_name,
            director_email=data.director_email,
            director_phone=data.director_phone,
            address=data.address,
            eircode=data.eircode,
            years_trading=data.years_trading,
            loan_amount=float(data.loan_amount),
            loan_purpose=data.loan_purpose,
            loan_term_months=data.loan_term_months,
            purpose_detail=data.purpose_detail,
            has_collateral=data.has_collateral,
            collateral_detail=data.collateral_detail,
            annual_revenue=float(data.annual_revenue) if data.annual_revenue else None,
            net_profit=float(data.net_profit) if data.net_profit else None,
            total_assets=float(data.total_assets) if data.total_assets else None,
            total_liabilities=float(data.total_liabilities)
            if data.total_liabilities
            else None,
            existing_debt=float(data.existing_debt) if data.existing_debt else None,
            monthly_repayment=float(data.monthly_repayment)
            if data.monthly_repayment
            else None,
            consent_data_processing=data.consent_data_processing,
            consent_ccr=data.consent_ccr,
            consent_ai_decision=data.consent_ai_decision,
            consent_timestamp=datetime.now(UTC),
            borrower_id=borrower_id,
            status=ApplicationStatus.submitted,
        )
        db.add(app)
        await db.flush()
        return app

    @staticmethod
    async def get_or_404(db: AsyncSession, application_id: str) -> Application:
        result = await db.execute(
            select(Application).where(Application.id == application_id)
        )
        app = result.scalar_one_or_none()
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application {application_id} not found",
            )
        return app

    @staticmethod
    async def apply_ai_assessment(
        db: AsyncSession,
        app: Application,
        assessment: AIAssessmentUpdate,
    ) -> Application:
        """Apply AI agent assessment results to the application."""
        if assessment.ai_score is not None:
            app.ai_score = assessment.ai_score
        if assessment.risk_grade is not None:
            app.risk_grade = assessment.risk_grade
        if assessment.pd is not None:
            app.pd = assessment.pd
        if assessment.dscr is not None:
            app.dscr = assessment.dscr
        if assessment.apr is not None:
            app.apr = assessment.apr
        if assessment.affordability is not None:
            app.affordability = assessment.affordability
        if assessment.ecl_12m is not None:
            app.ecl_12m = assessment.ecl_12m
        if assessment.shap_codes is not None:
            app.shap_codes = assessment.shap_codes
        if assessment.ifrs9_stage is not None:
            app.ifrs9_stage = assessment.ifrs9_stage
        app.model_version = assessment.model_version

        # Auto-route to HITL if PD >= 5% or DSCR < 1.20
        if app.pd and (app.pd >= 5.0 or (app.dscr and app.dscr < 1.20)):
            app.status = ApplicationStatus.hitl_queue
        else:
            app.status = ApplicationStatus.ai_assessment

        await db.flush()
        return app

    @staticmethod
    async def build_evidence_bundle(
        db: AsyncSession,
        application_id: str,
        retrieved_by: str,
    ) -> EvidenceBundle:
        app = await ApplicationService.get_or_404(db, application_id)

        # Get latest decision
        decision_result = await db.execute(
            select(Decision)
            .where(Decision.application_id == application_id)
            .order_by(Decision.decided_at.desc())
            .limit(1)
        )
        decision = decision_result.scalar_one_or_none()

        # Get audit log
        audit_entries = await AuditService.get_for_application(db, application_id)

        return EvidenceBundle(
            application_id=app.id,
            application_reference=app.reference,
            company_name=app.company_name,
            loan_amount=float(app.loan_amount),
            loan_purpose=app.loan_purpose,
            decision_outcome=decision.outcome.value if decision else None,
            risk_grade=app.risk_grade,
            model_version=app.model_version,
            ai_score=app.ai_score,
            pd=app.pd,
            shap_codes=app.shap_codes,
            ifrs9_stage=app.ifrs9_stage,
            approver_username=decision.officer.username
            if decision and decision.officer
            else None,
            rationale=decision.rationale if decision else None,
            consent_data_processing=app.consent_data_processing,
            consent_ccr=app.consent_ccr,
            consent_ai_decision=app.consent_ai_decision,
            consent_timestamp=app.consent_timestamp,
            decided_at=decision.decided_at if decision else None,
            integrity_hash=decision.integrity_hash if decision else None,
            retrieved_by=retrieved_by,
            retrieved_at=datetime.now(UTC),
            audit_events=[AuditLogOut.model_validate(e) for e in audit_entries],
        )
