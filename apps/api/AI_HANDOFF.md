# AI Subsystem — Handoff (branch `nathan-integration-ai`)

Nathan's AI part: **document field extraction (Engine 1)** + **AI credit decisioning (Engine 2)**,
wired into the FastAPI backend with an async worker. Ready for review and merge by the lead.

## What's in this branch

| Area | Files |
|---|---|
| DB engine (managed Postgres: Neon/RDS) | `app/core/database.py` (`make_engine`) |
| Engine 2 — decisioning | `app/services/ai/{feature_builder,pd_scorer,credit_metrics,narrative,assessment_service}.py` + `artifacts/finpal_pd_model.joblib` |
| Engine 1 — IDP extractor | `app/services/ai/idp/{extractor,features,decode,parsers}.py` + `finpal_extractor.joblib` |
| Async worker + queue | `app/services/ai/worker.py`, `app/services/queue.py`, `app/models/processing_job.py` |
| Governance / drift | `app/services/ai/governance.py` |
| Endpoints | `app/api/v1/endpoints/{assessment,processing}.py` (+ router) |
| Schemas | `app/schemas/{assessment,processing}.py` |
| Tests | `tests/unit/test_ai_*.py` (23 tests) |
| Scripts (verification/demos) | `scripts/{check_db,demo_assess,demo_pipeline,test_integration,test_worker}.py` |

New dependencies (in `pyproject.toml`): `scikit-learn, lightgbm, shap, joblib, pandas, numpy,
sklearn-crfsuite, python-docx, openpyxl, pdfplumber`; optional extra `[ocr] = rapidocr-onnxruntime`.

## How to run

```bash
cd apps/api
pip install -e ".[dev]"                 # add --trusted-host pypi.org --trusted-host files.pythonhosted.org if behind a TLS proxy
cp .env.example .env                     # set DATABASE_URL (Neon/local)
python scripts/check_db.py               # DB connectivity
python scripts/demo_assess.py            # Engine 2 on sample applications
python scripts/demo_pipeline.py          # full pipeline: document -> extract -> decision
pytest tests/unit/test_ai_*.py           # 23 AI tests
uvicorn app.main:app --reload            # live API + Swagger at /docs
```

## CI status

For the **AI code in this branch**: `ruff check` ✅, `ruff format --check` ✅, `mypy` ✅ (clean),
`bandit -ll` ✅, `pytest` ✅ (23 pass).

⚠️ **Pre-existing repo issue (not from this branch):** `mypy app/` reports ~28 strict errors in
existing files (`applications.py`, `security.py`, `auth.py`, `decisions.py`, `health.py`,
`config.py`, `main.py`, `middleware/cors.py`, models, `application_service.py`) — mostly bare
`dict`/`list` generics and missing return annotations. The strict `mypy` gate was already failing
on `main`/the parent branch. **Options:** annotate those files, or relax the two flags the codebase
doesn't meet (`disallow_any_generics`, `disallow_untyped_defs`). Team decision — out of scope for
the AI part. (This branch added `namespace_packages`/`explicit_package_bases` so `mypy app/` resolves
the PEP 420 layout at all, and ML-specific overrides for `app.services.ai.*`.)

## Storage / database — integration boundary

**The AI subsystem is storage-agnostic.** The AI services take and return plain dicts/JSON and do
**not** depend on any database:
- `extract_document(file) → fields`, `assess(dict) → dict`, and the `/extract` / `/assess`
  endpoints return JSON regardless of the store.

So the database choice is the **backend's** decision, not the AI's:
- **Nathan's dev/demo** runs on **Neon** (managed Postgres) — that's where this branch was built
  and tested end-to-end.
- **The integrated platform** uses **DynamoDB** — the backend calls the AI (HTTP or function),
  gets JSON back, and persists it in DynamoDB. **No AI code changes** are needed for this.
- The SQLAlchemy models + worker persistence here are a **reference implementation** of the full
  flow on Neon; the platform can either reuse them (porting persistence) or just call the AI
  services from its own DynamoDB worker. The integration contract is the JSON, not the schema.

**Production integration — the backend calls two stateless endpoints (no DB on the AI side):**
- `POST /api/v1/extract` — multipart file → extracted fields JSON (auto-populate the form).
- `POST /api/v1/assess` — JSON application fields (+ optional `reference`) → full assessment JSON
  (`pd, risk_grade, ai_score, dscr, apr, affordability, lgd, ead, ecl_12m, ifrs9_stage,
  shap_codes, recommendation, narrative, model_version`).

Both are pure JSON-in/JSON-out. Deploy the AI as a container (ECS) or Lambda; in production use
**AWS Textract** for OCR and **SQS** for the queue (already abstracted). The backend persists the
returned JSON to **DynamoDB**.

```bash
# example
curl -X POST $API/api/v1/assess -H "Authorization: Bearer $T" -H "Content-Type: application/json" \
  -d '{"sector":"Logistics","annual_revenue":2400000,"net_profit":240000,"loan_amount":120000,
       "loan_term_months":60,"loan_purpose":"Working Capital","has_collateral":true,"reference":"app-123"}'
# -> {"application_id":"app-123","pd":0.01,"risk_grade":"A","recommendation":"approve", ...}
```

## Outstanding
- 🔴 Reset the Neon DB password and update `.env` (a dev password was used during testing).
- Add an `ebitda` column to `applications` if you want extracted EBITDA persisted (currently it
  flows through the worker into the assessment but isn't stored as a column).

---

# API contract (for the frontend / Rajul)

Base: `/api/v1`. All non-auth endpoints require a JWT bearer token.

### 1. Submit for async processing
`POST /applications/{id}/submit` → **202-style** immediate response:
```json
{ "application_id": "app_123", "job_id": "job_999", "status": "SUBMITTED",
  "message": "Application submitted for processing" }
```

### 2. Poll status (UI polls every ~2s)
`GET /applications/{id}/status`:
```json
{ "application_id": "app_123", "job_id": "job_999", "status": "processing",
  "current_step": "AI_EXTRACTION", "progress": 50, "error": null }
```
`status` ∈ `queued | processing | completed | failed`.
`current_step` ∈ `OCR_STARTED → OCR_COMPLETED → AI_EXTRACTION → RISK_SCORING → DECISION_GENERATED → COMPLETED`.

### 3. AI assessment (also run inside the worker; exposed for manual/officer use)
`POST /applications/{id}/assess` → `AssessmentOut`:
```json
{ "application_id": "app_123", "pd": 0.03, "risk_grade": "B", "ai_score": 97.0,
  "dscr": 1.42, "apr": 7.8, "affordability": 1.9, "lgd": 0.25, "ead": 150000,
  "ecl_12m": 1125.0, "ifrs9_stage": 1,
  "shap_codes": [{ "feature": "Debt service coverage (DSCR)", "direction": "reduces_risk", "weight": 1.2 }],
  "recommendation": "approve", "model_version": "finpal-pd-v0.1.0",
  "narrative": "Recommended for approval. Risk grade B ..." }
```

### Application status lifecycle
`draft → submitted → idp_processing → ai_assessment → hitl_queue → approved | declined | referred`.
After processing, the application rests at **`hitl_queue`** for the credit officer (GDPR Art.22).
The officer's decision goes through the existing `POST /applications/{id}/decisions`.

### Error contract (all endpoints)
```json
{ "errorCode": "APPLICATION_NOT_FOUND", "message": "Application not found",
  "traceId": "trace_abc", "timestamp": "2026-06-08T00:00:00Z" }
```
