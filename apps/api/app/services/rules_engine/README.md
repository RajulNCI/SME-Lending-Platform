# FinPal Rules Engine

Deterministic rule-based credit subsystem — the counterpart to the AI models.
Takes the IDP-extracted figures + AI model outputs (PD) + open-banking data and
returns **every rule-based field** in the FinPal Data Dictionary, ready to merge
with the AI outputs for the credit-officer dashboard.

**Pure Python, no heavy dependencies, no database, no ML training.** JSON in, JSON out.

## Usage

```python
from app.services.rules_engine import evaluate

result = evaluate({
    "sector": "Construction", "amount": 420000, "loanType": "WORKING_CAPITAL",
    "revenue": 2_840_000,            # declared (from IDP)
    "revenueActual": 2_610_000,      # open banking
    "operating_costs": 1_700_000, "payroll": 210_000, "tax": 68_000,
    "existing_debt_service": 342_000, "existing_debt": 900_000,
    "loan_term_months": 60,
    "pd": 0.034,                     # from Nathan's PD model
    "lgd": 0.42,                     # optional; rule-based fallback otherwise
    "consents": ["open_banking", "credit_bureau", "art22", "data_retention"],
    # optional external check inputs (defaults assume clean):
    # cro_verified, tax_cleared, aml_hit, pep_hit, fraud_score, days_past_due
})
```

`result` contains: `revenueActual, cashflow, dscr, dscr_policy_pass, ead, lgd,
affordability, riskGrade, apr, discrepancy, discrepancyDetail, eclStage, ecl12m,
eclLifetime, ecl12m_base/upside/downside, fairnessMetrics, checks, checks_summary,
consentLog, bars, status, recommendedStatus`.

## What it computes (all "Rule-Based" fields in the Data Dictionary)

| Area                      | Fields                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Revenue reconciliation    | revenueActual, discrepancy, discrepancyDetail (declared vs open banking; 5% material / 10% tolerance)                        |
| Cash flow & affordability | dscr (EBA LOM, min 1.20x), cashflow, affordability                                                                           |
| Loss model                | ead, lgd (rule-based fallback)                                                                                               |
| Risk grading              | riskGrade (A1..D2 EBA scale)                                                                                                 |
| Pricing                   | apr (grade-banded: A1 6.2%, B1 8.5%, C2 14.8%)                                                                               |
| IFRS 9                    | eclStage (1/2/3 SICR), ecl12m, eclLifetime, base/upside/downside scenarios                                                   |
| Fairness                  | disparateImpact (>0.80), equalOpportunity (<0.10)                                                                            |
| Compliance                | 10-check pipeline: GDPR, CRO, ROS tax, AML/PEP, Fraud, Revenue Reconciliation, DSCR Gate, EU AI Act, Fairness, Debt Schedule |
| Consent                   | consentLog (GDPR Art.13/14, captured pre-processing)                                                                         |
| State                     | status (processing -> complete \| flagged -> decided), recommendedStatus                                                     |

## Validation

Validated against the four worked examples in the FinPal Data Dictionary
(O'Brien, Ferris, GreenwayTech; Clancy is "pending" in the source). Exact matches
on risk grade, IFRS 9 stage, ECL (e.g. Greenway 378, Ferris 21,824), APR, revenue
variance, discrepancy flag, consent counts, and Ferris's two failing checks
(Revenue Reconciliation + DSCR). See `tests/unit/test_rules_engine.py`.

## Module map

| Module              | Responsibility                          |
| ------------------- | --------------------------------------- |
| `policy.py`         | All thresholds (single source of truth) |
| `grading.py`        | PD -> risk grade                        |
| `reconciliation.py` | Declared vs actual revenue              |
| `affordability.py`  | DSCR, FCF, affordability                |
| `lgd_ead.py`        | LGD fallback, EAD                       |
| `pricing.py`        | Risk-based APR                          |
| `ifrs9.py`          | Staging + ECL + scenarios               |
| `fairness.py`       | Disparate impact, equal opportunity     |
| `openbanking.py`    | Transaction aggregation, bars           |
| `compliance.py`     | Check pipeline + consent log            |
| `state_machine.py`  | Status + recommendation                 |
| `engine.py`         | `evaluate()` orchestrator               |
