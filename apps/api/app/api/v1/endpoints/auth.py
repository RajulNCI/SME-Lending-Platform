"""
Auth endpoints — LOCAL DEMO MODE (no JWT, no Cognito, no DB lookup).

Two hardcoded demo users for the presentation:
  - borrower@company.ie / demo → SME Borrower
  - officer@finpal.ie / demo  → Credit Officer

POST /api/v1/auth/login  → returns a simple demo token + user info
GET  /api/v1/auth/me     → returns current user info from token

TODO: Replace with AWS Cognito integration for production.
"""
from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Demo users (hardcoded — no DB needed) ─────────────────────────────────────

DEMO_USERS = {
    "borrower@company.ie": {
        "id": "demo-borrower-001",
        "username": "borrower@company.ie",
        "email": "borrower@company.ie",
        "display_name": "Sarah Mitchell",
        "role": "borrower_sme",
        "password": "demo",
    },
    "officer@finpal.ie": {
        "id": "demo-officer-001",
        "username": "officer@finpal.ie",
        "email": "officer@finpal.ie",
        "display_name": "James O'Brien",
        "role": "credit_officer",
        "password": "demo",
    },
}

# Map demo token → user for the security layer
DEMO_TOKENS = {
    "demo-token-borrower": DEMO_USERS["borrower@company.ie"],
    "demo-token-officer": DEMO_USERS["officer@finpal.ie"],
}


@router.post("/login", response_model=LoginResponse, summary="Demo login (no JWT)")
async def login(body: LoginRequest) -> LoginResponse:
    """
    Local demo login — matches email + password against hardcoded users.
    Returns a simple demo token (not a JWT). No database required.
    """
    # Accept either 'username' field as email
    email = body.username.strip().lower()

    user = DEMO_USERS.get(email)
    if not user or body.password != user["password"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Use borrower@company.ie / demo or officer@finpal.ie / demo",
        )

    # Generate a deterministic demo token based on role
    token = f"demo-token-{user['role'].split('_')[0]}"

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        role=user["role"],
        display_name=user["display_name"],
        expires_in=86400,  # 24 hours (doesn't actually expire)
    )


@router.get("/me", summary="Get current demo user")
async def me():
    """Returns info about the demo user. In demo mode, returns the borrower by default."""
    user = DEMO_USERS["borrower@company.ie"]
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "display_name": user["display_name"],
        "role": user["role"],
        "is_active": True,
        "mfa_enabled": False,
    }