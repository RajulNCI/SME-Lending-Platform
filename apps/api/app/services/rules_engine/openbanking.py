"""Open banking (PSD2/AISP) aggregation.

Raw transaction pull is rule-based; category labels come from an ML classifier
upstream. This module aggregates a categorised transaction feed into the figures
the rules engine needs: actual revenue, categorised outflows, and the 12-month
revenue bar indices. If no feed is supplied it derives plausible figures from the
declared revenue so the engine can still run end-to-end (backup/demo mode).
"""

from __future__ import annotations

from typing import Any

REVENUE_CATS = {"revenue", "sales", "lodgement", "income"}
PAYROLL_CATS = {"payroll", "wages", "salary"}
TAX_CATS = {"tax", "ros", "vat", "paye"}
DEBT_CATS = {"debt service", "debt", "loan repayment", "repayment"}


def _cat(t: dict[str, Any]) -> str:
    return str(t.get("category", "")).strip().lower()


def summarise(transactions: list[dict[str, Any]]) -> dict[str, Any]:
    """Aggregate a categorised transaction feed into annual figures + bars."""
    revenue = payroll = tax = debt = other_out = 0.0
    monthly: dict[str, float] = {}
    for t in transactions:
        amt = float(t.get("amount", 0) or 0)
        cat = _cat(t)
        if amt > 0 or cat in REVENUE_CATS:
            revenue += abs(amt)
            month = str(t.get("date", ""))[:7]
            monthly[month] = monthly.get(month, 0.0) + abs(amt)
        elif cat in PAYROLL_CATS:
            payroll += abs(amt)
        elif cat in TAX_CATS:
            tax += abs(amt)
        elif cat in DEBT_CATS:
            debt += abs(amt)
        else:
            other_out += abs(amt)

    bars = _to_bars(list(monthly.values()))
    return {
        "revenueActual": round(revenue, 2),
        "payroll": round(payroll, 2),
        "tax": round(tax, 2),
        "annual_debt_service": round(debt, 2),
        "operating_costs": round(other_out, 2),
        "bars": bars,
        "transactions": transactions,
    }


def _to_bars(values: list[float], n: int = 12) -> list[int]:
    """Normalise monthly lodgements to 0-100 relative indices for charting."""
    if not values:
        return []
    series = values[-n:]
    peak = max(series) or 1.0
    return [round(v / peak * 100) for v in series]


def derive_from_declared(
    declared_revenue: float,
    actual_revenue: float | None = None,
    *,
    opex_ratio: float = 0.55,
    payroll_ratio: float = 0.22,
    tax_ratio: float = 0.08,
) -> dict[str, Any]:
    """Backup/demo mode: build plausible figures when no open-banking feed exists."""
    actual = actual_revenue if actual_revenue is not None else declared_revenue * 0.95
    return {
        "revenueActual": round(actual, 2),
        "operating_costs": round(actual * opex_ratio, 2),
        "payroll": round(actual * payroll_ratio, 2),
        "tax": round(actual * tax_ratio, 2),
        "bars": [],
        "transactions": [],
    }
