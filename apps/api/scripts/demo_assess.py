"""
demo_assess.py — run the AI decisioning service on sample applications (no DB needed).

    python scripts/demo_assess.py

Proves Engine 2 produces every credit-officer field end-to-end.
"""

import json
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")  # show € correctly on Windows consoles
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ai.assessment_service import assess

SAMPLES = [
    {  # strong (expect APPROVE)
        "company_name": "Shannon Logistics Ltd",
        "sector": "Logistics",
        "years_trading": "11",
        "annual_revenue": 1_800_000,
        "net_profit": 150_000,
        "total_assets": 1_400_000,
        "total_liabilities": 520_000,
        "existing_debt": 350_000,
        "monthly_repayment": 5_500,
        "loan_amount": 180_000,
        "loan_term_months": 60,
        "loan_purpose": "Working Capital",
        "has_collateral": True,
    },
    {  # decent mid-market (expect APPROVE, lower grade)
        "company_name": "Grafton Retail Ltd",
        "sector": "Retail",
        "years_trading": "4",
        "annual_revenue": 900_000,
        "net_profit": 54_000,
        "total_assets": 600_000,
        "total_liabilities": 360_000,
        "existing_debt": 180_000,
        "monthly_repayment": 2_400,
        "loan_amount": 110_000,
        "loan_term_months": 48,
        "loan_purpose": "Inventory Financing",
        "has_collateral": False,
    },
    {  # weak (expect DECLINE)
        "company_name": "Temple Catering Ltd",
        "sector": "Hospitality",
        "years_trading": "2",
        "annual_revenue": 420_000,
        "net_profit": 8_000,
        "total_assets": 250_000,
        "total_liabilities": 210_000,
        "existing_debt": 160_000,
        "monthly_repayment": 0,
        "loan_amount": 120_000,
        "loan_term_months": 36,
        "loan_purpose": "Refinancing",
        "has_collateral": False,
    },
]

for i, app in enumerate(SAMPLES, 1):
    r = assess(app)
    print(f"\n=== Sample {i}: {app['company_name']} ({app['sector']}) ===")
    print(
        f"  PD={r['pd']:.3f}  grade={r['risk_grade']}  score={r['ai_score']}  "
        f"rec={r['recommendation'].upper()}"
    )
    print(
        f"  DSCR={r['dscr']}  affordability={r['affordability']}  APR={r['apr']}%  "
        f"LGD={r['lgd']}  EAD={r['ead']:,.0f}"
    )
    print(
        f"  IFRS9 stage={r['ifrs9_stage']}  ECL_12m=EUR {r['ecl_12m']:,.0f}  "
        f"model={r['model_version']}"
    )
    print("  reason codes:", json.dumps(r["shap_codes"], ensure_ascii=False))
    print("  narrative:", r["narrative"])
