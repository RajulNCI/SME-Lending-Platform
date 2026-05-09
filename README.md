# 🏦 FinPal SME Lending Platform

**Next-Generation All-in-One SME Credit Platform** — Automated underwriting, real-time decisioning, SEPA instant payments, and full EU regulatory compliance, built for scale and security.

![CI](https://github.com/RajulNCI/SME-Lending-Platform/actions/workflows/ci.yml/badge.svg)
![Coverage](https://codecov.io/gh/RajulNCI/SME-Lending-Platform/branch/main/graph/badge.svg)
![Security](https://img.shields.io/badge/Security-OWASP_ZAP%20%7C%20SAST-brightgreen)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![Python](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)

---

## 🌟 Platform Capabilities

| Capability | Specification |
| :--- | :--- |
| **SME Loan Underwriting** | AI-driven assessment < 500 ms, Straight-Through Processing (STP) ≥ 70% |
| **SEPA Instant Credit Transfer** | ≤ 10 seconds execution, 24/7/365 availability |
| **SEPA Direct Debit** | Full mandate lifecycle management + R-transaction handling |
| **Decision Explainability** | SHAP reason codes, immutable audit trail for full transparency |
| **Regulatory Compliance** | EU AI Act, GDPR Art. 22, EBA, DORA, IFRS 9, CCR/AnaCredit compliant |

---

## 🏗️ Architecture & Repository Structure

We utilize a modern, secure, and highly scalable monorepo structure powered by Turborepo and `pnpm`.

```text
finpal-platform/                         ← Monorepo root
│
├── apps/
│   ├── web/                             ← React 18 + Vite + TypeScript (Frontend)
│   │   └── src/
│   │       ├── components/              ← Reusable UI & Layout components
│   │       ├── pages/                   ← Route-level React components
│   │       ├── services/                ← API integrations (Axios)
│   │       ├── store/                   ← Global state (Zustand)
│   │       ├── styles/                  ← Centralized Styled-Components & Tokens ✨
│   │       └── types/                   ← Frontend TypeScript models
│   │
│   └── api/                             ← Python 3.12 + FastAPI (Backend)
│       └── app/
│           ├── api/                     ← RESTful route handlers
│           ├── models/                  ← SQLAlchemy ORM entities
│           ├── services/                ← Core business & credit logic
│           └── middleware/              ← Security, auditing, and rate limiting
│
├── packages/
│   ├── shared-types/                    ← Shared TS interfaces across boundaries
│   └── ui-tokens/                       ← FinPal Design System Tokens
│
├── infrastructure/                      ← Terraform IaC (AWS ECS, RDS, S3)
└── .github/workflows/                   ← CI/CD, DevSecOps, & Automated Deployments
```

### ✨ Recent Architectural Updates
- **Decoupled Presentation Layer:** All UI styles have been successfully extracted from React components into dedicated `styled-components` files (`apps/web/src/styles/`), ensuring strict separation of concerns, high maintainability, and clean code.
- **Robust DevSecOps Pipeline:** We have integrated a full suite of automated security testing directly into our CI/CD workflows (see below).

---

## 🛡️ DevSecOps & Security Posture

Security is a first-class citizen in the FinPal platform. Our automated CI/CD pipeline ensures continuous verification:

| Security Layer | Tooling & Implementation |
| :--- | :--- |
| **Unit Testing** | `vitest` + React Testing Library (Frontend) & `pytest` (Backend). Enforced coverage thresholds. |
| **SAST (Static Analysis)** | `eslint-plugin-security` for JS vulnerabilities; `bandit` & `Mypy` for Python. |
| **SCA (Dependency Scanning)**| `pnpm audit` enforced in CI, plus automated `.github/dependabot.yml` updates. |
| **DAST (Dynamic Analysis)** | **OWASP ZAP** Baseline Scans running dynamically against staging environments. |
| **Secret Scanning** | `gitleaks` deployed on every commit to block credential leakage. |

---

## 💻 Tech Stack

| Domain | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript | Lightning-fast DX, strict typing, massive ecosystem. |
| **Styling** | `styled-components` | Scoped, dynamic, and maintainable CSS-in-JS design system. |
| **State Mgt** | Zustand | Lightweight, hook-based, and boilerplate-free. |
| **Backend** | Python 3.12, FastAPI | High-performance async processing, auto OpenAPI specs. |
| **Database** | PostgreSQL 16 (AWS RDS) + SQLAlchemy | ACID compliance, robust ORM, JSONB for immutable audits. |
| **Auth & IAM** | OAuth 2.0, OIDC, JWT | Future integration with AWS Cognito for strict RBAC. |
| **Infra (IaC)** | Terraform + AWS ECS Fargate | Reproducible, serverless, secure cloud infrastructure. |

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **Python** ≥ 3.12
- **Docker** ≥ 24

### 2. Installation
```bash
git clone https://github.com/RajulNCI/SME-Lending-Platform.git
cd SME-Lending-Platform

# Install Frontend & Workspace dependencies
pnpm install

# Install Backend dependencies
cd apps/api && pip install -e ".[dev]"
```

### 3. Environment Setup
```bash
cp apps/web/.env.example  apps/web/.env.local
cp apps/api/.env.example  apps/api/.env
```

### 4. Start Development Servers
```bash
pnpm dev

# Frontend accessible at: http://localhost:5173
# Backend accessible at:  http://localhost:8000
# OpenAPI Docs:           http://localhost:8000/docs
```

### 5. Code Quality & Testing
```bash
pnpm test          # Run Vitest and Pytest across workspaces
pnpm lint          # Run ESLint (with Security Plugins) and Ruff
pnpm format        # Auto-format with Prettier
```

---

## 📜 Regulatory Coverage Matrix

| Regulation | Platform Implementation |
| :--- | :--- |
| **EU AI Act Annex III** | Model cards, drift monitoring (PSI), mandatory human-in-the-loop (HITL) oversight. |
| **GDPR Article 22** | Dedicated Explainability endpoint, 30-day review SLAs, and integrated appeal workflows. |
| **EBA Loan Origination** | Secure creditworthiness storage, immutable pricing audit trails. |
| **DORA** | RTO ≤ 4h / RPO ≤ 1h architecture, major incident workflows. |
| **IFRS 9** | Stage 1/2/3 classification models, scenario-weighted Expected Credit Loss (ECL). |

---

## 🤝 Contributing
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Commit your changes: `git commit -m "feat(ui): extract styled components"`
3. Push to the branch and open a Pull Request.
4. Ensure the **CI/CD Pipeline** (Lint, Test, SAST, DAST) passes successfully.
5. Await approval and squash merge.

---

*FinPal — Engineering Trust in SME Lending.*
