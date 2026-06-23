"""FinPal Rules Engine — deterministic credit policy, compliance and IFRS 9.

Backup implementation of the rule-based subsystem. Takes IDP-extracted figures +
AI model outputs (PD) + open-banking data and returns every rule-based field in
the FinPal Data Dictionary. JSON in, JSON out; no database, no ML training.
"""

from __future__ import annotations

from .engine import RULES_ENGINE_VERSION, evaluate

__all__ = ["RULES_ENGINE_VERSION", "evaluate"]
