"""
Security — Cognito JWT validation.

Validates the Cognito IdToken (Bearer) sent from the frontend.
Falls back to demo tokens so local development still works without AWS.

Cognito JWKS endpoint:
  https://cognito-idp.<region>.amazonaws.com/<pool_id>/.well-known/jwks.json

The IdToken carries:
  - sub            → unique Cognito user ID
  - email          → user email
  - cognito:groups → list of Cognito group names (e.g. ["CreditOfficer"])
  - name / given_name / family_name  → display name
  - custom:company_name → company (for borrowers)
"""
from __future__ import annotations

import threading
from functools import lru_cache
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwk, jwt

from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

# ── Cognito group → internal role ────────────────────────────────────────────

_GROUP_TO_ROLE: dict[str, str] = {
    "Borrower":            "borrower_sme",
    "CreditOfficer":       "credit_officer",
    "RiskManager":         "risk_manager",
    "ComplianceOfficer":   "compliance_officer",
    "MRMAnalyst":          "mrm_analyst",
    "OpsManager":          "ops_manager",
    "CollectionsOfficer":  "collections_officer",
    "Admin":               "it_admin",
}

# ── Demo tokens (fallback for local dev without Cognito) ─────────────────────

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
    "dummy-token": {
        "sub": "demo-borrower-001",
        "role": "borrower_sme",
        "username": "borrower@company.ie",
        "display_name": "Sarah Mitchell",
    },
}

_DEFAULT_USER: dict[str, Any] = {
    "sub": "demo-borrower-001",
    "role": "borrower_sme",
    "username": "borrower@company.ie",
    "display_name": "Sarah Mitchell",
}

# ── JWKS cache (fetched once, refreshed on key miss) ─────────────────────────

_jwks_cache: dict[str, Any] = {}
_jwks_lock = threading.Lock()


def _jwks_url() -> str:
    region = settings.COGNITO_REGION or "us-east-1"
    pool_id = settings.COGNITO_USER_POOL_ID or ""
    return f"https://cognito-idp.{region}.amazonaws.com/{pool_id}/.well-known/jwks.json"


def _get_jwks() -> dict[str, Any]:
    global _jwks_cache
    with _jwks_lock:
        if _jwks_cache:
            return _jwks_cache
        try:
            resp = httpx.get(_jwks_url(), timeout=5)
            resp.raise_for_status()
            _jwks_cache = resp.json()
        except Exception:
            _jwks_cache = {"keys": []}
        return _jwks_cache


def _cognito_available() -> bool:
    return bool(settings.COGNITO_USER_POOL_ID and settings.COGNITO_CLIENT_ID)


def _verify_cognito_token(token: str) -> dict[str, Any] | None:
    """Validate a Cognito IdToken. Returns claims dict or None on failure."""
    if not _cognito_available():
        return None
    try:
        jwks = _get_jwks()
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        # Find matching key
        key_data = next((k for k in jwks.get("keys", []) if k["kid"] == kid), None)
        if not key_data:
            # Refresh JWKS once on key miss
            global _jwks_cache
            with _jwks_lock:
                _jwks_cache = {}
            jwks = _get_jwks()
            key_data = next((k for k in jwks.get("keys", []) if k["kid"] == kid), None)
        if not key_data:
            return None

        public_key = jwk.construct(key_data)
        issuer = f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}"

        claims = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.COGNITO_CLIENT_ID,
            issuer=issuer,
        )
        return claims
    except JWTError:
        return None
    except Exception:
        return None


def _claims_to_user(claims: dict[str, Any]) -> dict[str, Any]:
    """Convert Cognito IdToken claims → internal user dict."""
    groups: list[str] = claims.get("cognito:groups", [])
    role = "borrower_sme"
    for g in groups:
        if g in _GROUP_TO_ROLE:
            role = _GROUP_TO_ROLE[g]
            break

    email = claims.get("email", "")
    given = claims.get("given_name", "")
    family = claims.get("family_name", "")
    display_name = f"{given} {family}".strip() or claims.get("name", "") or email

    return {
        "sub": claims.get("sub", ""),
        "role": role,
        "username": email,
        "display_name": display_name,
        "company": claims.get("custom:company_name", ""),
    }


# ── FastAPI dependencies ──────────────────────────────────────────────────────


def get_current_user(token: str | None = Depends(oauth2_scheme)) -> dict[str, Any]:
    """
    Validates the Bearer token:
    1. Try Cognito JWT validation (production)
    2. Fall back to demo token lookup (local dev)
    3. If no token and Cognito is configured → 401
    4. If no token and no Cognito configured → default demo user
    """
    if token:
        # Try Cognito JWT first
        claims = _verify_cognito_token(token)
        if claims:
            return _claims_to_user(claims)

        # Fall back to demo token
        demo_user = _DEMO_TOKENS.get(token)
        if demo_user:
            return demo_user

        # Token provided but invalid
        if _cognito_available():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return _DEFAULT_USER

    # No token
    if _cognito_available():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _DEFAULT_USER


def require_roles(*roles: str):
    """Dependency factory that enforces role membership."""
    def _check(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.get('role')}' is not authorised for this resource.",
            )
        return user
    return _check


# ── Legacy stubs ──────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    from passlib.context import CryptContext
    return CryptContext(schemes=["bcrypt"]).hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    from passlib.context import CryptContext
    return CryptContext(schemes=["bcrypt"]).verify(plain, hashed)


def create_access_token(subject: str | Any, role: str, extra: dict | None = None) -> str:
    return f"demo-token-{role.split('_')[0]}"


def decode_token(token: str) -> dict[str, Any]:
    claims = _verify_cognito_token(token)
    if claims:
        return _claims_to_user(claims)
    return _DEMO_TOKENS.get(token, _DEFAULT_USER)
