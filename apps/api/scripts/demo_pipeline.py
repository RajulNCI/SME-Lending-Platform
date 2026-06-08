"""
demo_pipeline.py — FULL FinPal AI pipeline end-to-end (Engine 1 -> Engine 2).

For each document: pretrained OCR / direct parse -> trained field extractor -> PD model +
credit metrics -> decision. Shows a raw document becoming a credit-officer assessment.

    python scripts/demo_pipeline.py
"""
import os
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:  # noqa: BLE001
    pass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ai.assessment_service import assess          # noqa: E402
from app.services.ai.idp.extractor import extract_document      # noqa: E402

DATA = Path(__file__).resolve().parent / "sample_docs"

DOCS = [
    ("Digital Word doc", DATA / "finpal_sme_docx_03.docx"),
    ("Digital PDF", DATA / "finpal_sme_pdf_07.pdf"),
    ("Scanned image (OCR)", DATA / "finpal_sme_png_05.png"),
]

for label, path in DOCS:
    print(f"\n{'='*70}\n{label}: {path.name}")
    fields = extract_document(path)                 # Engine 1: OCR/parse -> extract
    print(f"  extracted: {fields.get('company_name')} | {fields.get('sector')} | "
          f"revenue €{float(fields.get('annual_revenue', 0)):,.0f} | "
          f"EBITDA €{float(fields.get('ebitda', 0)):,.0f} | "
          f"loan €{float(fields.get('loan_amount', 0)):,.0f}")
    r = assess(fields)                              # Engine 2: PD + metrics -> decision
    print(f"  DECISION  : grade {r['risk_grade']} | PD {r['pd']:.1%} | "
          f"{r['recommendation'].upper()} | DSCR {r['dscr']} | "
          f"IFRS9 stage {r['ifrs9_stage']} | APR {r['apr']}%")
    print(f"  narrative : {r['narrative'][:150]}...")
