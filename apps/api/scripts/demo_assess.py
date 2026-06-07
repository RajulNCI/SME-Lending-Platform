"""
demo_assess.py — run the AI decisioning service on sample applications (no DB needed).

    python scripts/demo_assess.py

Proves Engine 2 produces every credit-officer field end-to-end.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ai.assessment_service import assess  # noqa: E402

SAMPLES = [
    {  # strong applicant
        "company_name": "Shannon Logistics Ltd", "sector": "Logistics", "years_trading": "12",
        "annual_revenue": 2_400_000, "net_profit": 240_000, "total_assets": 1_800_000,
        "total_liabilities": 600_000, "existing_debt": 250_000, "monthly_repayment": 3_100,
        "loan_amount": 150_000, "loan_term_months": 60, "loan_purpose": "Working Capital",
        "has_collateral": True,
    },
    {  # weak applicant
        "company_name": "Temple Catering Ltd", "sector": "Hospitality", "years_trading": "2",
        "annual_revenue": 420_000, "net_profit": 8_000, "total_assets": 250_000,
        "total_liabilities": 210_000, "existing_debt": 160_000, "monthly_repayment": 0,
        "loan_amount": 120_000, "loan_term_months": 36, "loan_purpose": "Refinancing",
        "has_collateral": False,
    },
]

for i, app in enumerate(SAMPLES, 1):
    r = assess(app)
    print(f"\n=== Sample {i}: {app['company_name']} ({app['sector']}) ===")
    print(f"  PD={r['pd']:.3f}  grade={r['risk_grade']}  score={r['ai_score']}  "
          f"rec={r['recommendation'].upper()}")
    print(f"  DSCR={r['dscr']}  affordability={r['affordability']}  APR={r['apr']}%  "
          f"LGD={r['lgd']}  EAD={r['ead']:,.0f}")
    print(f"  IFRS9 stage={r['ifrs9_stage']}  ECL_12m=EUR {r['ecl_12m']:,.0f}  "
          f"model={r['model_version']}")
    print("  reason codes:", json.dumps(r["shap_codes"], ensure_ascii=False))
    print("  narrative:", r["narrative"])
