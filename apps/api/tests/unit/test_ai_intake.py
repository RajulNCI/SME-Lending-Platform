"""Unit tests — multi-document intake (doc-type detection + structured parsers)."""

from __future__ import annotations

from app.services.ai.idp.intake import (
    detect_doc_type,
    parse_bank_statement,
    parse_consent,
    parse_tax_clearance,
)

BANK = """AIB Business Current Account - Statement
IBAN: IE29 AIBK 9311 5212 3456 78 Account: ****4821 PSD2/AISP
Monthly Lodgement Summary
Mar 2024 | 178,000
Apr 2024 | 190,000
Total Lodgements | 368,000
Transaction Detail (Date | Description | Category | Amount)
2024-03-05 | Customer Receipt - Invoice 1040 | Revenue | +97,900
2024-03-26 | Payroll - Monthly Salaries | Payroll | -44,000
2024-03-28 | Loan Repayment - Term Facility | Debt Service | -3,077
2024-03-21 | Revenue Commissioners - VAT | Tax | -48,000
"""

TAX = """Office of the Revenue Commissioners - Tax Clearance Certificate
Tax Registration Number: IE6125349T
Tax Clearance Access Number: 118842207
Tax Clearance Status: VALID
"""

CONSENT = """FinPal - GDPR Data Processing Consent Form
[X] Open Banking (PSD2/AISP) - GRANTED - 2024-02-14 10:32
[X] Credit Bureau - GRANTED - 2024-02-14 10:32
[X] Art.22 Automated Processing - GRANTED - 2024-02-14 10:32
"""


def test_detect_doc_types():
    assert (
        detect_doc_type(BANK) == "bank_statement"
    )  # not tax, despite "Revenue Commissioners"
    assert detect_doc_type(TAX) == "tax_clearance"
    assert detect_doc_type(CONSENT) == "consent"
    assert (
        detect_doc_type("Company Reg. No (CRN): 123  Annual Revenue: 1,000,000")
        == "credit_file"
    )


def test_parse_bank_statement():
    b = parse_bank_statement(BANK)
    assert b["revenueActual"] == 368_000  # from monthly lodgement summary
    assert b["payroll_actual"] == 44_000
    assert b["tax_actual"] == 48_000
    assert b["debt_service_actual"] == 3_077
    assert len(b["bars"]) == 2
    assert b["transactions_display"][0]["category"] == "Revenue"
    assert b["transactions_display"][0]["amount"] == "+97,900"


def test_parse_tax_clearance():
    t = parse_tax_clearance(TAX)
    assert t["tax_cleared"] is True
    assert t["tax_reg_no"] == "IE6125349T"
    assert t["tax_access_no"] == "118842207"


def test_parse_consent():
    c = parse_consent(CONSENT)
    assert set(c["consents"]) == {"open_banking", "credit_bureau", "art22"}
