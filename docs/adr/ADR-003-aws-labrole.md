# ADR-003: AWS student account — LabRole constraints

**Date:** 2025-04-08
**Status:** Accepted

---

## Context

AWS Academy student accounts come with a pre-configured IAM role called `LabRole`.
Students **cannot create new IAM roles** — this is a hard platform constraint.

## Constraints

| Constraint              | Impact                                                           |
| ----------------------- | ---------------------------------------------------------------- |
| Cannot create IAM roles | Terraform must use `LabRole` for all resources                   |
| Lab sessions time out   | AWS credentials reset every ~4 hours                             |
| No root access          | Some global services (Route53 hosted zones) may need workarounds |
| Limited service quotas  | ECS Fargate, RDS instances have quota caps                       |

## Decisions

1. **CI/CD authentication**: Use OIDC federation with `LabRole` — no long-lived access keys committed anywhere
2. **Terraform state**: S3 bucket + DynamoDB lock table (both creatable by LabRole)
3. **ECR**: Create two repositories — `creditcore-web` and `creditcore-api`
4. **RDS**: Use `db.t3.micro` to stay within free-tier / quota limits
5. **ECS**: Fargate (serverless containers) — no EC2 instance management

## Credential rotation

Because lab sessions expire, the team must re-export credentials before each working session:

1. Open AWS Academy → Launch environment
2. Copy `AWS Access Key ID`, `AWS Secret Access Key`, `AWS Session Token`
3. Paste into `~/.aws/credentials` under profile `[creditcore-lab]`
4. GitHub Actions uses OIDC — not affected by session expiry

## Consequences

- No custom IAM roles in Terraform — reference `LabRole` by ARN
- Terraform resource `aws_iam_role` blocks are replaced with `data "aws_iam_role"` lookups
- All team members must refresh credentials at the start of each session
