# ADR-001: Monorepo with Turborepo

**Date:** 2025-04-08
**Status:** Accepted
**Deciders:** CreditCore Engineering Team

---

## Context

CreditCore has multiple deployable units:

- `apps/web` — React 18 + TypeScript frontend
- `apps/api` — Python 3.12 + FastAPI backend
- `packages/shared-types` — TypeScript types shared across apps
- `packages/ui-tokens` — Trust Navy design tokens
- `infrastructure/` — Terraform IaC

We must decide: **monorepo** (one repo, all code) or **polyrepo** (one repo per service).

## Decision

**Monorepo managed with Turborepo + pnpm workspaces.**

## Reasoning

| Concern               | Monorepo                               | Polyrepo                               |
| --------------------- | -------------------------------------- | -------------------------------------- |
| Shared types          | Single source of truth                 | Requires npm publishing or submodules  |
| Cross-cutting changes | One PR                                 | Multiple PRs across repos              |
| CI/CD                 | Turborepo task graph + path filters    | Separate pipelines, hard to coordinate |
| Onboarding            | `git clone` + `pnpm install`           | Multiple clones, multiple setups       |
| Deploy independence   | Docker + ECS keeps deploys independent | Independent by default                 |

For a small team (2–5 engineers), developer experience and shared-code benefits outweigh monorepo overhead. Turborepo remote caching keeps builds fast.

## Consequences

- All code in one repo
- Each `apps/*` still produces an independent Docker image and ECS service
- If a service must be extracted later, the clean folder boundary makes it straightforward
- Turborepo skips unchanged workspaces — web changes do not trigger API rebuilds

## Alternatives rejected

- **Polyrepo** — sharing types across repos is disproportionate overhead for a small team
- **Nx** — more powerful but heavier; Turborepo's zero-config approach fits better here
