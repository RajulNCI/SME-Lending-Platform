"""Central policy thresholds for the FinPal rules engine.

Every constant here is sourced directly from the FinPal Data Dictionary
(Formula Reference sheet). Keeping them in one place makes the credit policy
auditable and easy to tune — nothing magic is hidden inside the logic modules.
"""

from __future__ import annotations

# --- Effective interest / discounting -------------------------------------
EIR = 0.045  # effective interest rate used for ECL discounting (4.5%)

# --- DSCR (EBA LOM creditworthiness) ---------------------------------------
DSCR_POLICY_MIN = 1.20  # >= pass, < fail (status flagged)

# --- Revenue reconciliation (declared IDP vs actual open banking) ----------
REVENUE_MATERIAL_PCT = 0.05  # variance above this => discrepancy = True (warn)
REVENUE_TOLERANCE_PCT = 0.10  # variance above this => reconciliation FAIL

# --- Affordability ---------------------------------------------------------
AFFORDABILITY_MIN = 0.60  # < 60% => capacity concern (red)

# --- Over-indebtedness / DTI ----------------------------------------------
DEBT_TO_REVENUE_WARN = 0.50  # existing debt / revenue above this => warn

# --- IFRS 9 staging --------------------------------------------------------
SICR_PD_THRESHOLD = 0.10  # PD above this is a Significant Increase in Credit Risk
LIFETIME_TENOR_MULTIPLIER = 3.2  # PD(lifetime) ~= PD(12m) x 3.2 (avg tenor)
ECL_SCENARIO_WEIGHTS = {"base": 1.0, "upside": 0.7, "downside": 1.8}

# --- Risk grade buckets (EBA internal rating scale) ------------------------
# (grade, upper PD bound). First bucket whose bound the PD is below wins.
RISK_GRADE_BANDS: list[tuple[str, float]] = [
    ("A1", 0.015),
    ("A2", 0.025),
    ("B1", 0.05),
    ("B2", 0.08),
    ("C1", 0.12),
    ("C2", 0.20),
    ("D1", 0.30),
    ("D2", float("inf")),
]
APPROVABLE_GRADES = {"A1", "A2", "B1", "B2"}  # C/D => elevated scrutiny / decline

# --- Risk-based pricing (APR) ---------------------------------------------
BASE_RATE = 0.045  # cost of funds base rate
PD_SPREAD_MULTIPLIER = 0.80  # PD spread ~= 0.8 x PD
LGD_CAPITAL_RATE = 0.105  # LGD capital charge rate
OPERATING_MARGIN = 0.020  # operating margin add-on

# --- LGD fallback (used only if no LGD model output supplied) --------------
# 1 - recovery rate, by loan type (collateral strength).
LGD_BY_LOAN_TYPE = {
    "ASSET_FINANCE": 0.35,
    "COMMERCIAL_MORTGAGE": 0.30,
    "INVOICE_FINANCE": 0.45,
    "WORKING_CAPITAL": 0.45,
}
LGD_DEFAULT = 0.45

# --- Fairness (post-hoc) ---------------------------------------------------
DISPARATE_IMPACT_MIN = 0.80  # > 0.80 pass (EEOC 4/5ths rule)
EQUAL_OPPORTUNITY_MAX = 0.10  # < 0.10 pass

# --- Sector risk weighting (used for affordability/pricing nuance) ---------
SECTOR_RISK_WEIGHT = {
    "HOSPITALITY": 1.25,
    "CONSTRUCTION": 1.15,
    "RETAIL": 1.10,
    "TRANSPORT & LOGISTICS": 1.05,
    "AGRICULTURE": 1.05,
    "MANUFACTURING": 1.00,
    "TECHNOLOGY": 0.90,
    "HEALTHCARE": 0.90,
}
SECTOR_RISK_DEFAULT = 1.0


def sector_weight(sector: str | None) -> float:
    """Look up a sector's risk weight, case-insensitively."""
    if not sector:
        return SECTOR_RISK_DEFAULT
    return SECTOR_RISK_WEIGHT.get(sector.strip().upper(), SECTOR_RISK_DEFAULT)
