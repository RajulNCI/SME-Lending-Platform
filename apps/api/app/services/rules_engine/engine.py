"""FinPal Rules Engine — orchestrator.

`evaluate(application)` takes the application + IDP-extracted figures + AI model
outputs (PD, optionally LGD) + open-banking data, applies the full deterministic
credit policy, and returns every rule-based field in the FinPal Data Dictionary,
ready to merge with the AI outputs for the credit-officer dashboard.

JSON in, JSON out. No database, no ML training — pure auditable policy.
"""

from __future__ import annotations

from typing import Any

from . import (
    affordability as afford,
)
from . import (
    compliance,
    fairness,
    grading,
    ifrs9,
    lgd_ead,
    openbanking,
    pricing,
    reconciliation,
    state_machine,
)

RULES_ENGINE_VERSION = "finpal-rules-v1.0.0"


def _num(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _bank_figures(app: dict[str, Any]) -> dict[str, Any]:
    """Resolve open-banking figures from a feed, explicit inputs, or derive them."""
    if app.get("transactions"):
        return openbanking.summarise(app["transactions"])
    if app.get("revenueActual") is not None:
        return {
            "revenueActual": _num(app.get("revenueActual")),
            "operating_costs": _num(app.get("operating_costs")),
            "payroll": _num(app.get("payroll")),
            "tax": _num(app.get("tax")),
            "annual_debt_service": _num(app.get("existing_debt_service")),
            "bars": app.get("bars", []),
            "transactions": [],
        }
    return openbanking.derive_from_declared(
        _num(app.get("revenue") or app.get("annual_revenue")),
        actual_revenue=app.get("revenueActual"),
    )


def evaluate(application: dict[str, Any]) -> dict[str, Any]:
    """Run the full rules engine. Returns all rule-based fields."""
    app = dict(application)
    pd = _num(app.get("pd"))
    loan_amount = _num(app.get("amount") or app.get("loan_amount"))
    loan_type = app.get("loanType") or app.get("loan_purpose")
    sector = app.get("sector")
    term_months = int(_num(app.get("loan_term_months"), 60)) or 60
    declared_revenue = _num(app.get("revenue") or app.get("annual_revenue"))
    existing_debt = _num(app.get("existing_debt"))

    # --- Exposure & loss given default --------------------------------------
    ead = lgd_ead.ead(loan_amount, loan_type)
    lgd = (
        _num(app["lgd"])
        if app.get("lgd") is not None
        else lgd_ead.lgd_fallback(loan_type, app.get("has_collateral"))
    )

    # --- Open banking figures ----------------------------------------------
    bank = _bank_figures(app)
    revenue_actual = bank["revenueActual"]
    existing_debt_service = _num(app.get("existing_debt_service")) or bank.get(
        "annual_debt_service", 0.0
    )

    # --- Grade & pricing (grade-banded APR) ---------------------------------
    grade = grading.risk_grade(pd)
    apr = pricing.apr(grade, lgd, sector)

    # --- Cash flow, DSCR, affordability ------------------------------------
    new_repayment = afford.annual_repayment(loan_amount, term_months, apr)
    annual_debt_service = existing_debt_service + new_repayment
    cfads = revenue_actual - bank["operating_costs"] - bank["payroll"] - bank["tax"]
    dscr = afford.dscr(cfads, annual_debt_service)
    cashflow = cfads - annual_debt_service
    afford_fcf = cfads - existing_debt_service
    affordability = afford.affordability_score(afford_fcf, new_repayment)

    # --- Revenue reconciliation --------------------------------------------
    rec = reconciliation.reconcile(declared_revenue, revenue_actual)

    # --- IFRS 9 -------------------------------------------------------------
    days_past_due = int(_num(app.get("days_past_due")))
    ifrs = ifrs9.compute(pd, lgd, ead, dscr, days_past_due)

    # --- Fairness -----------------------------------------------------------
    fair = fairness.evaluate(app.get("fairness_stats"))

    # --- Compliance checks --------------------------------------------------
    ctx = {
        "consents": app.get("consents"),
        "cro_verified": app.get("cro_verified", True),
        "tax_cleared": app.get("tax_cleared", True),
        "aml_hit": app.get("aml_hit", False),
        "pep_hit": app.get("pep_hit", False),
        "fraud_score": app.get("fraud_score", 0.0),
        "reconciliation": rec,
        "dscr": dscr,
        "existing_debt": existing_debt,
        "revenue": declared_revenue or revenue_actual,
        "fairness": fair,
    }
    checks = compliance.run_checks(ctx)
    counts = compliance.summarise_checks(checks)

    # --- Status & recommendation -------------------------------------------
    decision = app.get("decision")
    status = state_machine.derive_status(counts, decision)
    recommended = state_machine.recommended_status(
        grade, dscr, ifrs["eclStage"], counts
    )

    return {
        # credit risk
        "revenueActual": round(revenue_actual, 2),
        "cashflow": round(cashflow, 2),
        "dscr": round(dscr, 2),
        "dscr_policy_pass": dscr >= 1.20,
        "ead": round(ead),
        "lgd": round(lgd, 4),
        "affordability": round(affordability, 2),
        "affordability_pass": affordability >= 0.60,
        "riskGrade": grade,
        "apr": apr,
        "discrepancy": rec["discrepancy"],
        "discrepancyDetail": rec["discrepancyDetail"],
        "revenue_variance_pct": rec["variance_pct"],
        # IFRS 9
        **ifrs,
        # fairness
        "fairnessMetrics": {
            "disparateImpact": fair["disparateImpact"],
            "equalOpportunity": fair["equalOpportunity"],
        },
        # compliance / consent
        "checks": checks,
        "checks_summary": counts,
        "consentLog": compliance.build_consent_log(app.get("consents")),
        # open banking / charts
        "bars": bank.get("bars", []),
        # decisioning
        "status": status,
        "recommendedStatus": recommended,
        "rules_engine_version": RULES_ENGINE_VERSION,
    }
