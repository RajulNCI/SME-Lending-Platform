"""DSCR, free cash flow and affordability — deterministic cash-flow formulas.

Sources: EBA LOM Section 4 (creditworthiness) + CGAP responsible lending.
"""

from __future__ import annotations


def annual_repayment(principal: float, term_months: int, annual_rate: float) -> float:
    """Standard amortising annuity payment, annualised.

    Falls back to straight-line if the rate is ~0.
    """
    if term_months <= 0:
        return 0.0
    n = term_months
    r = annual_rate / 12.0
    if r <= 0:
        monthly = principal / n
    else:
        monthly = principal * r / (1 - (1 + r) ** -n)
    return monthly * 12.0


def free_cash_flow(
    actual_revenue: float,
    operating_costs: float,
    payroll: float,
    tax: float,
    existing_debt_service: float,
) -> float:
    """Annual free cash flow after operating outflows and existing debt service."""
    return actual_revenue - operating_costs - payroll - tax - existing_debt_service


def dscr(free_cash_flow_value: float, annual_debt_service: float) -> float:
    """Debt Service Coverage Ratio = FCF / annual debt service."""
    if annual_debt_service <= 0:
        return 0.0
    return free_cash_flow_value / annual_debt_service


def affordability_score(
    free_cash_flow_value: float, new_annual_repayment: float
) -> float:
    """Capacity-to-repay, normalised 0..1: FCF / (FCF + new repayment)."""
    denom = free_cash_flow_value + new_annual_repayment
    if denom <= 0:
        return 0.0
    return max(0.0, min(1.0, free_cash_flow_value / denom))
