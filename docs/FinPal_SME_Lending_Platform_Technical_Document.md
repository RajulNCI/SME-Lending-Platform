# FinPal SME Lending Platform
## Technical Architecture & Engineering Document

**Version:** 1.0  
**Date:** June 2026  
**Classification:** Internal / Portfolio  
**Author:** Engineering Team  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview & Business Context](#2-project-overview--business-context)
3. [High-Level System Architecture](#3-high-level-system-architecture)
4. [AWS Infrastructure Deep Dive](#4-aws-infrastructure-deep-dive)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend API Architecture](#6-backend-api-architecture)
7. [Database Design](#7-database-design)
8. [End-to-End Application Processing Flow](#8-end-to-end-application-processing-flow)
9. [AI / ML Pipeline](#9-ai--ml-pipeline)
10. [Security & Compliance](#10-security--compliance)
11. [CI/CD Pipeline](#11-cicd-pipeline)
12. [Deployment & Hosting](#12-deployment--hosting)
13. [Role-Based Access Control](#13-role-based-access-control)
14. [Cost Analysis](#14-cost-analysis)
15. [API Reference](#15-api-reference)
16. [Future Roadmap](#16-future-roadmap)

---

## 1. Executive Summary

FinPal is a cloud-native, AI-augmented SME (Small and Medium Enterprise) lending platform built for regulated financial institutions operating under EU and Irish regulatory frameworks. The platform automates the end-to-end loan origination process — from borrower application submission through intelligent document processing, credit risk modelling, and human-in-the-loop officer review — reducing manual assessment time from days to minutes while maintaining full regulatory auditability.

### Key Achievements

| Metric | Value |
|--------|-------|
| Application processing time | < 5 minutes (automated AI pipeline) |
| Manual effort reduction | ~80% vs traditional paper-based process |
| Cloud provider | AWS (us-east-1) |
| Architecture pattern | Serverless microservices |
| Frontend deployment | Vercel (global CDN) |
| Regulatory frameworks | EU AI Act Art. 9-15, GDPR Art. 22, EBA LOM, Ireland IAF |
| Test coverage | Unit + Integration (CI-enforced) |
| Security scanning | SAST (Ruff/Bandit), DAST (OWASP ZAP), Secret scanning (Gitleaks) |

### Technology at a Glance

- **Frontend:** React 18 + TypeScript + Vite, deployed on Vercel
- **Backend API:** FastAPI (Python 3.12) on AWS Lambda via Mangum
- **AI Worker:** AWS Lambda (SQS-triggered) running IDP → Rules Engine → PD Model
- **Database:** AWS RDS PostgreSQL 16
- **Auth:** AWS Cognito User Pool
- **Messaging:** AWS SQS (decoupled async processing)
- **Infrastructure as Code:** Terraform (modularised)
- **CI/CD:** GitHub Actions (5-stage pipeline)

---

## 2. Project Overview & Business Context

### 2.1 Problem Statement

Traditional SME loan processing in Irish and EU banks involves:
- 5–15 business days for manual document review
- Inconsistent credit decisions prone to human bias
- No real-time status visibility for borrowers
- Difficulty demonstrating regulatory compliance (EU AI Act, GDPR)
- High operational cost per application (€200–€800 per manual assessment)

### 2.2 Solution

FinPal replaces the manual pipeline with an intelligent, explainable AI system that:

1. **Ingests** structured and unstructured SME documents (financial statements, bank statements, CRN filings)
2. **Extracts** key financial metrics via Intelligent Document Processing (IDP)
3. **Applies** a rules engine for hard credit gates (DSCR, LTV, affordability)
4. **Scores** applications using a calibrated Probability of Default (PD) model
5. **Routes** borderline applications to human credit officers via the HITL queue
6. **Generates** GDPR-compliant explanations and IFRS 9 staging for every decision

### 2.3 Target Users

| Role | Description |
|------|-------------|
| `borrower_sme` | Business owner submitting loan applications |
| `credit_officer` | Reviews AI-processed applications, makes final decisions |
| `risk_manager` | Portfolio risk oversight and model governance |
| `compliance_officer` | EU AI Act and GDPR audit trail review |
| `mrm_analyst` | Model Risk Management — monitors model drift and fairness |
| `ops_manager` | Operational dashboard and SLA monitoring |
| `it_admin` | Platform administration |

---

## 3. High-Level System Architecture

### 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET / USERS                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Vercel CDN (FE)   │
                    │  React + TypeScript │
                    │  finpals.vercel.app │
                    └──────────┬──────────┘
                               │ /api/* proxy rewrite
                               │
                    ┌──────────▼──────────┐
                    │  AWS API Gateway    │
                    │  HTTP API v2        │
                    │  Stage: /prod       │
                    └──────────┬──────────┘
                               │ Lambda proxy integration
                               │
                    ┌──────────▼──────────┐
                    │  AWS Lambda         │
                    │  finpal-api         │
                    │  FastAPI + Mangum   │
                    └────┬──────────┬─────┘
                         │          │
              ┌──────────▼──┐  ┌───▼──────────────┐
              │  RDS         │  │  AWS SQS Queue   │
              │  PostgreSQL  │  │  finpal-jobs     │
              │  (async)     │  └───┬──────────────┘
              └─────────────┘      │ trigger
                                   │
                         ┌─────────▼────────────┐
                         │  AWS Lambda           │
                         │  finpal-ai-worker     │
                         │  IDP → Rules → PD     │
                         └─────────┬─────────────┘
                                   │ writes results
                                   │
                         ┌─────────▼────────────┐
                         │  RDS PostgreSQL       │
                         │  (applications,       │
                         │   processing_jobs,    │
                         │   decisions tables)   │
                         └──────────────────────┘

Supporting Services:
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ AWS Cognito  │  │   AWS S3     │  │   AWS WAF    │
  │ User Pool    │  │  Doc Store   │  │  (optional)  │
  └──────────────┘  └──────────────┘  └──────────────┘
```

### 3.2 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Serverless (Lambda) over ECS/EC2 | Zero idle cost; auto-scales; no server management |
| SQS decoupling | AI processing is async (30s–3min); prevents API timeout; retryable |
| Mangum adapter | Runs standard FastAPI on Lambda without code changes |
| Vercel proxy rewrite | Eliminates CORS complexity; single-origin for browser security |
| pg8000.native driver | Pure Python — no C extensions needed in Lambda environment |
| RDS over DynamoDB | Complex relational queries (joins, IFRS 9 staging); ACID compliance |

---

## 4. AWS Infrastructure Deep Dive

### 4.1 Services Overview

| Service | Purpose | Config |
|---------|---------|--------|
| **API Gateway** | HTTPS entry point, routing | HTTP API v2, stage name `prod`, Lambda proxy |
| **Lambda (API)** | FastAPI application runtime | Runtime: Python 3.12, memory: 512MB, timeout: 30s |
| **Lambda (Worker)** | AI pipeline execution | Runtime: Python 3.12, memory: 1024MB, timeout: 300s |
| **SQS** | Async job queue | Standard queue, visibility timeout: 360s |
| **RDS PostgreSQL** | Primary data store | PostgreSQL 16, db.t3.micro (dev), Multi-AZ capable |
| **Cognito** | Authentication & JWT issuance | User Pool with custom app client |
| **S3** | Document storage | Versioned bucket, SSE-S3 encryption |
| **VPC** | Network isolation | Private subnets for RDS, Lambda in VPC |
| **IAM** | Least-privilege access | Per-service roles, no wildcard permissions |
| **WAF** | Web Application Firewall | Optional — rate limiting and OWASP rule groups |

### 4.2 Terraform Module Structure

```
infrastructure/
└── terraform/
    ├── environments/
    │   ├── dev/
    │   │   ├── main.tf
    │   │   ├── variables.tf
    │   │   └── outputs.tf
    │   └── prod/
    ├── modules/
    │   ├── cognito/       — User Pool, App Client
    │   ├── lambda/        — API + Worker functions
    │   ├── rds/           — PostgreSQL instance + subnet group
    │   ├── s3/            — Document bucket
    │   ├── sqs/           — Processing queue
    │   ├── vpc/           — VPC, subnets, security groups
    │   ├── iam/           — Roles and policies
    │   ├── waf/           — Web ACL
    │   └── ecs/           — ECS (reserved for future containerised services)
    └── backend.tf         — S3 remote state
```

### 4.3 Lambda Configuration Detail

**finpal-api (REST API Handler)**
```hcl
runtime     = "python3.12"
handler     = "app.main.handler"       # Mangum ASGI adapter
memory_size = 512
timeout     = 30
environment = {
  DATABASE_URL  = "postgresql+pg8000://..."   # RDS connection
  COGNITO_POOL  = var.cognito_pool_id
  ENVIRONMENT   = "production"
}
```

**finpal-ai-worker (Async AI Processor)**
```hcl
runtime     = "python3.12"
handler     = "worker.handler"
memory_size = 1024                       # ML model loading requires more memory
timeout     = 300
event_source = aws_sqs_queue.finpal_jobs
batch_size   = 1                         # Process one application at a time
```

### 4.4 API Gateway Configuration

- **Type:** HTTP API (v2) — lower latency and cost vs REST API
- **Stage:** `/prod` (hardcoded; Lambda uses `api_gateway_base_path="/prod"`)
- **CORS:** Not needed — Vercel proxy handles all cross-origin requests
- **Auth:** JWT authoriser backed by Cognito User Pool
- **Base URL:** `https://tvuegpy2w7.execute-api.us-east-1.amazonaws.com/prod`

### 4.5 Networking

```
VPC (10.0.0.0/16)
├── Public Subnets  (10.0.1.0/24, 10.0.2.0/24)  — NAT Gateway, ALB
├── Private Subnets (10.0.3.0/24, 10.0.4.0/24)  — Lambda, RDS
└── Security Groups
    ├── lambda-sg   — egress to RDS port 5432, egress HTTPS
    └── rds-sg      — ingress from lambda-sg only on 5432
```

---

## 5. Frontend Architecture

### 5.1 Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI component framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool (HMR, tree-shaking) |
| React Router | v6 | Client-side routing |
| Styled Components | 6 | CSS-in-JS theming |
| Zustand | 4 | Lightweight global state |
| amazon-cognito-identity-js | 6 | AWS Cognito authentication |
| Vitest | 1 | Unit testing |
| pnpm + Turborepo | — | Monorepo workspace management |

### 5.2 Project Structure

```
apps/web/
├── src/
│   ├── features/
│   │   ├── queue/
│   │   │   └── ApplicationDetail.tsx   — 8-tab Credit Officer dashboard
│   │   └── borrower/
│   ├── pages/
│   │   ├── hitl/
│   │   │   └── QueuePage.tsx           — CO application queue table
│   │   ├── borrower/
│   │   │   └── BorrowerDashboard.tsx   — Borrower application tracker
│   │   └── auth/
│   │       └── LoginPage.tsx
│   ├── services/
│   │   ├── AIApi.ts                    — All API calls (single entry point)
│   │   ├── apiClient.ts               — HTTP client (fetch wrapper)
│   │   └── cognitoAuth.ts             — Cognito login/logout/session
│   ├── store/
│   │   └── useAuthStore.ts            — Zustand auth state
│   └── components/
│       └── shared/                    — Reusable UI components
├── vercel.json                        — API proxy + SPA routing
└── vite.config.ts
```

### 5.3 Authentication Flow

```
User submits login form
        │
        ▼
cognitoAuth.ts:signIn()
        │
        ├── Production: amazon-cognito-identity-js SDK
        │   → AWS Cognito User Pool
        │   → Returns JWT (id_token, access_token, refresh_token)
        │
        └── Demo fallback (no env vars): hardcoded credentials
            borrower@company.ie / demo  → borrower_sme role
            officer@finpal.ie / demo    → credit_officer role
        │
        ▼
Zustand store: setUser({ email, role, token })
        │
        ▼
React Router: redirect to role-based dashboard
```

**Lazy Cognito initialisation** — `CognitoUserPool` is constructed on first use (not at module load), preventing white-screen crashes when `VITE_COGNITO_*` env vars are absent (Vercel demo deployment).

### 5.4 API Proxy (Vercel → AWS API Gateway)

`vercel.json` rewrites all `/api/*` traffic to the API Gateway endpoint server-side, so the browser always makes same-origin requests:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://tvuegpy2w7.execute-api.us-east-1.amazonaws.com/prod/api/$1"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This avoids CORS preflight entirely and keeps the API Gateway URL out of client-side JavaScript.

### 5.5 Credit Officer Dashboard (ApplicationDetail.tsx)

The CO dashboard is a tabbed interface with 8 panels:

| Tab | Content |
|-----|---------|
| **Overview** | Company details, loan request, IDP-extracted financials |
| **Risk & XAI** | PD score, risk grade, SHAP waterfall chart, top drivers |
| **Open Banking** | Transaction data, cash flow analysis, bank feed |
| **IFRS 9** | ECL staging (Stage 1/2/3), 12-month and lifetime ECL |
| **Trustworthiness** | AI fairness metrics, disparate impact, bias checks |
| **Audit Log** | Timestamped event trail for regulatory audit |
| **Compliance** | EU AI Act checklist, GDPR Art. 22 disclosure status |
| **Evidence Pack** | Uploaded documents, IDP extraction confidence scores |

At the bottom: decision gate — Approve / Refer / Decline with mandatory rationale text.

---

## 6. Backend API Architecture

### 6.1 Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.111 | Async REST API framework |
| SQLAlchemy | 2.x | Async ORM (asyncpg dialect) |
| Mangum | 0.17 | AWS Lambda ASGI adapter |
| pg8000.native | 1.x | Pure-Python PostgreSQL driver |
| Pydantic v2 | 2.x | Request/response validation |
| Alembic | 1.x | Database migrations |
| pytest | 8.x | Test framework |
| Ruff | 0.4 | Linting + formatting |

### 6.2 Application Structure

```
apps/api/
├── app/
│   ├── main.py                 — FastAPI app + Mangum handler
│   ├── api/
│   │   └── v1/
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── applications.py  — Submit, list, detail, status
│   │           ├── decisions.py     — CO decision submission
│   │           ├── auth.py          — Login (demo + Cognito)
│   │           └── health.py        — Health check
│   ├── core/
│   │   ├── config.py           — Settings (env vars via pydantic-settings)
│   │   ├── security.py         — JWT creation/decode, password hashing
│   │   └── database.py         — Async SQLAlchemy engine + session
│   └── models/
│       ├── application.py      — Application ORM model
│       ├── user.py             — User ORM model
│       └── decision.py         — Decision ORM model
├── tests/
│   ├── unit/                   — Pure unit tests (no DB)
│   └── integration/            — Tests against real PostgreSQL
├── pyproject.toml              — Build + tool config
└── alembic/                    — DB migration scripts
```

### 6.3 Key API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/auth/login` | None | Login (demo or Cognito) |
| `POST` | `/api/v1/applications/submit` | JWT | Submit new loan application |
| `GET` | `/api/v1/applications` | JWT | List applications (role-filtered) |
| `GET` | `/api/v1/applications/{id}` | JWT | Full application detail |
| `GET` | `/api/v1/applications/{id}/status` | JWT | Processing job status (polling) |
| `POST` | `/api/v1/applications/{id}/decisions` | JWT (CO) | Submit credit decision |
| `GET` | `/api/v1/health` | None | Health check |

### 6.4 Role-Filtered Application Listing

The `GET /api/v1/applications` endpoint applies automatic data scoping based on the caller's role:

```python
# Borrowers only see their own applications
if token_data.get("role") == "borrower_sme":
    username = token_data.get("username")
    user_result = await db.execute(
        select(User.id).where(User.username == username)
    )
    user_id = user_result.scalar_one_or_none()
    query = query.where(Application.borrower_id == user_id)
# Credit officers see all applications in the queue
```

### 6.5 Mangum Integration

Mangum wraps the FastAPI app to run as an AWS Lambda handler:

```python
# app/main.py
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI(title="FinPal API")

# Mount all routers...
app.include_router(applications_router, prefix="/api/v1")

# Lambda handler — base_path strips the /prod stage prefix added by API Gateway
handler = Mangum(app, api_gateway_base_path="/prod")
```

---

## 7. Database Design

### 7.1 Schema Overview

```sql
-- Core tables
users              — Platform users (borrowers, officers, etc.)
applications       — Loan applications with extracted financials
processing_jobs    — AI pipeline execution state per application
decisions          — Credit officer decisions with rationale
audit_log          — Immutable event trail

-- Supporting tables
documents          — Uploaded file references (S3 keys)
```

### 7.2 Key Table Schemas

**applications**
```sql
CREATE TABLE applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id     UUID REFERENCES users(id),
    company_name    VARCHAR(255) NOT NULL,
    sector          VARCHAR(100),
    loan_amount     NUMERIC(15,2),
    loan_purpose    VARCHAR(100),
    status          VARCHAR(50) DEFAULT 'submitted',
    -- AI-populated fields
    risk_grade      VARCHAR(5),
    pd              NUMERIC(8,6),      -- Probability of Default
    dscr            NUMERIC(8,4),      -- Debt Service Coverage Ratio
    apr             NUMERIC(8,4),
    lgd             NUMERIC(8,4),      -- Loss Given Default
    ead             NUMERIC(15,2),     -- Exposure at Default
    ecl_12m         NUMERIC(15,2),     -- 12-month ECL (IFRS 9)
    ecl_lifetime    NUMERIC(15,2),
    ifrs9_stage     SMALLINT,          -- 1, 2, or 3
    ai_score        NUMERIC(8,4),
    narrative       TEXT,
    shap_codes      JSONB,             -- SHAP explanation values
    annual_revenue  NUMERIC(15,2),
    free_cash_flow  NUMERIC(15,2),
    discrepancy     BOOLEAN,           -- IDP vs declared mismatch
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE processing_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID REFERENCES applications(id),
    status          VARCHAR(50),       -- pending, running, completed, failed
    current_step    VARCHAR(50),       -- APPLICATION_SUBMITTED, IDP_OCR, etc.
    error_message   TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ
);

CREATE TABLE decisions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id  UUID REFERENCES applications(id),
    officer_id      UUID REFERENCES users(id),
    outcome         VARCHAR(20),       -- approved, declined, referred
    rationale       TEXT NOT NULL,
    decided_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. End-to-End Application Processing Flow

### 8.1 Flow Diagram

```
BORROWER                    FINPAL API                    AI WORKER LAMBDA
   │                            │                               │
   │  POST /applications/submit │                               │
   │ ─────────────────────────► │                               │
   │                            │ 1. Validate + store in RDS    │
   │                            │ 2. Upload docs to S3          │
   │                            │ 3. Push job_id to SQS         │
   │                            │──────────────────────────────►│
   │  202 Accepted + app_id     │                               │
   │ ◄───────────────────────── │                               │
   │                            │                               │ 4. IDP / OCR
   │  Poll /applications/{id}/  │                               │    Extract financials
   │  status every 3s           │                               │
   │ ─────────────────────────► │                               │
   │  { step: 2, status: IDP }  │                               │
   │ ◄───────────────────────── │                               │
   │                            │                               │ 5. Rules Engine
   │  Poll...                   │                               │    Hard gates check
   │  { step: 3, RULES_ENGINE } │                               │
   │                            │                               │ 6. PD AI Model
   │  Poll...                   │                               │    Score + explain
   │  { step: 4, PD_AI_MODEL }  │                               │
   │                            │                               │
   │                            │◄──────────────────────────────│
   │                            │  7. Write results to RDS      │
   │                            │  8. Set status = hitl_queue   │
   │                            │     or approved/declined      │
   │                            │                               │
   │  { step: 5, COMPLETED }    │                               │
   │ ◄───────────────────────── │                               │
   │                            │
   │
CREDIT OFFICER
   │
   │  GET /applications          — Sees all queued apps
   │  GET /applications/{id}     — Full AI assessment
   │  POST /applications/{id}/decisions
   │    { outcome: "approved", rationale: "Strong DSCR..." }
   │
   └── Application status → approved / declined / referred
```

### 8.2 Processing Steps

| Step | Name | Description |
|------|------|-------------|
| 1 | `APPLICATION_SUBMITTED` | Application persisted in RDS, job queued in SQS |
| 2 | `IDP_OCR` | Intelligent Document Processing — extract revenue, EBITDA, cashflow from PDFs/XLS |
| 3 | `RULES_ENGINE` | Hard credit gates: DSCR ≥ 1.25, LTV ≤ 80%, affordability check |
| 4 | `PD_AI_MODEL` | Probability of Default model — risk grade A-E, SHAP explanations |
| 5 | `DECISION_SAVED` | AI results written to RDS, IFRS 9 stage assigned |
| 6 | `COMPLETED` | Application in HITL queue for officer or auto-approved/declined |

### 8.3 Status State Machine

```
submitted
    │
    ▼
processing ──────────────────────► failed
    │
    ├── (DSCR < 1.25 or LTV > 80%)
    │       ▼
    │   auto_declined
    │
    ├── (PD < threshold, strong signal)
    │       ▼
    │   auto_approved
    │
    └── (borderline / discrepancy detected)
            ▼
        hitl_queue ──── CO reviews ────► approved
                                    ├──► declined
                                    └──► referred
```

---

## 9. AI / ML Pipeline

> **Note:** This section is reserved for the AI/ML engineering team to complete. The FinPal platform integrates a sophisticated AI pipeline developed by a specialist colleague. The architecture hooks and API contracts are documented here; the algorithmic detail below is a placeholder.

---

### 9.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   AI Worker Lambda                           │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  IDP / OCR  │───►│ Rules Engine │───►│   PD Model    │  │
│  │             │    │              │    │               │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Intelligent Document Processing (IDP)

> _[AI TEAM: Please document the IDP approach here — OCR engine used, document types supported, field extraction methodology, confidence scoring, discrepancy detection logic]_

**Placeholder — key integration points:**
- Input: S3 document keys (PDF, DOCX, XLSX)
- Output: Structured financial data (revenue, EBITDA, cashflow, CRN)
- Discrepancy detection: Flags when IDP-extracted figures differ materially from borrower-declared figures
- Confidence scores: Per-field extraction confidence (shown in Evidence Pack tab)

### 9.3 Rules Engine

> _[AI TEAM: Please document the rules engine — which rules are applied, thresholds, override logic, output schema]_

**Placeholder — known hard gates:**
- Debt Service Coverage Ratio (DSCR) ≥ 1.25
- Loan-to-Value (LTV) ≤ 80%
- Minimum trading history requirements
- Sector exclusion list

### 9.4 Probability of Default (PD) Model

> _[AI TEAM: Please document the PD model — algorithm, training data, feature set, calibration methodology, validation results, model card]_

**Placeholder — integration contract:**

```python
# Input schema (from Rules Engine output)
{
  "annual_revenue": float,
  "free_cash_flow": float,
  "dscr": float,
  "sector": str,
  "loan_amount": float,
  ...
}

# Output schema (persisted to RDS)
{
  "pd": float,            # 0.0–1.0 probability of default
  "risk_grade": str,      # "A" through "E"
  "ai_score": float,      # 0–100 composite score
  "apr": float,           # Risk-adjusted interest rate
  "lgd": float,           # Loss Given Default
  "ead": float,           # Exposure at Default
  "ecl_12m": float,       # 12-month Expected Credit Loss (IFRS 9)
  "ecl_lifetime": float,  # Lifetime ECL
  "ifrs9_stage": int,     # 1, 2, or 3
  "shap_codes": [...],    # SHAP feature importance values
  "narrative": str        # Plain-English explanation for GDPR Art. 22
}
```

### 9.5 Explainability (XAI)

> _[AI TEAM: Please document the SHAP implementation, feature importance methodology, and how narrative explanations are generated]_

**Placeholder — UI integration:**
The Risk & XAI tab in the Credit Officer dashboard renders SHAP waterfall charts. Each `shap_codes` entry has:
- `feature`: Feature name (e.g., "DSCR", "Sector Risk")
- `value`: SHAP contribution value
- `direction`: `"positive"` (increases PD) or `"negative"` (decreases PD)

### 9.6 Regulatory AI Compliance

> _[AI TEAM: Please document compliance with EU AI Act Art. 9-15, GDPR Art. 22 explanations, EBA LOM alignment, and model governance procedures]_

---

## 10. Security & Compliance

### 10.1 Authentication & Authorisation

- **Production:** AWS Cognito User Pool — JWT tokens with role claim
- **Demo mode:** Hardcoded credentials for evaluation purposes
- **Token validation:** Every protected endpoint decodes and validates the JWT; role is extracted for RBAC
- **Session management:** Tokens stored in memory (Zustand); refresh handled by Cognito SDK

### 10.2 API Security

| Layer | Control |
|-------|---------|
| Transport | HTTPS/TLS 1.2+ enforced (API Gateway + Vercel) |
| Authentication | JWT Bearer token on all `/api/v1/*` routes |
| Authorisation | Role-based data filtering at query level |
| Input validation | Pydantic v2 schemas validate all request bodies |
| SQL injection | SQLAlchemy ORM with parameterised queries; no raw SQL |
| CORS | Eliminated via Vercel proxy (same-origin) |
| WAF | AWS WAF with OWASP Core Rule Set (production) |

### 10.3 Data Security

- **Documents at rest:** S3 with SSE-S3 encryption
- **Database at rest:** RDS encrypted storage volumes
- **Secrets:** AWS Secrets Manager / environment variables (never in code)
- **Secret scanning:** Gitleaks runs on every git push via GitHub Actions

### 10.4 Regulatory Compliance

| Framework | Requirement | Implementation |
|-----------|-------------|----------------|
| GDPR Art. 22 | Explain automated decisions | AI narrative + SHAP explanations per decision |
| EU AI Act Art. 9 | Risk management system | HITL queue for borderline cases |
| EU AI Act Art. 13 | Transparency | Model card, explainability dashboard |
| EU AI Act Art. 14 | Human oversight | Credit officer mandatory review gate |
| EU AI Act Art. 15 | Accuracy & robustness | MRM analyst dashboard, drift monitoring |
| EBA LOM | Credit decisioning guidelines | Rules engine implements EBA credit gates |
| Ireland IAF | AI governance framework | Audit log with immutable event trail |

### 10.5 Security Testing

| Tool | Stage | Scope |
|------|-------|-------|
| Ruff (S-rules) | CI — every commit | Python static security analysis |
| Bandit | CI — every commit | Python security anti-patterns |
| pip-audit | CI — every commit | Python dependency CVEs |
| pnpm audit | CI — every commit | Node.js dependency CVEs |
| Gitleaks | CI — every commit | Secret/credential detection in git history |
| OWASP ZAP | CI — post-build | Dynamic application security testing |

---

## 11. CI/CD Pipeline

### 11.1 Pipeline Overview

```
Git Push / PR
     │
     ▼
┌────────────┐
│  Changes   │ ← dorny/paths-filter detects what changed
│  Detection │
└──────┬─────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌─────────────┐                    ┌──────────────────┐
│  FE Job     │                    │  BE Job           │
│ ─────────── │                    │ ────────────────  │
│ typecheck   │                    │ ruff lint         │
│ lint        │                    │ ruff format check │
│ unit tests  │                    │ mypy              │
│ build       │                    │ bandit            │
│             │                    │ pip-audit         │
└──────┬──────┘                    │ unit tests        │
       │                           │ integration tests │
       │                           └────────┬─────────┘
       │                                    │
       └──────────────┬─────────────────────┘
                      │
              ┌───────▼──────┐    ┌──────────────────┐
              │  DAST (ZAP)  │    │ Secrets Scanning  │
              │  vs Vercel   │    │ (Gitleaks)        │
              └───────┬──────┘    └──────────────────┘
                      │
              ┌───────▼──────┐
              │  Terraform   │ ← only if infra/ changed
              │  Validate    │
              └───────┬──────┘
                      │
              ┌───────▼──────┐
              │  CI Gate     │ ← required GitHub status check
              └──────────────┘
                      │
                      ▼
             ✅ Merge allowed
                      │
                      ▼
             Vercel auto-deploys
             (feat/AI_Integration branch)
```

### 11.2 GitHub Actions Jobs

| Job | Trigger | Key Steps |
|-----|---------|-----------|
| `changes` | Every push/PR | Path filter — outputs `web`, `api`, `infra` booleans |
| `web` | `web == true` | pnpm install → typecheck → lint → test → build → upload artifact |
| `api` | `api == true` | pip install → ruff → mypy → bandit → pip-audit → pytest unit + integration |
| `secrets-scan` | Every push | Gitleaks full-history scan |
| `dast` | After web+api | OWASP ZAP baseline scan vs production Vercel URL |
| `infra-validate` | `infra == true` | terraform fmt check → terraform validate |
| `ci-gate` | Always | Fails if any upstream job failed |

### 11.3 Branch Strategy

```
main              ← Production-ready; protected; requires CI gate + PR review
  │
  └── feat/AI_Integration  ← Current active development branch
        │                     Deployed to Vercel (set as production branch)
        └── feature/*      ← Feature branches; PR into feat/AI_Integration
```

---

## 12. Deployment & Hosting

### 12.1 Frontend — Vercel

- **Platform:** Vercel (serverless edge deployment)
- **Production branch:** `feat/AI_Integration`
- **Build command:** `pnpm turbo run build --filter=@sme-lending-platform/web`
- **Output directory:** `apps/web/dist`
- **Environment variables:** `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, `VITE_COGNITO_REGION` (optional — demo mode works without them)
- **Global CDN:** Vercel edge network — < 50ms TTFB worldwide
- **Auto-deploy:** Every push to production branch triggers new Vercel deployment

### 12.2 Backend — AWS Lambda

- **Deployment method:** AWS CLI (`aws lambda update-function-code`) or Terraform
- **Package:** Python zip with all dependencies bundled (no layers for simplicity)
- **Lambda layers considered but not used** — direct bundling is simpler for this scale
- **Cold start mitigation:** Provisioned concurrency (optional, not currently enabled)
- **Estimated cold start:** 1.5–3s (Python + FastAPI init)

### 12.3 Database — RDS

- **Engine:** PostgreSQL 16
- **Instance class:** `db.t3.micro` (dev), `db.t3.small` or `db.t3.medium` (prod)
- **Storage:** 20 GB gp3 SSD, auto-scaling enabled
- **Backups:** Automated daily snapshots, 7-day retention
- **Access:** Private subnet only — no public endpoint

### 12.4 Environment Comparison

| Aspect | Development | Production |
|--------|-------------|------------|
| Frontend | `localhost:5175` (Vite dev server) | Vercel CDN |
| API | `localhost:8000` (uvicorn) | AWS Lambda + API Gateway |
| Database | Local PostgreSQL or Docker | AWS RDS PostgreSQL |
| Auth | Demo mode (hardcoded) | AWS Cognito User Pool |
| Documents | Local filesystem | AWS S3 |
| Secrets | `.env.local` | AWS Secrets Manager / Vercel env vars |

---

## 13. Role-Based Access Control

### 13.1 Role Matrix

| Feature | borrower_sme | credit_officer | risk_manager | compliance_officer | mrm_analyst | ops_manager | it_admin |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Submit application | ✅ | — | — | — | — | — | — |
| View own applications | ✅ | — | — | — | — | — | — |
| View all applications | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View AI assessment | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Submit decision | — | ✅ | — | — | — | — | — |
| View audit log | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Model monitoring | — | — | ✅ | — | ✅ | — | — |
| User management | — | — | — | — | — | — | ✅ |

### 13.2 JWT Claim Structure

```json
{
  "sub": "user-uuid",
  "email": "officer@finpal.ie",
  "role": "credit_officer",
  "username": "officer@finpal.ie",
  "iat": 1719000000,
  "exp": 1719086400
}
```

---

## 14. Cost Analysis

### 14.1 AWS Monthly Cost Estimate (Development Environment)

| Service | Usage | Estimated Cost/Month |
|---------|-------|---------------------|
| **Lambda (API)** | 100K requests × 512MB × 500ms avg | ~$0.50 |
| **Lambda (Worker)** | 1K AI jobs × 1024MB × 60s avg | ~$1.00 |
| **API Gateway** | 100K HTTP requests | ~$0.10 |
| **RDS db.t3.micro** | 720 hours, 20GB storage | ~$15–20 |
| **SQS** | 1M messages/month | ~$0.40 |
| **S3** | 10GB storage + PUT/GET requests | ~$0.50 |
| **Cognito** | < 50K MAU (free tier) | $0.00 |
| **VPC / NAT Gateway** | Data processing | ~$5 |
| **CloudWatch Logs** | Log retention | ~$1 |
| **Total Dev Estimate** | | **~$25–30/month** |

### 14.2 Production Cost Projection (Scale)

| Service | Production Config | Estimated Cost/Month |
|---------|-----------------|---------------------|
| **Lambda (API)** | 1M requests, reserved concurrency | ~$5 |
| **Lambda (Worker)** | 10K AI jobs | ~$10 |
| **API Gateway** | 1M requests | ~$1 |
| **RDS db.t3.small** | Multi-AZ, 100GB | ~$60–80 |
| **SQS** | 10M messages | ~$4 |
| **S3** | 100GB + high throughput | ~$5 |
| **Cognito** | 10K MAU | ~$5.50 |
| **WAF** | 1M web ACL evaluations | ~$10 |
| **CloudWatch** | Enhanced monitoring | ~$5 |
| **Vercel** | Pro plan (custom domain, analytics) | ~$20 |
| **Total Production** | | **~$120–150/month** |

### 14.3 Cost Optimisation Strategies

1. **Lambda cold starts:** Use provisioned concurrency only during business hours (9–17 Mon–Fri)
2. **RDS:** Use RDS Proxy to pool connections from Lambda, avoiding per-invocation connection overhead
3. **S3:** Intelligent Tiering for documents older than 90 days
4. **CloudWatch:** Set log retention to 30 days (not indefinite)
5. **SQS:** Standard queue (not FIFO) — AI processing order is not critical and standard is 10x cheaper
6. **Savings Plans:** After 3 months of stable usage, commit to 1-year Compute Savings Plan (~30% saving)

---

## 15. API Reference

### 15.1 Authentication

**POST /api/v1/auth/login**
```json
// Request
{ "email": "officer@finpal.ie", "password": "demo" }

// Response
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "role": "credit_officer",
  "email": "officer@finpal.ie"
}
```

### 15.2 Submit Application

**POST /api/v1/applications/submit** (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `companyName` | string | ✅ | Registered company name |
| `sector` | string | ✅ | Industry sector |
| `loanAmount` | number | ✅ | Requested loan amount (EUR) |
| `loanType` | string | ✅ | WORKING_CAPITAL, TERM_LOAN, etc. |
| `files` | File[] | — | Supporting documents (PDF, DOCX, XLSX) |

```json
// Response 202
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "submitted",
  "message": "Application received and queued for processing"
}
```

### 15.3 Get Application Status (Polling)

**GET /api/v1/applications/{id}/status**
```json
{
  "id": "550e8400...",
  "status": "running",
  "current_step": "PD_AI_MODEL",
  "started_at": "2026-06-22T10:30:00Z"
}
```

### 15.4 Get Full Application Detail

**GET /api/v1/applications/{id}**
```json
{
  "id": "550e8400...",
  "company_name": "Acme Manufacturing Ltd",
  "sector": "Manufacturing",
  "loan_amount": 250000,
  "loan_purpose": "WORKING_CAPITAL",
  "status": "hitl_queue",
  "risk_grade": "A",
  "pd": 0.0048,
  "ai_score": 99.52,
  "dscr": 3.582,
  "apr": 5.5,
  "lgd": 0.35,
  "ead": 250000,
  "ecl_12m": 420.00,
  "ecl_lifetime": 1890.00,
  "ifrs9_stage": 1,
  "shap_codes": [
    { "feature": "DSCR", "value": 0.42, "direction": "negative" },
    { "feature": "Sector Risk", "value": 0.08, "direction": "positive" }
  ],
  "narrative": "Strong DSCR of 3.58 indicates robust debt servicing capacity...",
  "annual_revenue": 1200000,
  "free_cash_flow": 380000,
  "discrepancy": false
}
```

### 15.5 Submit Decision

**POST /api/v1/applications/{id}/decisions**
```json
// Request
{
  "outcome": "approved",          // approved | declined | referred
  "rationale": "Strong financials, low PD, sector is stable. Approved at requested terms."
}

// Response
{
  "id": "decision-uuid",
  "application_id": "550e8400...",
  "outcome": "approved",
  "decided_at": "2026-06-22T11:45:00Z"
}
```

---

## 16. Future Roadmap

### 16.1 Short Term (3–6 months)

| Feature | Priority | Effort |
|---------|----------|--------|
| Open Banking API integration (Plaid/TrueLayer) | High | 2 weeks |
| Real-time notifications (WebSocket or SSE) | Medium | 1 week |
| PDF report generation for decisions | Medium | 1 week |
| Mobile-responsive design improvements | Medium | 2 weeks |
| RDS Proxy integration (Lambda connection pooling) | High | 3 days |

### 16.2 Medium Term (6–12 months)

| Feature | Priority | Effort |
|---------|----------|--------|
| Multi-currency support (EUR, GBP, USD) | High | 3 weeks |
| Portfolio risk dashboard (risk_manager) | High | 4 weeks |
| Model drift monitoring (mrm_analyst) | High | 3 weeks |
| Automated re-scoring on data updates | Medium | 2 weeks |
| API rate limiting (API Gateway usage plans) | High | 3 days |
| Multi-region DR failover | Medium | 4 weeks |

### 16.3 Long Term (12+ months)

| Feature | Priority | Effort |
|---------|----------|--------|
| Alternative data sources (Companies House direct API) | High | 6 weeks |
| Continuous model retraining pipeline (MLflow/SageMaker) | High | 8 weeks |
| Secondary market loan trading module | Low | 12 weeks |
| Embedded finance API (white-label) | Low | 16 weeks |
| EU Digital Finance Package compliance (DORA) | High | 6 weeks |

### 16.4 Technical Debt & Improvements

- Replace `pg8000.native` with `asyncpg` for better async performance (requires Lambda build layer with C extensions)
- Enable Terraform remote state locking with DynamoDB
- Add distributed tracing (AWS X-Ray) across Lambda functions
- Implement proper refresh token rotation in Cognito SDK integration
- Add database connection pooling via RDS Proxy (currently every Lambda invocation opens a new connection)

---

## Appendix A — Monorepo Structure

```
sme-lending-platform/
├── apps/
│   ├── web/              — React frontend (Vite)
│   └── api/              — FastAPI backend
├── packages/
│   └── shared-types/     — Shared TypeScript types
├── infrastructure/
│   └── terraform/        — IaC (AWS resources)
├── .github/
│   └── workflows/
│       └── ci.yml        — GitHub Actions pipeline
├── docs/
│   ├── adr/              — Architecture Decision Records
│   ├── api/              — API documentation
│   └── architecture/     — Architecture diagrams
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Appendix B — Environment Variables

### Frontend (Vercel)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_COGNITO_USER_POOL_ID` | Optional | AWS Cognito User Pool ID |
| `VITE_COGNITO_CLIENT_ID` | Optional | Cognito App Client ID |
| `VITE_COGNITO_REGION` | Optional | AWS region (e.g., `us-east-1`) |

### Backend (Lambda)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SECRET_KEY` | ✅ | Application secret key |
| `JWT_SECRET_KEY` | ✅ | JWT signing key |
| `ENVIRONMENT` | ✅ | `development` / `production` |
| `COGNITO_POOL_ID` | Optional | Cognito pool for token validation |
| `S3_BUCKET_NAME` | Optional | Document storage bucket |

## Appendix C — Demo Credentials

For evaluation/demo purposes (no AWS Cognito required):

| Role | Email | Password |
|------|-------|----------|
| Borrower (SME) | `borrower@company.ie` | `demo` |
| Credit Officer | `officer@finpal.ie` | `demo` |

> **Note:** These credentials are hardcoded for demonstration only. In production, all authentication is handled by AWS Cognito with MFA support.

---

*Document prepared for portfolio and technical evaluation purposes.*  
*FinPal SME Lending Platform — © 2026 Engineering Team*
