"""
Audit service — append-only log with SHA-256 hash chaining.
EU AI Act Art.12 · GDPR Art.30 · NFR-002 (7-year retention).
"""

import hashlib
import json
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.models.audit_log import AuditLog


class AuditService:
    @staticmethod
    async def log(
        db: AsyncSession,
        event_type: str,
        description: str,
        application_id: str | None = None,
        actor_id: str | None = None,
        actor_username: str | None = None,
        payload: dict[str, Any] | None = None,
        ip_address: str | None = None,
        correlation_id: str | None = None,
    ) -> AuditLog:
        """
        Append a new entry to the immutable audit log.
        Each entry includes a SHA-256 hash of the previous entry
        to form a tamper-evident hash chain (NFR-002).
        """
        # Get hash of previous entry for chain integrity
        prev_result = await db.execute(
            select(AuditLog.entry_hash).order_by(desc(AuditLog.created_at)).limit(1)
        )
        prev_hash = prev_result.scalar_one_or_none() or "genesis"

        entry_id = str(uuid.uuid4())
        now = datetime.now(UTC).isoformat()

        # Compute SHA-256 of this entry
        content = json.dumps(
            {
                "id": entry_id,
                "event_type": event_type,
                "description": description,
                "application_id": application_id,
                "actor_username": actor_username,
                "payload": payload,
                "prev_hash": prev_hash,
                "timestamp": now,
            },
            sort_keys=True,
        )

        entry_hash = hashlib.sha256(content.encode()).hexdigest()

        entry = AuditLog(
            id=entry_id,
            event_type=event_type,
            application_id=application_id,
            actor_id=actor_id,
            actor_username=actor_username,
            description=description,
            payload=payload,
            ip_address=ip_address,
            correlation_id=correlation_id or str(uuid.uuid4()),
            prev_hash=prev_hash,
            entry_hash=entry_hash,
        )

        db.add(entry)
        await db.flush()  # Write but don't commit — caller commits

        logger.info(
            "audit.log",
            event_type=event_type,
            entry_id=entry_id,
            application_id=application_id,
            actor=actor_username,
        )

        return entry

    @staticmethod
    async def get_for_application(
        db: AsyncSession,
        application_id: str,
    ) -> list[AuditLog]:
        result = await db.execute(
            select(AuditLog)
            .where(AuditLog.application_id == application_id)
            .order_by(AuditLog.created_at)
        )
        return list(result.scalars().all())
