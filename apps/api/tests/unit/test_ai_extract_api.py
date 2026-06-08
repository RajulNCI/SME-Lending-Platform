"""Unit tests — POST /api/v1/extract (document field extraction for auto-populate)."""

import importlib.util
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.security import get_current_user
from app.main import app

app.dependency_overrides[get_current_user] = lambda: {"sub": "t", "username": "t"}
client = TestClient(app)

SD = Path(__file__).resolve().parents[2] / "scripts" / "sample_docs"
_HAS_OCR = importlib.util.find_spec("rapidocr_onnxruntime") is not None


def _post(path: Path, mime: str):
    with open(path, "rb") as fh:
        return client.post("/api/v1/extract", files={"file": (path.name, fh, mime)})


@pytest.mark.parametrize(
    ("name", "mime"),
    [
        ("finpal_sme_pdf_07.pdf", "application/pdf"),
        (
            "finpal_sme_docx_03.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ),
        (
            "finpal_sme_xlsx_02.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ),
    ],
)
def test_extract_digital_types(name: str, mime: str) -> None:
    resp = _post(SD / name, mime)
    assert resp.status_code == 200
    body = resp.json()
    assert body["field_count"] >= 10
    f = body["fields"]
    assert f.get("company_name")
    assert f.get("sector")
    assert float(f.get("annual_revenue", 0)) > 0


def test_extract_rejects_unsupported_type() -> None:
    resp = client.post(
        "/api/v1/extract", files={"file": ("x.txt", b"hello", "text/plain")}
    )
    assert resp.status_code == 415


@pytest.mark.skipif(
    not _HAS_OCR, reason="rapidocr not installed (optional [ocr] extra)"
)
def test_extract_image_via_ocr() -> None:
    resp = _post(SD / "finpal_sme_png_05.png", "image/png")
    assert resp.status_code == 200
    assert resp.json()["field_count"] >= 8
