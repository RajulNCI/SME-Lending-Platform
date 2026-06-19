"""LGD and EAD.

EAD is fully rule-based (Basel II/III, IFRS 9). LGD is nominally an ML model
(LGD Model v2.1); this provides a deterministic collateral-based fallback used
when no model output is supplied.
"""

from __future__ import annotations

from . import policy


def ead(loan_amount: float, loan_type: str | None, ccf: float = 1.0) -> float:
    """Exposure at Default. Term/asset => loan amount; revolving => limit x CCF."""
    lt = (loan_type or "").strip().upper().replace(" ", "_")
    if lt in {"REVOLVING", "OVERDRAFT", "CREDIT_LINE"}:
        return loan_amount * ccf
    return loan_amount


def lgd_fallback(loan_type: str | None, has_collateral: bool | None = None) -> float:
    """Rule-based LGD = 1 - recovery rate, keyed on loan type and collateral."""
    lt = (loan_type or "").strip().upper().replace(" ", "_")
    base = policy.LGD_BY_LOAN_TYPE.get(lt, policy.LGD_DEFAULT)
    if has_collateral:
        base = min(base, 0.35)
    return base
