"""
rules_engine_mock — temporary mock rules engine (Python port of rulesEngineMock.js).

Given extracted application data and a PD score, returns a deterministic rules
result including risk grade, recommended status, DSCR, ECL staging, fairness
metrics, and other policy-derived values.

TODO: Replace with a real rules engine call once the shared service is available.
"""

from __future__ import annotations


def get_mock_rules_result(extracted_data: dict, pd_score: float) -> dict:
    """Run mock rules logic on extracted data + PD score."""
    dscr = extracted_data.get("dscr")
    if dscr is None:
        dscr = 1.2
    try:
        dscr = float(dscr)
    except (TypeError, ValueError):
        dscr = 1.2

    loan_amount = float(extracted_data.get("loan_amount", 0) or 0)

    # Risk grade banding
    if pd_score < 0.05:
        risk_grade = "A"
    elif pd_score < 0.15:
        risk_grade = "B"
    elif pd_score < 0.3:
        risk_grade = "C"
    else:
        risk_grade = "D"

    # Recommended status
    if pd_score < 0.2 and dscr >= 1.1:
        recommended_status = "APPROVED"
    elif pd_score < 0.4:
        recommended_status = "REFERRED"
    else:
        recommended_status = "DECLINED"

    # ECL staging
    if pd_score < 0.1:
        ecl_stage = 1
    elif pd_score < 0.3:
        ecl_stage = 2
    else:
        ecl_stage = 3

    return {
        "riskGrade": risk_grade,
        "dscr": dscr,
        "lgd": 0.45,
        "ead": loan_amount,
        "apr": 7.5,
        "eclStage": ecl_stage,
        "ecl12m": loan_amount * pd_score * 0.45,
        "eclLifetime": loan_amount * pd_score * 0.45 * 1.8,
        "recommendedStatus": recommended_status,
        "discrepancy": False,
        "fairnessMetrics": {"disparateImpact": 0.92, "equalOpportunity": 0.88},
        "_mock": True,
    }
