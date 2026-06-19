"""Post-hoc fairness metrics (EU AI Act Art.10; EEOC 4/5ths rule).

These are portfolio-level metrics computed from historical decisions across
demographic groups. Protected attributes are NEVER model features (GDPR data
minimisation) — they are used only for this monitoring check. When live
historical stats are supplied they are used; otherwise the engine reports the
monitored portfolio baseline.
"""

from __future__ import annotations

from typing import Any

from . import policy

# Portfolio monitoring baseline (from the latest fairness audit).
_BASELINE = {"disparateImpact": 0.92, "equalOpportunity": 0.03}


def disparate_impact(
    protected_approval_rate: float, reference_approval_rate: float
) -> float:
    """Approval rate (protected) / approval rate (reference)."""
    if reference_approval_rate <= 0:
        return 0.0
    return round(protected_approval_rate / reference_approval_rate, 4)


def equal_opportunity_delta(protected_tpr: float, reference_tpr: float) -> float:
    """|TPR(protected) - TPR(reference)|."""
    return round(abs(protected_tpr - reference_tpr), 4)


def evaluate(stats: dict[str, float] | None = None) -> dict[str, Any]:
    """Return fairness metrics + their pass/fail verdicts."""
    if stats:
        di = disparate_impact(
            stats["protected_approval_rate"], stats["reference_approval_rate"]
        )
        eo = equal_opportunity_delta(stats["protected_tpr"], stats["reference_tpr"])
    else:
        di = _BASELINE["disparateImpact"]
        eo = _BASELINE["equalOpportunity"]

    return {
        "disparateImpact": di,
        "equalOpportunity": eo,
        "disparateImpact_pass": di > policy.DISPARATE_IMPACT_MIN,
        "equalOpportunity_pass": eo < policy.EQUAL_OPPORTUNITY_MAX,
    }
