"""Unit tests — Pydantic schema validation."""
import pytest
from decimal import Decimal
from app.schemas.application import ApplicationCreate
from app.schemas.decision import DecisionCreate


def _valid_app(**overrides):
    base = dict(
        company_name="Acme Ltd", crn="123456", sector="IT",
        director_name="Jane", director_email="jane@acme.ie",
        director_phone="+353871234567", address="Dublin 2",
        years_trading="5-10", loan_amount=Decimal("50000"),
        loan_purpose="Working capital", loan_term_months=36,
        purpose_detail="To fund working capital requirements for Q3 expansion.",
        consent_data_processing=True, consent_ccr=True, consent_ai_decision=True,
    )
    base.update(overrides)
    return base


def test_application_valid():
    app = ApplicationCreate(**_valid_app())
    assert app.company_name == "Acme Ltd"


def test_application_min_loan_fails():
    with pytest.raises(Exception):
        ApplicationCreate(**_valid_app(loan_amount=Decimal("5000")))


def test_application_no_consent_fails():
    with pytest.raises(Exception):
        ApplicationCreate(**_valid_app(consent_ccr=False))


def test_decision_valid():
    d = DecisionCreate(outcome="approved", rationale="Strong financials, DSCR above policy minimum.")
    assert d.outcome == "approved"


def test_decision_short_rationale_fails():
    with pytest.raises(Exception):
        DecisionCreate(outcome="declined", rationale="Too short")


def test_decision_invalid_outcome_fails():
    with pytest.raises(Exception):
        DecisionCreate(outcome="maybe", rationale="This is a valid rationale length okay.")