"""
feature_builder — maps a loan application's fields to the PD model's feature vector.

Pure / import-light (pandas + numpy only) so it is unit-testable without the DB or FastAPI.
Computes the derived ratios the model was trained on (DSCR, leverage, coverage, etc.) and
estimates EBITDA when it has not been extracted from documents yet.
"""
from __future__ import annotations
import re
from typing import Any

import numpy as np
import pandas as pd

# columns the PD model expects (order-independent; matched by name)
MODEL_COLUMNS = [
    "sector", "region", "loan_purpose", "annual_revenue", "ebitda", "net_profit",
    "total_assets", "total_liabilities", "existing_debt", "years_trading", "has_collateral",
    "loan_amount", "loan_term_months", "monthly_repayment", "dscr", "interest_coverage",
    "leverage", "loan_to_revenue", "debt_to_revenue",
]


def _num(v: Any, default: float = 0.0) -> float:
    try:
        if v is None:
            return default
        return float(v)
    except (TypeError, ValueError):
        return default


def _years(v: Any) -> int:
    if isinstance(v, (int, float)):
        return int(v)
    m = re.search(r"\d+", str(v or ""))
    return int(m.group()) if m else 1


def build_features(app: dict) -> tuple[pd.DataFrame, dict]:
    """Return (1-row DataFrame for the model, derived values dict).

    `app` is a plain dict of application fields (works for ORM via vars()/asdict)."""
    revenue = max(_num(app.get("annual_revenue")), 1.0)
    net_profit = _num(app.get("net_profit"))
    # EBITDA: use extracted value if present, else approximate from net profit / revenue
    ebitda = _num(app.get("ebitda")) or max(net_profit * 1.6, revenue * 0.08)
    total_assets = max(_num(app.get("total_assets")), 1.0)
    total_liabilities = _num(app.get("total_liabilities"))
    existing_debt = _num(app.get("existing_debt"))
    loan_amount = max(_num(app.get("loan_amount")), 1.0)
    term = int(_num(app.get("loan_term_months"), 36)) or 36

    monthly_repayment = _num(app.get("monthly_repayment"))
    if monthly_repayment <= 0:  # derive a level repayment if not declared
        r = 0.09 / 12
        monthly_repayment = loan_amount * r / (1 - (1 + r) ** -term)

    annual_debt_service = monthly_repayment * 12 + existing_debt * 0.07
    dscr = ebitda / annual_debt_service if annual_debt_service > 0 else 0.0
    interest_coverage = ebitda / (existing_debt * 0.06 + 1)
    leverage = total_liabilities / total_assets
    loan_to_revenue = loan_amount / revenue
    debt_to_revenue = existing_debt / revenue

    row = {
        "sector": app.get("sector") or "Wholesale",
        "region": app.get("region") or "Rest of Ireland",
        "loan_purpose": app.get("loan_purpose") or "Working Capital",
        "annual_revenue": revenue, "ebitda": ebitda, "net_profit": net_profit,
        "total_assets": total_assets, "total_liabilities": total_liabilities,
        "existing_debt": existing_debt, "years_trading": _years(app.get("years_trading")),
        "has_collateral": int(bool(app.get("has_collateral"))),
        "loan_amount": loan_amount, "loan_term_months": term,
        "monthly_repayment": round(monthly_repayment, 2),
        "dscr": round(dscr, 3), "interest_coverage": round(interest_coverage, 3),
        "leverage": round(leverage, 3), "loan_to_revenue": round(loan_to_revenue, 4),
        "debt_to_revenue": round(debt_to_revenue, 4),
    }
    derived = {
        "ebitda": ebitda, "annual_debt_service": annual_debt_service, "dscr": dscr,
        "monthly_repayment": monthly_repayment, "loan_amount": loan_amount,
        "existing_debt": existing_debt, "revenue": revenue,
    }
    df = pd.DataFrame([row])[MODEL_COLUMNS]
    df = df.replace([np.inf, -np.inf], 0.0)
    return df, derived
