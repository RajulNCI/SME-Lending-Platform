"""Unit tests — model governance / drift (REG-004)."""

import numpy as np

from app.services.ai.governance import band, feature_drift, psi, score_drift


def test_psi_zero_for_identical():
    x = np.random.RandomState(0).normal(size=2000)
    assert psi(x, x) < 0.01


def test_band_thresholds():
    assert band(0.05) == "stable"
    assert band(0.15) == "warning"
    assert band(0.30) == "alert"


def test_score_drift_stable():
    rng = np.random.RandomState(1)
    a = rng.uniform(0, 0.3, 3000)
    b = rng.uniform(0, 0.3, 3000)
    assert score_drift(a, b)["status"] == "stable"


def test_score_drift_alert_on_shift():
    rng = np.random.RandomState(2)
    a = rng.uniform(0.0, 0.2, 3000)
    b = rng.uniform(0.6, 0.9, 3000)
    out = score_drift(a, b)
    assert out["status"] == "alert"
    assert "retrain" in out["action"]


def test_feature_drift_reports_worst():
    import pandas as pd

    ref = pd.DataFrame({"x": np.random.RandomState(3).normal(0, 1, 2000)})
    new = pd.DataFrame({"x": np.random.RandomState(4).normal(3, 1, 2000)})
    out = feature_drift(ref, new, ["x"])
    assert out["status"] in ("warning", "alert")
    assert out["max_psi"] > 0.10
