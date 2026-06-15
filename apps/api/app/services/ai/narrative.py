"""
narrative — plain-language explanation of the assessment for the credit officer.

Template-based for now (deterministic, no external calls). The guardrailed LLM described in
the SDD can replace `generate()` later; it only ever *explains* the numbers, never decides.
"""

from __future__ import annotations


def _dscr_words(dscr: float) -> str:
    if dscr >= 1.5:
        return "strong"
    if dscr >= 1.25:
        return "adequate"
    if dscr >= 1.0:
        return "tight"
    return "insufficient"


def generate(result: dict) -> str:
    pd_pct = result["pd"] * 100
    top = result.get("shap_codes") or []
    drivers = ", ".join(
        f"{c['feature'].lower()} ({'-' if c['direction'] == 'reduces_risk' else '+'})"
        for c in top[:3]
    )
    rec = result["recommendation"]
    lead = {
        "approve": "Recommended for approval",
        "refer": "Referred for manual review",
        "decline": "Recommended for decline",
    }[rec]
    return (
        f"{lead}. Risk grade {result['risk_grade']} with an estimated probability of default "
        f"of {pd_pct:.1f}%. Debt service coverage (DSCR) of {result['dscr']:.2f} indicates "
        f"{_dscr_words(result['dscr'])} repayment capacity; affordability ratio "
        f"{result['affordability']:.2f}. IFRS 9 stage {result['ifrs9_stage']}, 12-month ECL "
        f"€{result['ecl_12m']:,.0f}. Key drivers: {drivers or 'n/a'}. "
        f"This is an AI decision-support assessment and is subject to credit-officer review "
        f"(GDPR Art. 22)."
    )
