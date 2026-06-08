"""Unit tests — AI credit-decisioning engine (Engine 2)."""

from app.services.ai import credit_metrics as cm
from app.services.ai.assessment_service import assess
from app.services.ai.feature_builder import MODEL_COLUMNS, build_features
from app.services.ai.pd_scorer import grade_for, score

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
}
WEAK = {
    "sector": "Hospitality",
    "years_trading": "2",
    "annual_revenue": 300_000,
    "net_profit": 5_000,
    "total_assets": 200_000,
    "total_liabilities": 190_000,
    "existing_debt": 150_000,
    "monthly_repayment": 0,
    "loan_amount": 130_000,
    "loan_term_months": 36,
    "loan_purpose": "Refinancing",
    "has_collateral": False,
}


# ---- credit_metrics (deterministic formulas) ----
def test_lgd_collateral_lower():
    assert cm.lgd(True) < cm.lgd(False)


def test_ead_is_loan_amount():
    assert cm.ead({"loan_amount": 150_000}) == 150_000


def test_ecl_formula():
    assert cm.ecl_12m(0.10, 0.45, 100_000) == 4500.0


def test_ifrs9_staging():
    assert cm.ifrs9_stage(0.02, 2.0) == 1
    assert cm.ifrs9_stage(0.20, 1.5) == 2
    assert cm.ifrs9_stage(0.60, 0.5) == 3


def test_apr_collateral_discount():
    assert cm.apr("B", 36, True) < cm.apr("B", 36, False)


def test_recommendation_paths():
    assert cm.recommendation("A", 2.0, 2.0, 1) == "approve"
    assert cm.recommendation("G", 2.0, 2.0, 1) == "decline"
    assert cm.recommendation("D", 1.5, 1.2, 1) == "refer"


# ---- feature_builder ----
def test_feature_columns_exact():
    df, _ = build_features(STRONG)
    assert list(df.columns) == MODEL_COLUMNS
    assert len(df) == 1


def test_feature_builder_handles_empty():
    df, derived = build_features({})
    assert df.shape[0] == 1 and derived["dscr"] >= 0


# ---- pd_scorer ----
def test_grade_bands():
    assert grade_for(0.005) == "A"
    assert grade_for(0.5) == "G"


def test_score_outputs():
    df, _ = build_features(STRONG)
    s = score(df)
    assert 0.0 <= s["pd"] <= 1.0
    assert s["risk_grade"] in set("ABCDEFG")
    assert len(s["shap_codes"]) > 0


# ---- assessment orchestrator ----
def test_assess_returns_all_fields():
    r = assess(STRONG)
    for k in (
        "pd",
        "risk_grade",
        "ai_score",
        "dscr",
        "apr",
        "affordability",
        "lgd",
        "ead",
        "ecl_12m",
        "ifrs9_stage",
        "shap_codes",
        "narrative",
        "recommendation",
        "model_version",
    ):
        assert k in r


def test_strong_lower_pd_than_weak():
    assert assess(STRONG)["pd"] < assess(WEAK)["pd"]


def test_assess_is_deterministic():
    assert assess(STRONG)["pd"] == assess(STRONG)["pd"]


def test_narrative_mentions_review():
    assert "review" in assess(STRONG)["narrative"].lower()
