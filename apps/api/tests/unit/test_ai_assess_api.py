"""Unit tests — stateless POST /api/v1/assess (fields in -> assessment out, no DB)."""

from fastapi.testclient import TestClient

from app.core.security import get_current_user
from app.main import app

app.dependency_overrides[get_current_user] = lambda: {"sub": "svc", "username": "svc"}
client = TestClient(app)

STRONG = {
    "sector": "Logistics",
    "years_trading": "12",
    "annual_revenue": 2_400_000,
    "net_profit": 240_000,
    "total_assets": 1_800_000,
    "total_liabilities": 500_000,
    "existing_debt": 200_000,
    "monthly_repayment": 3_000,
    "loan_amount": 120_000,
    "loan_term_months": 60,
    "loan_purpose": "Working Capital",
    "has_collateral": True,
    "reference": "app-123",
}


def test_stateless_assess_full() -> None:
    r = client.post("/api/v1/assess", json=STRONG)
    assert r.status_code == 200
    d = r.json()
    assert d["application_id"] == "app-123"  # client reference echoed back
    assert 0.0 <= d["pd"] <= 1.0
    assert d["risk_grade"] in set("ABCDEFG")
    assert d["recommendation"] in ("approve", "refer", "decline")
    assert len(d["shap_codes"]) > 0
    assert d["narrative"]


def test_stateless_assess_minimal_fields() -> None:
    r = client.post(
        "/api/v1/assess", json={"annual_revenue": 1_000_000, "loan_amount": 100_000}
    )
    assert r.status_code == 200
    assert r.json()["pd"] is not None


def test_stateless_assess_requires_core_fields() -> None:
    r = client.post("/api/v1/assess", json={"sector": "Retail"})  # missing revenue/loan
    assert r.status_code == 422
