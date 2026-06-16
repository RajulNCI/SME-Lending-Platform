# Document Extraction API (auto-populate)

Upload a financial document and get the extracted FinPal fields back as JSON — the frontend
uses this to **pre-fill the application form** before the borrower submits.

## Endpoint

`POST /api/v1/extract`  ·  auth: Bearer JWT  ·  body: `multipart/form-data` with `file`

Accepted types: **pdf, jpg, jpeg, png, docx, xlsx, xls** (max 15 MB). Images and scanned PDFs
go through pretrained OCR; digital docs are parsed directly. Returns:

```json
{
  "filename": "x.pdf",
  "content_type": "application/pdf",
  "field_count": 12,
  "fields": {
    "company_name": "...",
    "annual_revenue": 1800000.0,
    "...": "..."
  }
}
```

Errors: `415` unsupported type · `413` too large · `422` no OCR engine for an image.

## Tested output — one document per type

All 6 types tested via the live endpoint. Result: **ALL PASSED**.

### PDF — `finpal_sme_pdf_07.pdf` (HTTP 200)
```json
{
  "company_name": "Galway Technologies Ltd",
  "crn": "470513",
  "sector": "Technology",
  "director_name": "Fionn Moore",
  "director_email": "fionn@galway.ie",
  "director_phone": "+353 88 122 7688",
  "eircode": "K67 N8B9",
  "years_trading": "15",
  "annual_revenue": 4347000.0,
  "ebitda": 783300.0,
  "net_profit": 335400.0,
  "total_assets": 2613000.0,
  "total_liabilities": 802000.0,
  "existing_debt": 275000.0,
  "loan_amount": 155000.0,
  "loan_purpose": "Vehicle Purchase",
  "loan_term_months": 60
}
```

### Word (docx) — `finpal_sme_docx_03.docx` (HTTP 200)
```json
{
  "company_name": "Shannon Technologies Ltd",
  "crn": "646295",
  "sector": "Technology",
  "director_name": "Conor Murphy",
  "director_email": "conor@shannon.ie",
  "director_phone": "+353 88 362 5647",
  "eircode": "P31 K0K9",
  "years_trading": "12",
  "annual_revenue": 4636000.0,
  "ebitda": 724600.0,
  "net_profit": 347900.0,
  "total_assets": 3883000.0,
  "total_liabilities": 989000.0,
  "existing_debt": 448000.0,
  "loan_amount": 37000.0,
  "loan_purpose": "Working Capital",
  "loan_term_months": 36
}
```

### Excel (xlsx) — `finpal_sme_xlsx_02.xlsx` (HTTP 200)
```json
{
  "company_name": "Emerald Wholesale Ltd",
  "crn": "450037",
  "sector": "Wholesale",
  "director_name": "Maeve Byrne",
  "director_email": "maeve@emerald.ie",
  "director_phone": "+353 84 965 9503",
  "eircode": "D02 N9H6",
  "years_trading": "23",
  "annual_revenue": 5517000.0,
  "ebitda": 705300.0,
  "net_profit": 331500.0,
  "total_assets": 4523000.0,
  "total_liabilities": 2916000.0,
  "existing_debt": 1458000.0,
  "loan_amount": 369000.0,
  "loan_purpose": "Equipment Purchase",
  "loan_term_months": 72
}
```

### PNG (image, OCR) — `finpal_sme_png_05.png` (HTTP 200)
```json
{
  "company_name": "Liffey Healthcare Ltd",
  "crn": "565612",
  "sector": "Healthcare",
  "director_name": "Cian Brennan",
  "director_email": "cian@liffey.ie",
  "eircode": "D01 Y5C5",
  "years_trading": "2",
  "annual_revenue": 4777000.0,
  "ebitda": 628200.0,
  "net_profit": 381600.0,
  "total_assets": 2490000.0,
  "total_liabilities": 1054000.0,
  "existing_debt": 675000.0,
  "loan_amount": 91000.0,
  "loan_purpose": "Hiring & Payroll",
  "loan_term_months": 12
}
```

### JPG (image, OCR) — `finpal_sme_jpg_02.jpg` (HTTP 200)
```json
{
  "director_email": "PhoenixConstructionLtd",
  "crn": "689915",
  "sector": "Construction",
  "director_name": "Niamh Murphy",
  "years_trading": "12",
  "annual_revenue": 2025000.0,
  "ebitda": 288600.0,
  "net_profit": 115700.0,
  "total_assets": 1729000.0,
  "total_liabilities": 635000.0,
  "existing_debt": 314000.0,
  "loan_amount": 313000.0,
  "loan_term_months": 48
}
```

### JPEG (image, OCR) — `finpal_sme_jpeg_02.jpeg` (HTTP 200)
```json
{
  "company_name": "Summary AtianticHealthcare Ltd",
  "crn": "554411",
  "director_name": "Ciara Brennan",
  "director_email": "ciara@atlantic.ie",
  "years_trading": "137",
  "annual_revenue": 318300.0,
  "ebitda": 248200.0,
  "net_profit": 3419000.0,
  "total_assets": 1994000.0,
  "total_liabilities": 1366000.0,
  "existing_debt": 218784.0,
  "loan_amount": 194000.0,
  "loan_purpose": "Inventory Financing",
  "loan_term_months": 48
}
```

## Field -> form mapping

`company_name, crn, sector, director_name, director_email, director_phone, eircode,`
`years_trading, annual_revenue, ebitda, net_profit, total_assets, total_liabilities,`
`existing_debt, loan_amount, loan_purpose, loan_term_months` — map 1:1 to the form inputs.
