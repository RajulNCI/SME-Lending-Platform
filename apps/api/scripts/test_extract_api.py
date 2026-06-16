"""
test_extract_api.py — tests POST /api/v1/extract for every accepted file type and writes the
API documentation (with real sample outputs) to EXTRACTION_API.md.

    python scripts/test_extract_api.py
"""

import json
import os
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# no DB needed for /extract — skip table creation on startup
os.environ.setdefault("ENVIRONMENT", "production")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from app.core.security import get_current_user
from app.main import app

# bypass JWT auth for the test
app.dependency_overrides[get_current_user] = lambda: {
    "sub": "test",
    "username": "tester",
}

SD = Path(__file__).resolve().parent / "sample_docs"
SAMPLES = [
    ("PDF", SD / "finpal_sme_pdf_07.pdf", "application/pdf"),
    (
        "Word (docx)",
        SD / "finpal_sme_docx_03.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ),
    (
        "Excel (xlsx)",
        SD / "finpal_sme_xlsx_02.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ),
    ("PNG (image, OCR)", SD / "finpal_sme_png_05.png", "image/png"),
    ("JPG (image, OCR)", SD / "finpal_sme_jpg_02.jpg", "image/jpeg"),
    ("JPEG (image, OCR)", SD / "finpal_sme_jpeg_02.jpeg", "image/jpeg"),
]

client = TestClient(app)
results = []
ok = True
for label, path, mime in SAMPLES:
    with open(path, "rb") as fh:
        resp = client.post("/api/v1/extract", files={"file": (path.name, fh, mime)})
    passed = resp.status_code == 200
    ok = ok and passed
    body = resp.json() if passed else {"error": resp.text}
    n = body.get("field_count", 0)
    print(f"  {label:18s} {path.suffix:6s} -> HTTP {resp.status_code}  ({n} fields)")
    results.append((label, path.name, mime, resp.status_code, body))

# ---- write documentation ----
doc = Path(__file__).resolve().parents[1] / "EXTRACTION_API.md"
lines = [
    "# Document Extraction API (auto-populate)",
    "",
    "Upload a financial document and get the extracted FinPal fields back as JSON — the frontend",
    "uses this to **pre-fill the application form** before the borrower submits.",
    "",
    "## Endpoint",
    "",
    "`POST /api/v1/extract`  ·  auth: Bearer JWT  ·  body: `multipart/form-data` with `file`",
    "",
    "Accepted types: **pdf, jpg, jpeg, png, docx, xlsx, xls** (max 15 MB). Images and scanned PDFs",
    "go through pretrained OCR; digital docs are parsed directly. Returns:",
    "",
    "```json",
    json.dumps(
        {
            "filename": "x.pdf",
            "content_type": "application/pdf",
            "field_count": 12,
            "fields": {
                "company_name": "...",
                "annual_revenue": 1800000.0,
                "...": "...",
            },
        },
        indent=2,
    ),
    "```",
    "",
    "Errors: `415` unsupported type · `413` too large · `422` no OCR engine for an image.",
    "",
    "## Tested output — one document per type",
    "",
    f"All {len(SAMPLES)} types tested via the live endpoint. "
    f"Result: **{'ALL PASSED' if ok else 'SOME FAILED'}**.",
    "",
]
for label, name, _mime, status, body in results:
    lines.append(f"### {label} — `{name}` (HTTP {status})")
    lines.append("```json")
    lines.append(json.dumps(body.get("fields", body), indent=2, ensure_ascii=False))
    lines.append("```")
    lines.append("")
lines.append("## Field -> form mapping")
lines.append("")
lines.append(
    "`company_name, crn, sector, director_name, director_email, director_phone, eircode,`"
)
lines.append(
    "`years_trading, annual_revenue, ebitda, net_profit, total_assets, total_liabilities,`"
)
lines.append(
    "`existing_debt, loan_amount, loan_purpose, loan_term_months` — map 1:1 to the form inputs."
)
lines.append("")
doc.write_text("\n".join(lines), encoding="utf-8")

print(f"\nRESULT: {'ALL TYPES PASSED' if ok else 'SOME FAILED'}")
print(f"documented: {doc.name}")
raise SystemExit(0 if ok else 1)
