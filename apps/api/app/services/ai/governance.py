"""
governance — runtime model monitoring (EU AI Act REG-004 / MRM).

Population Stability Index (PSI) for drift detection on model scores and input features, with
the standard banding used by the platform:
    PSI < 0.10  -> stable
    0.10–0.25   -> warning  (investigate; trigger challenger evaluation)
    >= 0.25     -> alert    (significant shift; candidate for retrain / rollback)

These are the thresholds wired into the MRM dashboard (PRD REG-004: PSI >= 0.10 triggers a
challenger evaluation within <= 5 business days).
"""
from __future__ import annotations

import numpy as np

WARNING, ALERT = 0.10, 0.25


def psi(expected, actual, bins: int = 10) -> float:
    """Population Stability Index between a reference and a new distribution."""
    expected = np.asarray(expected, dtype=float)
    actual = np.asarray(actual, dtype=float)
    edges = np.quantile(expected, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    e = np.histogram(expected, edges)[0] / max(len(expected), 1)
    a = np.histogram(actual, edges)[0] / max(len(actual), 1)
    e, a = np.clip(e, 1e-4, None), np.clip(a, 1e-4, None)
    return float(np.sum((a - e) * np.log(a / e)))


def band(value: float) -> str:
    if value >= ALERT:
        return "alert"
    if value >= WARNING:
        return "warning"
    return "stable"


def score_drift(reference_scores, new_scores) -> dict:
    """Drift on the model output (PD scores)."""
    v = round(psi(reference_scores, new_scores), 4)
    status = band(v)
    return {
        "metric": "score_psi", "psi": v, "status": status,
        "action": {"stable": "none",
                   "warning": "evaluate challenger within 5 business days",
                   "alert": "retrain / recalibrate / consider rollback"}[status],
    }


def feature_drift(reference_df, new_df, features) -> dict:
    """Per-feature PSI; overall status is the worst feature."""
    out = {}
    for f in features:
        if f in reference_df and f in new_df:
            out[f] = round(psi(reference_df[f], new_df[f]), 4)
    worst = max(out.values(), default=0.0)
    return {"feature_psi": out, "max_psi": round(worst, 4), "status": band(worst)}
