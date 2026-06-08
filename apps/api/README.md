# FinPal API

FastAPI backend for the FinPal AI-driven SME Lending Platform.

## Quick start

```bash
cp .env.example .env
pip install -e ".[dev]"
python scripts/seed_users.py
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

## Key endpoints

| Method | Path | Role | Description |
|---|---|---|---|
| POST | /api/v1/auth/login | All | Sign in, get JWT |
| GET | /api/v1/auth/me | All | Current user info |
| GET | /api/v1/applications | Credit Officer+ | List applications |
| POST | /api/v1/applications | Any | Create application |
| GET | /api/v1/applications/{id} | Any | Application detail |
| **POST** | **/api/v1/extract** | Any | **Extract fields from a document (auto-populate form)** |
| **POST** | **/api/v1/applications/{id}/submit** | Borrower+ | **Async submit → queue → worker** |
| **GET** | **/api/v1/applications/{id}/status** | Any | **Poll live processing status/progress** |
| **POST** | **/api/v1/applications/{id}/assess** | Credit Officer+ | **Run the AI assessment (Engine 2)** |
| POST | /api/v1/applications/{id}/decisions | Credit Officer | HITL decision |
| GET | /api/v1/applications/{id}/evidence | Compliance Officer | Evidence bundle |
| GET | /api/v1/health | Public | Health check |

## AI subsystem (Nathan) — built & tested

Two trained-from-scratch models, integrated end-to-end (branch `nathan-integration-ai`):

- **Engine 1 — IDP extraction** (`app/services/ai/idp/`): pretrained OCR (rapidocr/Textract) for
  images + direct parse for docx/xlsx/pdf → a **trained CRF** pulls the FinPal fields.
  **100%** field accuracy on held-out real docs. Exposed at `POST /extract` for form auto-populate.
- **Engine 2 — credit decisioning** (`app/services/ai/`): a **train-own calibrated PD model**
  (AUC 0.88 synthetic / 0.84 on real UCI German Credit) → PD, risk grade, DSCR, affordability,
  APR, LGD/EAD, IFRS 9 ECL, **SHAP** reason codes + narrative.
- **Async worker** (`app/services/ai/worker.py`, `app/services/queue.py`): submit → queue →
  worker (OCR → AI) → live status → human-in-the-loop. Queue is SQS-swappable.
- **Governance** (`app/services/ai/governance.py`): PSI drift monitoring; fairness + a validation
  report exist in the AI docs.

**Database:** Neon (serverless Postgres) for dev/demo → AWS RDS for production.

**Docs for developers:**
- [`AI_HANDOFF.md`](AI_HANDOFF.md) — branch summary, run guide, full **API contract**, CI status
- [`EXTRACTION_API.md`](EXTRACTION_API.md) — the `/extract` API + **real sample outputs per file type**
- AI design docs (HLD/LLD/SDD/**TSD**/Model Validation Report) live in `Citi UpStart 2026/AI-Part-Nathan/`

Try it: `python scripts/demo_pipeline.py` (document → decision) ·
`python scripts/test_extract_api.py` (all 6 file types).

## Running tests

```bash
pytest tests/ -v
```