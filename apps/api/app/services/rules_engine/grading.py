"""Risk grade mapping: PD -> EBA internal rating (A1..D2)."""

from __future__ import annotations

from . import policy


def risk_grade(pd: float) -> str:
    """Map a 12-month PD to the EBA internal rating band."""
    for grade, upper in policy.RISK_GRADE_BANDS:
        if pd < upper:
            return grade
    return "D2"


def is_approvable(grade: str) -> bool:
    """A/B grades are approvable; C/D require elevated scrutiny or decline."""
    return grade in policy.APPROVABLE_GRADES
