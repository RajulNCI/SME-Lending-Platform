"""Revenue reconciliation: declared revenue (IDP) vs actual lodgements (open banking).

EBA LOM data-quality control + GDPR Art.22 accuracy of automated-decision inputs.
"""

from __future__ import annotations

from typing import Any

from . import policy


def _eur(amount: float) -> str:
    """Human-readable EUR string, e.g. 230000 -> '€230K', 2610000 -> '€2.61M'."""
    a = abs(amount)
    if a >= 1_000_000:
        return f"€{amount / 1_000_000:.2f}M"
    if a >= 1_000:
        return f"€{amount / 1_000:.0f}K"
    return f"€{amount:,.0f}"


def reconcile(declared_revenue: float, actual_revenue: float) -> dict[str, Any]:
    """Compare declared vs actual revenue and produce the reconciliation result.

    Returns variance, the `discrepancy` boolean, the pass/warn/fail status of the
    revenue-reconciliation check, and the `discrepancyDetail` narrative string.
    """
    if not declared_revenue:
        return {
            "variance_eur": 0.0,
            "variance_pct": 0.0,
            "discrepancy": False,
            "status": "warn",
            "discrepancyDetail": "Declared revenue unavailable; could not reconcile.",
        }

    diff = abs(declared_revenue - actual_revenue)
    pct = diff / declared_revenue

    discrepancy = pct > policy.REVENUE_MATERIAL_PCT
    if pct > policy.REVENUE_TOLERANCE_PCT:
        status = "fail"
    elif discrepancy:
        status = "warn"
    else:
        status = "pass"

    if not discrepancy:
        detail = "N/A — no material discrepancy."
    elif status == "warn":
        detail = (
            f"Declared {_eur(declared_revenue)} vs actual {_eur(actual_revenue)} — "
            f"variance {_eur(diff)} ({pct * 100:.1f}%). Within 10% tolerance; "
            f"flagged for underwriter review."
        )
    else:
        detail = (
            f"Declared {_eur(declared_revenue)} vs actual {_eur(actual_revenue)} — "
            f"variance {_eur(diff)} ({pct * 100:.1f}%). EXCEEDS 10% tolerance. "
            f"Recommend decline unless additional collateral offered."
        )

    return {
        "variance_eur": round(diff, 2),
        "variance_pct": round(pct, 4),
        "discrepancy": discrepancy,
        "status": status,
        "discrepancyDetail": detail,
    }
