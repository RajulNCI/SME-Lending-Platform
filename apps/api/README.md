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
| POST | /api/v1/applications | Any | Submit application |
| GET | /api/v1/applications/{id} | Any | Application detail |
| PATCH | /api/v1/applications/{id}/ai | Credit Officer+ | Nathan AI agent posts here |
| POST | /api/v1/applications/{id}/decisions | Credit Officer | HITL decision |
| GET | /api/v1/applications/{id}/evidence | Compliance Officer | Evidence bundle |
| GET | /api/v1/health | Public | Health check |

## Nathan's AI agent integration

The AI agent posts assessment results to:
```
PATCH /api/v1/applications/{id}/ai
Authorization: Bearer {token}

{
  "ai_score": 72.4,
  "risk_grade": "B1",
  "pd": 3.4,
  "dscr": 1.42,
  "apr": 8.5,
  "affordability": 82,
  "ecl_12m": 6020,
  "ifrs9_stage": 1,
  "model_version": "finpal-pd-v2.4.1",
  "shap_codes": [
    {"factor": "DSCR (1.42x)", "direction": "positive", "weight": 32, "note": "Above 1.20x"},
    ...
  ]
}
```

## Running tests

```bash
pytest tests/ -v
```