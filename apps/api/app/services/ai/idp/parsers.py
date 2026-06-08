"""
parsers — turn an uploaded document into plain text for the extractor.

Digital formats (docx/xlsx/pdf) are parsed directly (no OCR). Images (jpg/png/jpeg) and scanned
PDFs go through a pluggable OCR adapter — wire in AWS Textract / PaddleOCR / Tesseract in
production. The trained extractor then runs on the resulting text regardless of source.
"""
from __future__ import annotations
from pathlib import Path


def parse_docx(path) -> str:
    from docx import Document
    doc = Document(str(path))
    parts = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            parts.append("  ".join(c.text for c in row.cells if c.text.strip()))
    return "\n".join(parts)


def parse_xlsx(path) -> str:
    from openpyxl import load_workbook
    wb = load_workbook(str(path), data_only=True)
    out = []
    for ws in wb.worksheets:
        for row in ws.iter_rows(values_only=True):
            cells = [str(c) for c in row if c is not None and str(c).strip()]
            if cells:
                out.append("  ".join(cells))
    return "\n".join(out)


def parse_pdf(path) -> str:
    import pdfplumber
    with pdfplumber.open(str(path)) as pdf:
        return "\n".join((pg.extract_text() or "") for pg in pdf.pages)


def ocr_image(path, engine=None) -> str:
    """Pretrained-OCR adapter. `engine` is a callable(path)->str (Textract/PaddleOCR/Tesseract).
    Tries rapidocr-onnxruntime if installed and no engine supplied."""
    if engine is not None:
        return engine(path)
    try:
        from rapidocr_onnxruntime import RapidOCR
        res, _ = RapidOCR()(str(path))
        return "\n".join(line[1] for line in (res or []))
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(
            "No OCR engine available. Pass `engine=` (Textract/PaddleOCR/Tesseract) "
            f"or install rapidocr-onnxruntime. ({type(exc).__name__})"
        )


def document_to_text(path, ocr_engine=None) -> str:
    ext = Path(path).suffix.lower().lstrip(".")
    if ext == "docx":
        return parse_docx(path)
    if ext in ("xlsx", "xls"):
        return parse_xlsx(path)
    if ext == "pdf":
        return parse_pdf(path)
    if ext in ("jpg", "jpeg", "png", "tif", "tiff", "bmp"):
        return ocr_image(path, ocr_engine)
    raise ValueError(f"unsupported document type: .{ext}")
