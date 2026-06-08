"""
Seed script — creates all 8 demo users with hashed passwords.
Run once after DB migration:
    python scripts/seed_users.py
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.database import Base, make_engine
from app.core.security import hash_password
from app.models.user import User, UserRole

DEMO_USERS = [
    {
        "username": "credit.officer",
        "email": "co@finpal.ie",
        "display_name": "Jane Smith",
        "role": UserRole.credit_officer,
        "password": "FinPal@CO1",
    },
    {
        "username": "risk.manager",
        "email": "rm@finpal.ie",
        "display_name": "Liam Murphy",
        "role": UserRole.risk_manager,
        "password": "FinPal@RM2",
    },
    {
        "username": "compliance.officer",
        "email": "cmp@finpal.ie",
        "display_name": "Aoife Kelly",
        "role": UserRole.compliance_officer,
        "password": "FinPal@CMP3",
    },
    {
        "username": "ops.manager",
        "email": "ops@finpal.ie",
        "display_name": "Sean O'Brien",
        "role": UserRole.ops_manager,
        "password": "FinPal@OPS4",
    },
    {
        "username": "it.admin",
        "email": "ita@finpal.ie",
        "display_name": "Ciara Walsh",
        "role": UserRole.it_admin,
        "password": "FinPal@ITA5",
    },
    {
        "username": "mrm.analyst",
        "email": "mrm@finpal.ie",
        "display_name": "Niall Byrne",
        "role": UserRole.mrm_analyst,
        "password": "FinPal@MRM6",
    },
    {
        "username": "collections.officer",
        "email": "col@finpal.ie",
        "display_name": "Roisin Doyle",
        "role": UserRole.collections_officer,
        "password": "FinPal@COL7",
    },
    {
        "username": "borrower.sme",
        "email": "sme@acme.ie",
        "display_name": "Acme Ltd",
        "role": UserRole.borrower_sme,
        "password": "FinPal@SME8",
    },
]


async def seed() -> None:
    engine = make_engine(echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        for u in DEMO_USERS:
            import uuid

            from sqlalchemy import select

            result = await session.execute(
                select(User).where(User.username == u["username"])
            )
            if result.scalar_one_or_none():
                print(f"  skip (exists): {u['username']}")
                continue

            user = User(
                id=str(uuid.uuid4()),
                username=u["username"],
                email=u["email"],
                display_name=u["display_name"],
                role=u["role"],
                hashed_pw=hash_password(u["password"]),
                is_active=True,
                mfa_enabled=u["role"] != UserRole.borrower_sme,
            )
            session.add(user)
            print(f"  created: {u['username']} ({u['role'].value})")

        await session.commit()
    print("\nSeed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
