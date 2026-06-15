"""
test_integration.py — end-to-end test of Phases A + B + C against the real database.

1. (A) connect to the DB, create the schema
2. insert a loan application (ORM)
3. (B+C) run the AI assessment service and write the AI fields onto the row
4. read the row back and verify every AI field persisted
5. clean up the test row

Run (from apps/api, with DATABASE_URL set or in .env):
    .venv/Scripts/python scripts/test_integration.py
"""

import asyncio
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

import app.models  # noqa: F401  (register all tables)
from app.core.database import Base, make_engine
from app.models.application import Application, ApplicationStatus
from app.services.ai.assessment_service import apply_to_orm, assess

ASSESS_FIELDS = (
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

SAMPLE = dict(
    company_name="Shannon Logistics Ltd",
    crn="512345",
    sector="Logistics",
    director_name="Aoife Murphy",
    director_email="aoife@shannon.ie",
    director_phone="+353 87 123 4567",
    address="14 Quay Road, Shannon",
    years_trading="12",
    loan_amount=150_000,
    loan_purpose="Working Capital",
    loan_term_months=60,
    purpose_detail="Fund seasonal working capital and a new vehicle.",
    has_collateral=True,
    annual_revenue=2_400_000,
    net_profit=240_000,
    total_assets=1_800_000,
    total_liabilities=600_000,
    existing_debt=250_000,
    monthly_repayment=3_100,
)


async def main() -> int:
    engine = make_engine(echo=False)
    ok = True
    try:
        # (A) schema
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[A] schema created/verified on DB")

        Session = async_sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
        ref = "ITEST-" + uuid.uuid4().hex[:8].upper()
        async with Session() as s:
            row = Application(
                reference=ref, status=ApplicationStatus.submitted, **SAMPLE
            )
            s.add(row)
            await s.flush()
            app_id = row.id
            print(f"[A] inserted application {ref} (id={app_id[:8]}...)")

            # (B+C) assess + persist
            data = {f: getattr(row, f) for f in ASSESS_FIELDS}
            result = assess(data)
            apply_to_orm(row, result)
            row.status = ApplicationStatus.hitl_queue
            await s.commit()
            print(
                f"[B+C] assessed: grade {result['risk_grade']} | "
                f"PD {result['pd']:.1%} | rec {result['recommendation'].upper()}"
            )

        # read back in a fresh session -> proves persistence
        async with Session() as s:
            row = (
                await s.execute(select(Application).where(Application.id == app_id))
            ).scalar_one()
            print("\n[verify] AI fields read back from DB:")
            for f in (
                "pd",
                "risk_grade",
                "ai_score",
                "dscr",
                "apr",
                "affordability",
                "ecl_12m",
                "ifrs9_stage",
                "model_version",
                "status",
            ):
                print(f"    {f:14s}= {getattr(row, f)}")
            print(f"    shap_codes    = {len(row.shap_codes or [])} reason codes")
            checks = {
                "pd populated": row.pd is not None,
                "grade populated": bool(row.risk_grade),
                "ai_score populated": row.ai_score is not None,
                "dscr populated": row.dscr is not None,
                "ecl_12m populated": row.ecl_12m is not None,
                "ifrs9_stage populated": row.ifrs9_stage is not None,
                "shap_codes populated": bool(row.shap_codes),
                "status -> hitl_queue": row.status == ApplicationStatus.hitl_queue,
            }
            print("\n[verify] checks:")
            for k, v in checks.items():
                print(f"    {'PASS' if v else 'FAIL'}  {k}")
                ok = ok and v

            # cleanup
            await s.execute(delete(Application).where(Application.id == app_id))
            await s.commit()
            print(f"\n[cleanup] removed test row {ref}")

        print("\nRESULT:", "ALL CHECKS PASSED" if ok else "SOME CHECKS FAILED")
        return 0 if ok else 1
    except Exception as exc:
        print(f"\nINTEGRATION TEST FAILED: {type(exc).__name__}: {exc}")
        return 1
    finally:
        await engine.dispose()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
