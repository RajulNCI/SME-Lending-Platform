"""
Decision service — HITL decision creation with immutable audit.
"""
import hashlib
import json
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.application import Application, ApplicationStatus
from app.models.decision import Decision, DecisionOutcome
from app.schemas.decision import DecisionCreate


class DecisionService:

    @staticmethod
    async def create(
        db: AsyncSession,
        application_id: str,
        officer_id: str,
        data: DecisionCreate,
    ) -> Decision:
        # Fetch application
        result = await db.execute(
            select(Application).where(Application.id == application_id)
        )
        app = result.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")

        # Compute integrity hash for tamper-evidence (NFR-002)
        decision_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        hash_content = json.dumps({
            "id": decision_id,
            "application_id": application_id,
            "officer_id": officer_id,
            "outcome": data.outcome,
            "rationale": data.rationale,
            "model_version": app.model_version,
            "timestamp": now.isoformat(),
        }, sort_keys=True)
        integrity_hash = hashlib.sha256(hash_content.encode()).hexdigest()

        decision = Decision(
            id=decision_id,
            application_id=application_id,
            officer_id=officer_id,
            outcome=DecisionOutcome(data.outcome),
            rationale=data.rationale,
            model_version=app.model_version,
            ai_score=app.ai_score,
            risk_grade=app.risk_grade,
            shap_snapshot=app.shap_codes,
            decided_at=now,
            integrity_hash=integrity_hash,
        )
        db.add(decision)

        # Update application status
        outcome_to_status = {
            "approved": ApplicationStatus.approved,
            "declined": ApplicationStatus.declined,
            "referred": ApplicationStatus.referred,
        }
        app.status = outcome_to_status[data.outcome]
        await db.flush()

        return decision