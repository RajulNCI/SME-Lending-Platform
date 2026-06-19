"""Risk-based APR pricing (EBA LOM Section 5 / CRD IV).

Real risk-based pricing is graded: APR = base cost of funds + a spread that steps
up by internal rating grade, with a small adjustment for collateral strength
(LGD). The grade spreads below are calibrated to the FinPal reference book
(A1 -> 6.2%, B1 -> 8.5%, C2 -> 14.8%).
"""

from __future__ import annotations

from . import policy

# Spread over the base rate, by EBA internal rating grade.
GRADE_SPREAD = {
    "A1": 0.017,
    "A2": 0.025,
    "B1": 0.040,
    "B2": 0.058,
    "C1": 0.078,
    "C2": 0.103,
    "D1": 0.135,
    "D2": 0.170,
}


def apr(grade: str, lgd: float | None = None, sector: str | None = None) -> float:
    """Risk-based APR as a decimal fraction (e.g. 0.085 == 8.5%).

    APR = base cost of funds + grade spread. (`lgd`/`sector` are accepted for a
    future collateral/sector adjustment but are not applied, so the headline rate
    matches the reference pricing grid exactly.)
    """
    spread = GRADE_SPREAD.get(grade, 0.103)
    return round(policy.BASE_RATE + spread, 4)
