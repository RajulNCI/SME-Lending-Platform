"""
Document field-extraction endpoint (Engine 1) — auto-populate the application form.

POST /api/v1/extract — upload a document (pdf/jpg/png/jpeg/docx/xlsx); returns the
extracted FinPal fields as JSON so the frontend can pre-fill the form before submit.
"""

import os
import tempfile
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.security import get_current_user
from app.schemas.extraction import ExtractOut

router = APIRouter(tags=["extraction"])

_ALLOWED = {".pdf", ".jpg", ".jpeg", ".png", ".docx", ".xlsx", ".xls"}
_MAX_BYTES = 15 * 1024 * 1024  # 15 MB


@router.post(
    "/extract", response_model=ExtractOut, summary="Extract form fields from a document"
)
async def extract_fields(
    file: UploadFile = File(...),
    token_data: dict[str, Any] = Depends(get_current_user),
) -> ExtractOut:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in _ALLOWED:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported type '{suffix}'. Allowed: {sorted(_ALLOWED)}",
        )

    data = await file.read()
    if len(data) > _MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 15 MB)")

    tmp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(data)
            tmp_path = tmp.name
        # lazy import keeps the heavy CRF/OCR libs off the hot import path
        from app.services.ai.idp.extractor import extract_document

        fields = extract_document(tmp_path)
    except RuntimeError as exc:  # e.g. no OCR engine available for an image
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return ExtractOut(
        filename=file.filename or "",
        content_type=file.content_type,
        field_count=len(fields),
        fields=fields,
    )
