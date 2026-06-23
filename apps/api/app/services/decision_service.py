"""
Decision service — HITL decision creation with immutable audit.
"""

import hashlib
import json
import uuid
from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.models.decision import Decision, DecisionOutcome
from app.models.user import User
from app.schemas.decision import DecisionCreate


class DecisionService:
    @staticmethod
    async def create(
        db: AsyncSession,
        application_id: str,
        officer_id: str,
        data: DecisionCreate,
        officer_username: str | None = None,
    ) -> Decision:
        # Fetch application
        result = await db.execute(
            select(Application).where(Application.id == application_id)
        )
        app = result.scalar_one_or_none()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")

        # Resolve real officer UUID from users table.
        # In demo mode token_data["sub"] is "demo-officer-001" (not a DB UUID),
        # so we look up by username first; fall back to sub if it's a real UUID row.
        resolved_officer_id = officer_id
        if officer_username:
            u_result = await db.execute(
                select(User.id).where(User.username == officer_username)
            )
            db_uid = u_result.scalar_one_or_none()
            if db_uid:
                resolved_officer_id = db_uid
        if resolved_officer_id == officer_id and officer_username:
            # username lookup missed — try email column
            u_result2 = await db.execute(
                select(User.id).where(User.email == officer_username)
            )
            db_uid2 = u_result2.scalar_one_or_none()
            if db_uid2:
                resolved_officer_id = db_uid2

        # Compute integrity hash for tamper-evidence (NFR-002)
        decision_id = str(uuid.uuid4())
        now = datetime.now(UTC)
        hash_content = json.dumps(
            {
                "id": decision_id,
                "application_id": application_id,
                "officer_id": resolved_officer_id,
                "outcome": data.outcome,
                "rationale": data.rationale,
                "model_version": app.model_version,
                "timestamp": now.isoformat(),
            },
            sort_keys=True,
        )
        integrity_hash = hashlib.sha256(hash_content.encode()).hexdigest()

        decision = Decision(
            id=decision_id,
            application_id=application_id,
            officer_id=resolved_officer_id,
            outcome=DecisionOutcome(data.outcome),
            rationale=data.rationale,
            model_version=app.model_version or "finpal-pd-v2.4.1",
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
