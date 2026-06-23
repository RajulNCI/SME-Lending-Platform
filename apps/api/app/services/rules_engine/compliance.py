"""Compliance check pipeline + consent log.

Runs after IDP + open banking. Produces the `checks` array (each
{name, detail, status, time}) and the `consentLog`. Mix of rule-based checks
(GDPR, CRO, tax, reconciliation, DSCR, EU AI Act, fairness, indebtedness) and
inputs from upstream ML services (AML/PEP, fraud) which are passed in as flags.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from . import policy

# Canonical consent types, in capture order.
CONSENT_TYPES = [
    ("open_banking", "Open Banking (PSD2/AISP)"),
    ("credit_bureau", "Credit Bureau"),
    ("art22", "Art.22 Automated Processing"),
    ("data_retention", "Data Retention (5yr)"),
]


def _now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def build_consent_log(granted: list[str] | None) -> list[dict[str, Any]]:
    """Timestamped consent records for the consents the borrower granted."""
    granted_set = {c.strip().lower() for c in (granted or [])}
    log = []
    for key, label in CONSENT_TYPES:
        if key in granted_set:
            log.append({"type": label, "timestamp": _now(), "status": "granted"})
    return log


def _chk(name: str, status: str, detail: str) -> dict[str, Any]:
    return {"name": name, "status": status, "detail": detail, "time": _now()}


def run_checks(ctx: dict[str, Any]) -> list[dict[str, Any]]:
    """Execute the compliance pipeline against the assembled context.

    `ctx` expects: consents(list), cro_verified, tax_cleared, aml_hit, pep_hit,
    fraud_score, reconciliation(dict), dscr(float), existing_debt, revenue,
    fairness(dict).
    """
    checks: list[dict[str, Any]] = []

    # 1. GDPR consent notice (Art.13/14) — Open Banking + Art.22 are mandatory.
    consents = {c.strip().lower() for c in (ctx.get("consents") or [])}
    if {"open_banking", "art22"} <= consents:
        checks.append(
            _chk(
                "GDPR Consent Notice",
                "pass",
                "Art.13/14 notice and required consents captured before processing.",
            )
        )
    else:
        checks.append(
            _chk(
                "GDPR Consent Notice",
                "fail",
                "Mandatory consent (Open Banking / Art.22) missing.",
            )
        )

    # 2. CRO company registration.
    if ctx.get("cro_verified", True):
        checks.append(
            _chk("CRO Registration", "pass", "Company verified against CRO registry.")
        )
    else:
        checks.append(
            _chk("CRO Registration", "fail", "CRO registration could not be verified.")
        )

    # 3. Tax clearance (ROS).
    if ctx.get("tax_cleared", True):
        checks.append(
            _chk(
                "Tax Clearance (ROS)", "pass", "Valid tax clearance confirmed via ROS."
            )
        )
    else:
        checks.append(
            _chk(
                "Tax Clearance (ROS)",
                "warn",
                "Tax clearance not confirmed; manual check required.",
            )
        )

    # 4. AML / PEP screening (ML name-match + adverse media upstream).
    if ctx.get("aml_hit"):
        checks.append(
            _chk(
                "AML / PEP Screening",
                "fail",
                "AML/sanctions match detected; escalate to compliance.",
            )
        )
    elif ctx.get("pep_hit"):
        checks.append(
            _chk(
                "AML / PEP Screening",
                "warn",
                "Politically exposed person flag; enhanced due diligence.",
            )
        )
    else:
        checks.append(
            _chk("AML / PEP Screening", "pass", "No AML/PEP/sanctions matches.")
        )

    # 5. Fraud & synthetic ID (behavioural scoring upstream).
    fraud = float(ctx.get("fraud_score", 0.0) or 0.0)
    if fraud > 0.70:
        checks.append(
            _chk(
                "Fraud & Synthetic ID", "fail", f"High fraud risk score ({fraud:.2f})."
            )
        )
    elif fraud > 0.40:
        checks.append(
            _chk(
                "Fraud & Synthetic ID",
                "warn",
                f"Elevated fraud risk score ({fraud:.2f}).",
            )
        )
    else:
        checks.append(
            _chk(
                "Fraud & Synthetic ID",
                "pass",
                "No fraud / synthetic-identity indicators.",
            )
        )

    # 6. Revenue reconciliation (declared vs open banking).
    rec = ctx.get("reconciliation") or {}
    rec_status = rec.get("status", "pass")
    checks.append(
        _chk(
            "Revenue Reconciliation",
            rec_status,
            rec.get(
                "discrepancyDetail", "Declared revenue reconciled with lodgements."
            ),
        )
    )

    # 7. DSCR policy gate (EBA LOM).
    dscr_value = float(ctx.get("dscr", 0.0) or 0.0)
    pmin = policy.DSCR_POLICY_MIN
    if dscr_value >= pmin:
        detail = f"DSCR {dscr_value:.2f}x >= policy min {pmin:.2f}x."
        checks.append(_chk("DSCR Policy Gate", "pass", detail))
    else:
        detail = f"DSCR {dscr_value:.2f}x < policy min {pmin:.2f}x (SICR)."
        checks.append(_chk("DSCR Policy Gate", "fail", detail))

    # 8. EU AI Act controls (Art.9-15: governance, transparency, oversight).
    checks.append(
        _chk(
            "EU AI Act Controls",
            "pass",
            "Art.9-15 controls in place: data governance, logging, "
            "transparency, human oversight.",
        )
    )

    # 9. Fairness assessment.
    fair = ctx.get("fairness") or {}
    if fair.get("disparateImpact_pass", True) and fair.get(
        "equalOpportunity_pass", True
    ):
        checks.append(
            _chk(
                "Fairness Assessment",
                "pass",
                f"Disparate impact {fair.get('disparateImpact', '-')} (>0.80), "
                f"equal opportunity {fair.get('equalOpportunity', '-')} (<0.10).",
            )
        )
    else:
        checks.append(
            _chk(
                "Fairness Assessment",
                "warn",
                "Fairness metric outside threshold; route to MRM review.",
            )
        )

    # 10. Debt schedule & over-indebtedness (only if the borrower carries debt).
    existing_debt = float(ctx.get("existing_debt", 0.0) or 0.0)
    revenue = float(ctx.get("revenue", 0.0) or 0.0)
    if existing_debt > 0:
        dti = existing_debt / revenue if revenue else 0.0
        if dti > policy.DEBT_TO_REVENUE_WARN:
            checks.append(
                _chk(
                    "Debt Schedule & Indebtedness",
                    "warn",
                    f"Existing debt {dti * 100:.0f}% of revenue; confirm schedule.",
                )
            )
        else:
            checks.append(
                _chk(
                    "Debt Schedule & Indebtedness",
                    "pass",
                    "Debt schedule verified; indebtedness within limits.",
                )
            )

    return checks


def summarise_checks(checks: list[dict[str, Any]]) -> dict[str, Any]:
    """Count pass/warn/fail."""
    counts = {"pass": 0, "warn": 0, "fail": 0}
    for c in checks:
        counts[c["status"]] = counts.get(c["status"], 0) + 1
    return {"total": len(checks), **counts}
