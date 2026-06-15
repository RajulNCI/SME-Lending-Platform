"""Schema for the document field-extraction endpoint (auto-populate)."""

from typing import Any

from pydantic import BaseModel


class ExtractOut(BaseModel):
    """Fields extracted from an uploaded document, for auto-populating the form."""

    filename: str
    content_type: str | None
    field_count: int
    fields: dict[
        str, Any
    ]  # e.g. {"company_name": "...", "annual_revenue": 1800000.0, ...}
