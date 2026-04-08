# ADR-002: Git branching strategy

**Date:** 2025-04-08
**Status:** Accepted

---

## Decision

Trunk-based development with short-lived feature branches.

```
main  ──────────────────────────────────────── always green → auto-deploy staging
  │
  ├── feature/web/login-page        (< 2 days → PR → squash merge → main)
  ├── feature/api/sdd-mandate       (< 2 days → PR → squash merge → main)
  ├── fix/api/iban-null-500         (hotfix, same pattern)
  │
v1.2.0 tag ─────────────────────────────────── triggers production deploy
```

## Branch naming

| Pattern                   | Purpose   | Example                             |
| ------------------------- | --------- | ----------------------------------- |
| `feature/<scope>/<slug>`  | New work  | `feature/api/sdd-mandate-lifecycle` |
| `fix/<scope>/<slug>`      | Bug fix   | `fix/web/decision-card-overflow`    |
| `refactor/<scope>/<slug>` | Refactor  | `refactor/api/ecl-staging-logic`    |
| `infra/<slug>`            | Terraform | `infra/add-waf-rules`               |
| `ci/<slug>`               | CI/CD     | `ci/add-a11y-check`                 |
| `docs/<slug>`             | Docs only | `docs/update-api-spec`              |

## Rules

1. No direct commits to `main` — all changes via PR
2. PRs require ≥ 1 approval (2 for production tags)
3. All CI checks must pass before merge
4. Squash merge — one clean commit per feature on main
5. Feature branches live ≤ 2 days — split large work into small PRs
6. Production deploy = `git tag v1.x.x && git push --tags`

## Commit message format (enforced by commitlint)

```
<type>(<scope>): <description in lowercase>

feat(api): add sdd mandate amendment endpoint
fix(web): resolve decision card overflow on mobile
infra(vpc): add private subnet in eu-west-1c
ci(api): add pip-audit to pipeline
```

## Environment mapping

| Trigger        | Deploys to | Approval required             |
| -------------- | ---------- | ----------------------------- |
| Push to `main` | Staging    | No (CI passes → auto)         |
| Tag `v*`       | Production | Yes (GitHub environment rule) |

## Why trunk-based?

- Conflicts caught early — everyone integrates daily
- `main` is always releasable — no "integration hell" before a release
- Simple — no long-lived develop/release/hotfix branches to manage
