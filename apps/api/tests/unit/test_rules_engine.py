"""Unit tests — FinPal Rules Engine (backup rule-based subsystem).

Validated against the four worked examples in the FinPal Data Dictionary
(O'Brien, Ferris, GreenwayTech; Clancy is 'pending' in the source).
"""

from __future__ import annotations

import pytest

from app.services.rules_engine import evaluate, grading, ifrs9, pricing, reconciliation

# --- Pure-formula checks (exact to the Data Dictionary) --------------------


@pytest.mark.parametrize(
    ("pd", "grade"),
    [
        (0.012, "A1"),
        (0.02, "A2"),
        (0.034, "B1"),
        (0.06, "B2"),
        (0.10, "C1"),
        (0.128, "C2"),
        (0.25, "D1"),
        (0.40, "D2"),
    ],
)
def test_risk_grade_bands(pd, grade):
    assert grading.risk_grade(pd) == grade


@pytest.mark.parametrize(
    ("pd", "lgd", "ead", "expected"),
    [(0.012, 0.35, 90000, 378), (0.128, 0.55, 310000, 21824)],
)
def test_ecl_12m_matches_reference(pd, lgd, ead, expected):
    assert round(ifrs9.ecl_12m(pd, lgd, ead)) == expected


def test_ecl_scenarios_weights():
    s = ifrs9.ecl_scenarios(6020)
    assert s == {"base": 6020, "upside": 4214, "downside": 10836}


@pytest.mark.parametrize(
    ("declared", "actual", "discrepancy", "status"),
    [
        (2.84e6, 2.61e6, True, "warn"),  # O'Brien 8.1% -> within tolerance
        (1.92e6, 1.55e6, True, "fail"),  # Ferris 19.3% -> exceeds tolerance
        (1.10e6, 1.08e6, False, "pass"),
    ],  # Greenway 1.8%
)
def test_reconciliation(declared, actual, discrepancy, status):
    r = reconciliation.reconcile(declared, actual)
    assert r["discrepancy"] is discrepancy
    assert r["status"] == status


@pytest.mark.parametrize(
    ("grade", "apr"), [("A1", 0.062), ("B1", 0.085), ("C2", 0.148)]
)
def test_apr_matches_reference(grade, apr):
    assert pricing.apr(grade) == apr


# --- End-to-end engine on the worked companies ----------------------------

OBRIEN = {
    "sector": "Construction",
    "amount": 420000,
    "loanType": "WORKING_CAPITAL",
    "revenue": 2.84e6,
    "revenueActual": 2.61e6,
    "operating_costs": 1700000,
    "payroll": 210000,
    "tax": 68000,
    "existing_debt_service": 342000,
    "existing_debt": 900000,
    "loan_term_months": 60,
    "pd": 0.034,
    "lgd": 0.42,
    "consents": ["open_banking", "credit_bureau", "art22", "data_retention"],
}
FERRIS = {
    "sector": "Hospitality",
    "amount": 310000,
    "loanType": "WORKING_CAPITAL",
    "revenue": 1.92e6,
    "revenueActual": 1.55e6,
    "operating_costs": 1150000,
    "payroll": 300000,
    "tax": 40000,
    "existing_debt_service": 380000,
    "existing_debt": 1100000,
    "loan_term_months": 60,
    "pd": 0.128,
    "lgd": 0.55,
    "consents": ["open_banking", "credit_bureau", "art22"],
}
GREENWAY = {
    "sector": "Technology",
    "amount": 90000,
    "loanType": "WORKING_CAPITAL",
    "revenue": 1.10e6,
    "revenueActual": 1.08e6,
    "operating_costs": 600000,
    "payroll": 240000,
    "tax": 28000,
    "existing_debt_service": 0,
    "existing_debt": 0,
    "loan_term_months": 48,
    "pd": 0.012,
    "lgd": 0.35,
    "consents": ["open_banking", "art22"],
}


def test_obrien_complete_b1():
    r = evaluate(OBRIEN)
    assert r["riskGrade"] == "B1"
    assert r["eclStage"] == 1
    assert r["status"] == "complete"
    assert r["apr"] == 0.085
    assert r["discrepancy"] is True
    assert r["checks_summary"]["fail"] == 0
    assert len(r["consentLog"]) == 4


def test_ferris_flagged_c2_two_fails():
    r = evaluate(FERRIS)
    assert r["riskGrade"] == "C2"
    assert r["eclStage"] == 2
    assert r["status"] == "flagged"
    assert r["ecl12m"] == 21824
    fails = {c["name"] for c in r["checks"] if c["status"] == "fail"}
    assert fails == {"Revenue Reconciliation", "DSCR Policy Gate"}
    assert r["recommendedStatus"] == "DECLINE"


def test_greenway_all_pass_a1():
    r = evaluate(GREENWAY)
    assert r["riskGrade"] == "A1"
    assert r["eclStage"] == 1
    assert r["ecl12m"] == 378
    assert r["discrepancy"] is False
    assert r["checks_summary"]["fail"] == 0
    assert r["checks_summary"]["warn"] == 0
    assert r["recommendedStatus"] == "APPROVE"
    assert len(r["consentLog"]) == 2


def test_output_has_all_dictionary_fields():
    r = evaluate(GREENWAY)
    for field in [
        "revenueActual",
        "cashflow",
        "dscr",
        "ead",
        "lgd",
        "affordability",
        "riskGrade",
        "apr",
        "discrepancy",
        "discrepancyDetail",
        "eclStage",
        "ecl12m",
        "eclLifetime",
        "ecl12m_base",
        "ecl12m_upside",
        "ecl12m_downside",
        "fairnessMetrics",
        "checks",
        "consentLog",
        "status",
        "recommendedStatus",
    ]:
        assert field in r, f"missing {field}"
