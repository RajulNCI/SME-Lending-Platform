"""Application status state machine.

processing -> complete | flagged -> decided
A FAIL on any check (or revenue variance beyond tolerance) => flagged.
Warnings are noted but do not block (status stays complete, review advised).
The human decision moves a complete/flagged application to decided.
"""

from __future__ import annotations


def derive_status(check_counts: dict[str, int], decision: str | None = None) -> str:
    """Compute status from the compliance check outcome and any human decision."""
    if decision in {"approved", "declined"}:
        return "decided"
    if check_counts.get("fail", 0) > 0:
        return "flagged"
    return "complete"


def recommended_status(
    grade: str, dscr_value: float, stage: int, check_counts: dict[str, int]
) -> str:
    """Engine recommendation for the credit officer (assist only, never final)."""
    from . import policy
    from .grading import is_approvable

    if check_counts.get("fail", 0) > 0 or stage >= 3 or not is_approvable(grade):
        return "DECLINE"
    if (
        dscr_value < policy.DSCR_POLICY_MIN
        or stage == 2
        or check_counts.get("warn", 0) > 0
    ):
        return "REFER"
    return "APPROVE"
