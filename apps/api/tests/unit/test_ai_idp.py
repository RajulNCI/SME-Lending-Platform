"""Unit tests — IDP field extractor (Engine 1)."""

from pathlib import Path

from app.services.ai.idp.decode import parse_money
from app.services.ai.idp.extractor import (
    extract_application_fields,
    extract_document,
    tokenize,
)

SAMPLE_DOCX = (
    Path(__file__).resolve().parents[2]
    / "scripts"
    / "sample_docs"
    / "finpal_sme_docx_03.docx"
)


def test_tokenize_keeps_money_whole():
    toks = tokenize("Annual Revenue : €1,234,000")
    assert "€1,234,000" in toks


def test_parse_money_formats():
    assert parse_money("€1,234,000") == 1_234_000
    assert parse_money("EUR 500,000") == 500_000
    assert abs(parse_money("€1.5m") - 1_500_000) < 1


def test_extract_from_real_document():
    """Representative path: extract fields from an actual sample document."""
    f = extract_document(SAMPLE_DOCX)
    assert f.get("company_name")
    assert f.get("sector")
    assert float(f.get("annual_revenue", 0)) > 0
    assert float(f.get("ebitda", 0)) > 0
    assert f.get("loan_amount")
    assert f.get("loan_term_months")


def test_extract_synonym_turnover():
    # the model should recognise 'Turnover' as revenue
    f = extract_application_fields("Turnover : €2,000,000 Sector : Logistics")
    assert abs(float(f.get("annual_revenue", 0)) - 2_000_000) < 1
