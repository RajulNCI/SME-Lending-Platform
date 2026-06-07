"""
pd_scorer — load the trained PD model and score one application.

Produces the calibrated PD, the risk grade, the 0-100 credit score, and per-application
reason codes (SHAP for tree models; standardized-coefficient contributions for the linear
scorecard). The model artifact is loaded once and cached.
"""
from __future__ import annotations
from functools import lru_cache
from pathlib import Path

import numpy as np
import pandas as pd

ARTIFACT = Path(__file__).resolve().parent / "artifacts" / "finpal_pd_model.joblib"

_GRADE_BANDS = [(0.02, "A"), (0.05, "B"), (0.10, "C"), (0.18, "D"), (0.30, "E"), (0.45, "F")]
# friendlier labels for reason codes
_PRETTY = {
    "dscr": "Debt service coverage (DSCR)", "interest_coverage": "Interest coverage",
    "leverage": "Leverage (liabilities/assets)", "years_trading": "Years trading",
    "net_profit": "Net profit", "ebitda": "EBITDA", "loan_to_revenue": "Loan-to-revenue",
    "debt_to_revenue": "Existing-debt-to-revenue", "has_collateral": "Collateral",
    "annual_revenue": "Annual revenue", "total_liabilities": "Total liabilities",
    "loan_amount": "Loan amount", "monthly_repayment": "Monthly repayment",
}


@lru_cache(maxsize=1)
def _load():
    import joblib
    return joblib.load(ARTIFACT)


def model_version() -> str:
    return _load().get("version", "finpal-pd-unknown")


def grade_for(pd_value: float) -> str:
    for thr, g in _GRADE_BANDS:
        if pd_value < thr:
            return g
    return "G"


def score(df: pd.DataFrame) -> dict:
    """Return {pd, risk_grade, ai_score, shap_codes}."""
    bundle = _load()
    pd_value = float(bundle["model"].predict_proba(df)[:, 1][0])
    pd_value = min(max(pd_value, 0.0001), 0.9999)
    return {
        "pd": round(pd_value, 4),
        "risk_grade": grade_for(pd_value),
        "ai_score": round((1.0 - pd_value) * 100.0, 2),
        "shap_codes": _reason_codes(bundle, df),
    }


def _reason_codes(bundle: dict, df: pd.DataFrame, top: int = 5) -> list[dict]:
    pipe = bundle.get("explainer_pipeline")
    if pipe is None:
        return []
    pre, clf = pipe.named_steps["pre"], pipe.named_steps["clf"]
    x = pre.transform(df)
    x = x.toarray() if hasattr(x, "toarray") else np.asarray(x)
    names = list(pre.get_feature_names_out())

    if hasattr(clf, "coef_"):                      # linear scorecard
        contrib = clf.coef_[0] * x[0]
    else:                                          # tree model
        try:
            import shap
            sv = shap.TreeExplainer(clf).shap_values(x)
            sv = sv[1] if isinstance(sv, list) else sv
            contrib = np.asarray(sv)[0]
        except Exception:                          # noqa: BLE001
            imp = getattr(clf, "feature_importances_", np.zeros(len(names)))
            contrib = imp * np.sign(x[0])

    order = np.argsort(np.abs(contrib))[::-1][:top]
    out = []
    for i in order:
        raw = names[i].split("__")[-1]
        base = raw.split("_")[0] if raw not in _PRETTY else raw
        label = _PRETTY.get(raw) or _PRETTY.get(base) or raw.replace("_", " ").title()
        out.append({
            "feature": label,
            "direction": "increases_risk" if contrib[i] > 0 else "reduces_risk",
            "weight": round(float(abs(contrib[i])), 4),
        })
    return out
