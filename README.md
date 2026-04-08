# CreditCore

**All-in-one SME Credit Platform** — automated underwriting, real-time decisioning,
SEPA instant payments, and full EU regulatory compliance.

[![CI](https://github.com/creditcore/creditcore/actions/workflows/ci.yml/badge.svg)](https://github.com/creditcore/creditcore/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/creditcore/creditcore/branch/main/graph/badge.svg)](https://codecov.io/gh/creditcore/creditcore)

---

## What CreditCore does

| Capability                   | Spec                                                      |
| ---------------------------- | --------------------------------------------------------- |
| SME loan underwriting        | < 500 ms, STP ≥ 70%                                       |
| SEPA Instant Credit Transfer | ≤ 10 seconds, 24/7/365                                    |
| SEPA Direct Debit            | Full mandate lifecycle + R-transaction handling           |
| Decision explainability      | SHAP reason codes, immutable audit trail                  |
| Regulatory coverage          | EU AI Act, GDPR Art. 22, EBA, DORA, IFRS 9, CCR/AnaCredit |

---

## Repository structure

```
creditcore/                              ← monorepo root (Turborepo + pnpm)
│
├── apps/
│   ├── web/                             ← React 18 + Vite + TypeScript
│   │   └── src/
│   │       ├── components/
│   │       │   ├── ui/                  ← Button, Input, Card, Badge, Modal…
│   │       │   ├── layout/              ← Sidebar, Header, PageWrapper
│   │       │   └── features/            ← domain components (UnderwritingPanel…)
│   │       ├── hooks/                   ← custom React hooks
│   │       ├── lib/                     ← API client, formatters, utils
│   │       ├── pages/                   ← route-level components
│   │       ├── services/                ← Axios service layer
│   │       ├── store/                   ← Zustand global state
│   │       ├── styles/                  ← global CSS, Trust Navy design tokens
│   │       └── types/                   ← frontend TypeScript types
│   │
│   └── api/                             ← Python 3.12 + FastAPI
│       └── app/
│           ├── api/v1/endpoints/        ← route handlers
│           ├── core/                    ← config, DB session, security, logging
│           ├── models/                  ← SQLAlchemy ORM models
│           ├── schemas/                 ← Pydantic request/response schemas
│           ├── services/                ← business logic
│           └── middleware/              ← auth, audit logging, rate limiting
│
├── packages/
│   ├── shared-types/                    ← TypeScript types shared across apps
│   └── ui-tokens/                       ← Trust Navy design tokens (CSS vars)
│
├── infrastructure/
│   └── terraform/
│       ├── modules/                     ← vpc / ecs / rds / s3 / iam
│       └── environments/               ← dev / staging / prod root modules
│
├── docs/
│   ├── adr/                             ← Architecture Decision Records
│   ├── api/                             ← OpenAPI 3.1 spec
│   ├── architecture/                    ← system diagrams
│   └── wireframes/                      ← UI wireframes
│
└── .github/
    ├── workflows/
    │   ├── ci.yml                       ← lint → test → build → secret scan
    │   └── deploy.yml                   ← Docker → ECR → Terraform → ECS
    └── PULL_REQUEST_TEMPLATE/
```

---

## Tech stack

| Layer            | Technology                            | Reason                                  |
| ---------------- | ------------------------------------- | --------------------------------------- |
| Frontend         | React 18, Vite, TypeScript            | Fast DX, strong types, ecosystem        |
| Styling          | CSS custom properties + design tokens | Trust Navy theme, zero runtime cost     |
| State            | Zustand                               | Lightweight, no boilerplate             |
| Backend          | Python 3.12, FastAPI                  | Async, auto OpenAPI docs, type-safe     |
| ORM / migrations | SQLAlchemy 2 + Alembic                | Async support, robust migrations        |
| Database         | PostgreSQL 16 (AWS RDS)               | ACID, JSONB for audit payloads          |
| Auth             | OAuth 2.0 + OIDC, JWT                 | SAML/OIDC SSO, RBAC, MFA                |
| Infrastructure   | Terraform + AWS ECS Fargate           | Reproducible IaC, serverless containers |
| Monorepo tooling | Turborepo + pnpm workspaces           | Path-filtered builds, remote caching    |
| CI/CD            | GitHub Actions                        | Separate FE/BE pipelines, OIDC to AWS   |
| Observability    | AWS CloudWatch + X-Ray                | Structured logs, distributed tracing    |
| Testing — FE     | Vitest + Testing Library              | Fast, coverage-native                   |
| Testing — BE     | pytest + pytest-asyncio               | Async test support, fixtures            |
| Static analysis  | ESLint, Ruff, Mypy, Bandit            | Lint + types + security per language    |
| Secret scanning  | Gitleaks                              | Blocks secrets before they land in git  |

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 → `npm install -g pnpm`
- **Python** ≥ 3.12
- **Terraform** ≥ 1.8
- **Docker** ≥ 24
- **AWS CLI** v2 (for infrastructure work)

---

## Getting started locally

### 1. Clone

```bash
git clone https://github.com/creditcore/creditcore.git
cd creditcore
```

### 2. Install all dependencies

```bash
pnpm install          # installs all Node workspaces
cd apps/api && pip install -e ".[dev]"
```

### 3. Set up environment variables

```bash
cp apps/web/.env.example  apps/web/.env.local
cp apps/api/.env.example  apps/api/.env
# Edit both files — comments explain each variable
```

### 4. Start development servers

```bash
pnpm dev
# Frontend → http://localhost:5173
# Backend  → http://localhost:8000
# API docs → http://localhost:8000/docs
```

### 5. Run all tests

```bash
pnpm test                         # all workspaces
pnpm --filter=@creditcore/web test # FE only
cd apps/api && pytest              # BE only
```

### 6. Lint and format

```bash
pnpm lint
pnpm format
```

---

## Branching & commits

See [ADR-002](docs/adr/ADR-002-branching-strategy.md) for full strategy.

```
main          → always green, auto-deploys to staging
v1.x.x tag   → triggers production deploy (requires approval)
feature/...  → your work, PR into main, lives ≤ 2 days
```

Commit format (enforced — PR will fail otherwise):

```
feat(api): add sdd mandate amendment endpoint
fix(web): resolve overflow on decision card mobile
infra(vpc): add private subnet eu-west-1c
ci(api): add pip-audit to pipeline
```

Types: `feat fix docs style refactor perf test build ci chore revert infra security`
Scopes: `web api infra ci ui tokens shared docs deps release`

---

## Infrastructure (AWS — student LabRole)

See [ADR-003](docs/adr/ADR-003-aws-labrole.md) for LabRole constraints.

```bash
cd infrastructure/terraform/environments/dev
terraform init
terraform plan
terraform apply
```

Remote state → S3 bucket + DynamoDB lock (no local state files committed).
CI/CD authenticates via OIDC — no access keys stored in GitHub secrets.

---

## Architecture Decision Records

| #                                                 | Decision                | Status   |
| ------------------------------------------------- | ----------------------- | -------- |
| [ADR-001](docs/adr/ADR-001-monorepo.md)           | Monorepo with Turborepo | Accepted |
| [ADR-002](docs/adr/ADR-002-branching-strategy.md) | Trunk-based development | Accepted |
| [ADR-003](docs/adr/ADR-003-aws-labrole.md)        | AWS LabRole constraints | Accepted |

---

## Regulatory coverage

| Regulation           | Implementation summary                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| EU AI Act Annex III  | Model cards, conformity packages, drift monitoring (PSI), human oversight |
| GDPR Article 22      | Explainability endpoint, 30-day review SLA, appeal workflow               |
| EBA Loan Origination | Creditworthiness storage, pricing audit trail, EWI cases                  |
| DORA                 | RTO ≤ 4h / RPO ≤ 1h, major incident workflow, TPRM register               |
| IFRS 9               | Stage 1/2/3 classification, scenario-weighted ECL                         |
| CCR / AnaCredit      | Monthly auto-submissions, < 1% error rate                                 |
| SEPA SCT Inst / SDD  | ≤ 10s payouts, mandate lifecycle, R-transaction handling                  |

---

## Contributing

1. `git checkout -b feature/api/your-feature`
2. Make changes and write tests
3. `git commit -m "feat(api): your feature"` — commitlint enforces format
4. Push and open PR — fill in the template fully
5. CI must be green before review
6. Squash merge on approval

---

## License

MIT — see [LICENSE](LICENSE)
