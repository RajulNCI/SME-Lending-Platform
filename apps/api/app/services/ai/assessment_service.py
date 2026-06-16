"""
assessment_service — orchestrates the AI credit assessment (Engine 2).

`assess(app)` takes a plain dict of application fields and returns the full set of
credit-officer AI fields. `apply_to_orm(application, result)` writes the persisted subset
back onto an Application ORM row. Import-light (no DB/FastAPI) so it is unit-testable.
"""

from __future__ import annotations

from typing import Any

from app.services.ai import credit_metrics as cm
from app.services.ai import narrative
from app.services.ai.feature_builder import build_features
from app.services.ai.pd_scorer import model_version, score

# fields that exist as columns on the Application model
_PERSISTED = (
    "ai_score",
    "risk_grade",
    "pd",
    "dscr",
    "apr",
    "affordability",
    "ecl_12m",
    "ifrs9_stage",
    "shap_codes",
    "model_version",
)


def assess(app: dict) -> dict:
    """Run the full AI assessment for one application (dict in -> dict out)."""
    df, derived = build_features(app)
    s = score(df)  # pd, risk_grade, ai_score, shap_codes

    dscr = round(derived["dscr"], 3)
    aff = cm.affordability(derived)
    has_col = bool(app.get("has_collateral"))
    lgd = cm.lgd(has_col)
    ead = cm.ead(derived)
    ecl = cm.ecl_12m(s["pd"], lgd, ead)
    stage = cm.ifrs9_stage(s["pd"], dscr)
    rec = cm.recommendation(s["risk_grade"], dscr, aff, stage)
    term = int(app.get("loan_term_months") or 36)
    apr = cm.apr(s["risk_grade"], term, has_col)

    result = {
        "pd": s["pd"],
        "risk_grade": s["risk_grade"],
        "ai_score": s["ai_score"],
        "dscr": dscr,
        "apr": apr,
        "affordability": aff,
        "lgd": lgd,
        "ead": ead,
        "ecl_12m": ecl,
        "ifrs9_stage": stage,
        "shap_codes": s["shap_codes"],
        "recommendation": rec,
        "model_version": model_version(),
    }
    result["narrative"] = narrative.generate(result)
    return result


def apply_to_orm(application: Any, result: dict) -> None:
    """Write the persisted subset of the assessment onto an Application ORM row."""
    for field in _PERSISTED:
        if hasattr(application, field) and field in result:
            setattr(application, field, result[field])
