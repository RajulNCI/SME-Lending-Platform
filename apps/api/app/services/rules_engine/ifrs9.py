"""IFRS 9 staging and Expected Credit Loss (ECL).

Sources: IFRS 9 5.5.3-5.5.5; EBA/GL/2020/06 Section 5.
"""

from __future__ import annotations

from typing import Any

from . import policy


def ecl_stage(pd: float, dscr_value: float, days_past_due: int = 0) -> int:
    """IFRS 9 stage. 1 = performing, 2 = SICR, 3 = default / 90+ DPD."""
    if days_past_due >= 90:
        return 3
    if dscr_value < policy.DSCR_POLICY_MIN or pd > policy.SICR_PD_THRESHOLD:
        return 2
    return 1


def ecl_12m(pd: float, lgd: float, ead: float) -> float:
    """12-month ECL = PD(12m) x LGD x EAD.

    The FinPal reference figures (Data Dictionary worked examples) compute ECL
    without the discount factor, e.g. 0.012 x 0.35 x 90,000 = 378. We match that
    convention so the dashboard reconciles. (DF = 1/(1+EIR) ~= 0.957 is available
    in policy.EIR if exact IFRS 9 discounting is later required.)
    """
    return pd * lgd * ead


def ecl_lifetime(pd: float, lgd: float, ead: float) -> float:
    """Lifetime ECL = PD(lifetime) x LGD x EAD, PD(lifetime) ~= PD x 3.2.

    Note: the reference uses a per-tenor multiplier, so lifetime ECL is an
    approximation (the flat 3.2x average-tenor factor per the Formula Reference).
    """
    pd_lifetime = min(1.0, pd * policy.LIFETIME_TENOR_MULTIPLIER)
    return pd_lifetime * lgd * ead


def ecl_scenarios(ecl_12m_value: float) -> dict[str, int]:
    """Probability-weighted scenario ECLs (base/upside/downside)."""
    return {
        name: round(ecl_12m_value * weight)
        for name, weight in policy.ECL_SCENARIO_WEIGHTS.items()
    }


def compute(
    pd: float, lgd: float, ead: float, dscr_value: float, days_past_due: int = 0
) -> dict[str, Any]:
    """Full IFRS 9 block: stage + 12m + lifetime + scenarios + the provision used."""
    stage = ecl_stage(pd, dscr_value, days_past_due)
    e12 = ecl_12m(pd, lgd, ead)
    elt = ecl_lifetime(pd, lgd, ead)
    scenarios = ecl_scenarios(e12)
    provision = round(elt) if stage >= 2 else round(e12)
    return {
        "eclStage": stage,
        "ecl12m": round(e12),
        "eclLifetime": round(elt),
        "ecl12m_base": scenarios["base"],
        "ecl12m_upside": scenarios["upside"],
        "ecl12m_downside": scenarios["downside"],
        "ecl_provision": provision,
    }
