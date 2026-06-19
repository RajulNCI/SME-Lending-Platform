"""
Security — LOCAL DEMO MODE (no JWT validation).

Recognizes demo tokens from the auth endpoint and returns the user payload.
Also accepts "dummy-token" for backward compat and allows unauthenticated
requests to pass through with a default borrower identity.

TODO: Replace with proper JWT validation (python-jose) for production.
"""
from typing import Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


# ── Demo token → user mapping ────────────────────────────────────────────────

_DEMO_TOKENS: dict[str, dict[str, Any]] = {
    "demo-token-borrower": {
        "sub": "demo-borrower-001",
        "role": "borrower_sme",
        "username": "borrower@company.ie",
        "display_name": "Sarah Mitchell",
    },
    "demo-token-officer": {
        "sub": "demo-officer-001",
        "role": "credit_officer",
        "username": "officer@finpal.ie",
        "display_name": "James O'Brien",
    },
    "demo-token-credit": {
        "sub": "demo-officer-001",
        "role": "credit_officer",
        "username": "officer@finpal.ie",
        "display_name": "James O'Brien",
    },
    # Legacy compatibility
    "dummy-token": {
        "sub": "demo-borrower-001",
        "role": "borrower_sme",
        "username": "borrower@company.ie",
        "display_name": "Sarah Mitchell",
    },
}

# Default user when no token is provided (demo convenience)
_DEFAULT_USER: dict[str, Any] = {
    "sub": "demo-borrower-001",
    "role": "borrower_sme",
    "username": "borrower@company.ie",
    "display_name": "Sarah Mitchell",
}


# ── Dependencies ──────────────────────────────────────────────────────────────


def get_current_user(token: str | None = Depends(oauth2_scheme)) -> dict[str, Any]:
    """
    FastAPI dependency — returns the demo user payload.
    In demo mode, any token (or no token) is accepted.
    """
    if not token:
        # No token provided — return default demo user
        return _DEFAULT_USER

    # Look up the demo token
    user = _DEMO_TOKENS.get(token)
    if user:
        return user

    # Unknown token — still allow through in demo mode with default user
    return _DEFAULT_USER


def require_roles(*roles: str):
    """
    Factory that returns a FastAPI dependency enforcing role membership.
    In demo mode, this is lenient — it checks the role but doesn't block hard.
    """
    def _check(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            # In demo mode, warn but don't block
            # (allows the credit officer to access borrower endpoints and vice versa)
            pass
        return user
    return _check


# ── Legacy stubs (kept so existing code that imports these doesn't break) ─────

def hash_password(password: str) -> str:
    """Demo stub — no actual hashing."""
    return f"demo-hash-{password}"


def verify_password(plain: str, hashed: str) -> bool:
    """Demo stub — just compare."""
    return hashed == f"demo-hash-{plain}"


def create_access_token(subject: str | Any, role: str, extra: dict | None = None) -> str:
    """Demo stub — returns a deterministic demo token."""
    return f"demo-token-{role.split('_')[0]}"


def decode_token(token: str) -> dict[str, Any]:
    """Demo stub — looks up demo token."""
    return _DEMO_TOKENS.get(token, _DEFAULT_USER)
