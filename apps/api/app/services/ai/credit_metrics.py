"""
credit_metrics — deterministic finance calculations (no ML).

DSCR, affordability, risk-based APR pricing, LGD/EAD, IFRS 9 stage + 12-month ECL, and an
assist recommendation. These are formulas / policy rules, kept separate from the ML model so
they are transparent and auditable.
"""

from __future__ import annotations

# risk-based pricing grid (added to base rate), by grade
_BASE_RATE = 4.5  # % p.a.
_GRADE_PREMIUM = {
    "A": 1.0,
    "B": 2.0,
    "C": 3.5,
    "D": 5.5,
    "E": 8.0,
    "F": 11.0,
    "G": 15.0,
}


def affordability(derived: dict) -> float:
    """Free cash flow vs the proposed annual repayment (>1 = affordable)."""
    fcf = derived["ebitda"] - derived["existing_debt"] * 0.07
    annual_new = derived["monthly_repayment"] * 12
    return round(fcf / annual_new, 2) if annual_new > 0 else 0.0


def apr(grade: str, term_months: int, has_collateral: bool) -> float:
    """Risk-based APR (% p.a.)."""
    rate = _BASE_RATE + _GRADE_PREMIUM.get(grade, 12.0)
    rate += 0.002 * max(term_months - 36, 0)  # small term premium
    if has_collateral:
        rate -= 1.0
    return round(min(max(rate, 4.0), 25.0), 3)


def lgd(has_collateral: bool) -> float:
    """Loss given default — collateralised exposures recover more."""
    return 0.25 if has_collateral else 0.45


def ead(derived: dict) -> float:
    """Exposure at default — full drawn amount for a term loan (CCF = 1)."""
    return round(derived["loan_amount"], 2)


def ecl_12m(pd_value: float, lgd_value: float, ead_value: float) -> float:
    """IFRS 9 12-month expected credit loss = PD x LGD x EAD."""
    return round(pd_value * lgd_value * ead_value, 2)


def ecl_lifetime(
    pd_value: float, lgd_value: float, ead_value: float, term_months: int
) -> float:
    """Simplified lifetime ECL — cumulative PD over term, assuming flat hazard rate."""
    years = term_months / 12
    cumulative_pd = 1 - (1 - pd_value) ** years
    return round(cumulative_pd * lgd_value * ead_value, 2)


def ifrs9_stage(pd_value: float, dscr: float) -> int:
    """Staging: 1 performing, 2 significant increase in credit risk, 3 credit-impaired."""
    if pd_value >= 0.50 or dscr < 1.0:
        return 3
    if pd_value >= 0.18 or dscr < 1.25:
        return 2
    return 1


def recommendation(grade: str, dscr: float, aff: float, stage: int) -> str:
    """Assist recommendation (a human officer always makes the final call)."""
    if grade in ("A", "B", "C") and dscr >= 1.25 and aff >= 1.0 and stage == 1:
        return "approve"
    if grade in ("F", "G") or dscr < 1.0 or stage == 3:
        return "decline"
    return "refer"
