"""
extractor — the FinPal field-extraction model at inference time.

Loads the trained CRF, tokenizes document text the same way the corpus was tokenized, predicts
BIO tags, and decodes them into structured fields. Maps to the FinPal application schema.
"""
from __future__ import annotations
import re
from functools import lru_cache
from pathlib import Path

from app.services.ai.idp.decode import extract_fields
from app.services.ai.idp.features import feats
from app.services.ai.idp.parsers import document_to_text

ARTIFACT = Path(__file__).resolve().parent / "finpal_extractor.joblib"

# money tokens (€/EUR + digits, incl. "1.23m") stay whole; emails/phones/words stay whole;
# punctuation splits off — matching how the training corpus was tokenized.
# NB: the "m" suffix must be attached (no space) so "72 Monthly" does NOT become "72 M".
_TOKEN_RE = re.compile(r"€?\d[\d,]*(?:\.\d+)?m?|EUR|[A-Za-z0-9.+@'_-]+|[^\s\w]", re.I)

# extractor tag -> FinPal application field
TAG_TO_FIELD = {
    "COMPANY": "company_name", "CRN": "crn", "SECTOR": "sector",
    "DIRECTOR": "director_name", "EMAIL": "director_email", "PHONE": "director_phone",
    "EIRCODE": "eircode", "YEARS": "years_trading", "REVENUE": "annual_revenue",
    "EBITDA": "ebitda", "NETPROFIT": "net_profit", "ASSETS": "total_assets",
    "LIABILITIES": "total_liabilities", "DEBT": "existing_debt", "LOANAMT": "loan_amount",
    "PURPOSE": "loan_purpose", "TERM": "loan_term_months",
}


@lru_cache(maxsize=1)
def _crf():
    import joblib
    return joblib.load(ARTIFACT)["crf"]


def tokenize(text: str) -> list[str]:
    return [t.strip() for t in _TOKEN_RE.findall(text.replace("\n", " ")) if t.strip()]


def extract(text: str) -> dict:
    """Document text -> {TAG: value}."""
    toks = tokenize(text)
    if not toks:
        return {}
    labels = _crf().predict_single(feats(toks))
    return extract_fields(toks, labels)


def extract_application_fields(text: str) -> dict:
    """Document text -> FinPal application fields (mapped + typed)."""
    raw = extract(text)
    out = {}
    for tag, val in raw.items():
        field = TAG_TO_FIELD.get(tag)
        if not field:
            continue
        if tag == "TERM":
            digits = re.sub(r"[^\d]", "", str(val))
            val = int(digits) if digits else None
        out[field] = val
    return out


def extract_document(path, ocr_engine=None) -> dict:
    """Path/upload -> FinPal application fields (parses or OCRs, then extracts)."""
    return extract_application_fields(document_to_text(path, ocr_engine))
