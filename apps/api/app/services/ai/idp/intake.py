"""
intake — multi-document applicant processing.

Routes each uploaded document to the right reader and merges everything into one
application dict that drives every credit-officer tab:

  - Credit File / Management Accounts -> trained CRF extractor (company + financials)
  - Bank Statement                    -> transaction parser (open banking tab)
  - Tax Clearance Certificate         -> ROS compliance check
  - GDPR Consent Form                 -> consent log + GDPR check
  - Director ID                       -> AML/KYC flag

Deterministic parsers (no training needed) for the structured documents; the CRF
model still handles the free-form credit file.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from .extractor import extract_application_fields, extract_document
from .parsers import document_to_text


# --------------------------------------------------------------------------
# Document-type detection
# --------------------------------------------------------------------------
def detect_doc_type(text: str) -> str:
    t = text.lower()
    # Bank statement first: IBAN / lodgement / "current account" are unambiguous
    # (a statement can mention "Revenue Commissioners" inside a VAT transaction).
    if (
        "iban" in t
        or "lodgement" in t
        or "current account" in t
        or ("statement" in t and "transaction detail" in t)
    ):
        return "bank_statement"
    if "tax clearance" in t:
        return "tax_clearance"
    if "consent" in t and "granted" in t:
        return "consent"
    if "identity card" in t or "id number" in t:
        return "id"
    if "credit file" in t or "annual revenue" in t or "company reg" in t:
        return "credit_file"
    return "unknown"


# --------------------------------------------------------------------------
# Bank statement parser  ->  open banking figures
# --------------------------------------------------------------------------
_TXN = re.compile(
    r"^(\d{4}-\d{2}-\d{2})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*([+-][\d,]+)\s*$"
)
_MONTH = re.compile(r"^([A-Z][a-z]{2}\s+\d{4})\s*\|\s*([\d,]+)\s*$")


def _num(s: str) -> float:
    return float(s.replace(",", "").replace("+", "").replace("€", "").strip())


def parse_bank_statement(text: str) -> dict[str, Any]:
    txns: list[dict[str, Any]] = []
    monthly: list[tuple[str, float]] = []
    for line in text.splitlines():
        m = _TXN.match(line.strip())
        if m:
            date, desc, cat, amt = m.groups()
            txns.append(
                {
                    "date": date,
                    "desc": desc.strip(),
                    "category": cat.strip(),
                    "amount": _num(amt),
                }
            )
            continue
        mm = _MONTH.match(line.strip())
        if mm and "total" not in line.lower():
            monthly.append((mm.group(1), _num(mm.group(2))))

    revenue = sum(t["amount"] for t in txns if t["amount"] > 0)
    payroll = sum(-t["amount"] for t in txns if t["category"].lower() == "payroll")
    tax = sum(-t["amount"] for t in txns if t["category"].lower() == "tax")
    debt = sum(-t["amount"] for t in txns if "debt" in t["category"].lower())

    lodge = [v for _, v in monthly]
    revenue_actual = sum(lodge) if lodge else revenue
    bars = _to_bars(lodge)

    # display form for the Open Banking tab (signed string amounts)
    display = [
        {
            "date": t["date"],
            "desc": t["desc"],
            "category": t["category"],
            "amount": ("+" if t["amount"] >= 0 else "-") + f"{abs(t['amount']):,.0f}",
        }
        for t in txns
    ]
    return {
        "revenueActual": round(revenue_actual, 2),
        "payroll_actual": round(payroll, 2),
        "tax_actual": round(tax, 2),
        "debt_service_actual": round(debt, 2),
        "bars": bars,
        "transactions_display": display[:12],
        "txn_count": len(txns),
    }


def _to_bars(values: list[float], n: int = 12) -> list[int]:
    if not values:
        return []
    series = values[-n:]
    peak = max(series) or 1.0
    return [round(v / peak * 100) for v in series]


# --------------------------------------------------------------------------
# Tax clearance + consent parsers
# --------------------------------------------------------------------------
def parse_tax_clearance(text: str) -> dict[str, Any]:
    status = re.search(r"tax clearance status\s*:?\s*(\w+)", text, re.I)
    reg = re.search(r"tax registration number\s*:?\s*([A-Z0-9]+)", text, re.I)
    access = re.search(r"access number\s*:?\s*([0-9]+)", text, re.I)
    cleared = bool(
        status and status.group(1).upper() in {"VALID", "ACTIVE", "CONFIRMED"}
    )
    return {
        "tax_cleared": cleared,
        "tax_reg_no": reg.group(1) if reg else None,
        "tax_access_no": access.group(1) if access else None,
    }


_CONSENT_MAP = {
    "open banking": "open_banking",
    "credit bureau": "credit_bureau",
    "art.22": "art22",
    "automated processing": "art22",
    "data retention": "data_retention",
}


def parse_consent(text: str) -> dict[str, Any]:
    granted: set[str] = set()
    for line in text.splitlines():
        if "granted" not in line.lower():
            continue
        low = line.lower()
        for phrase, key in _CONSENT_MAP.items():
            if phrase in low:
                granted.add(key)
    return {"consents": sorted(granted)}


# --------------------------------------------------------------------------
# Orchestrator
# --------------------------------------------------------------------------
def process_documents(paths: list[str | Path]) -> dict[str, Any]:
    """Read every uploaded document and merge into one application dict."""
    merged: dict[str, Any] = {}
    bank: dict[str, Any] = {}
    sources: list[str] = []

    for p in paths:
        path = Path(p)
        try:
            text = document_to_text(path)
        except Exception:  # noqa: S112 -- skip any unreadable upload
            continue
        dtype = detect_doc_type(text)
        sources.append(f"{path.name}:{dtype}")
        if dtype == "credit_file":
            # use the full document path so images route through OCR
            merged.update(
                {k: v for k, v in extract_document(path).items() if v not in (None, "")}
            )
        elif dtype == "bank_statement":
            bank = parse_bank_statement(text)
        elif dtype == "tax_clearance":
            merged.update(parse_tax_clearance(text))
        elif dtype == "consent":
            merged.update(parse_consent(text))
        elif dtype == "id":
            merged["id_verified"] = True
        else:
            # unknown: still try the CRF extractor (best effort)
            f = extract_application_fields(text)
            merged.update(
                {k: v for k, v in f.items() if v not in (None, "") and k not in merged}
            )

    if bank:
        merged["revenueActual"] = bank["revenueActual"]
        merged["bars"] = bank["bars"]
        merged["transactions_display"] = bank["transactions_display"]
        merged["existing_debt_service"] = bank["debt_service_actual"] or None
        merged["_bank_payroll"] = bank["payroll_actual"]
        merged["_bank_tax"] = bank["tax_actual"]

    merged["_sources"] = sources
    merged.setdefault("consents", [])
    return merged
