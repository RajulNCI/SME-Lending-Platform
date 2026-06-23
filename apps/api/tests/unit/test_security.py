"""Unit tests — token utilities (demo-mode auth; production uses AWS Cognito)."""

import pytest

from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


@pytest.mark.skip(
    reason="Auth is handled by AWS Cognito; the passlib bcrypt path is legacy and "
    "incompatible with bcrypt>=4.1 (no `__about__` attribute)."
)
def test_password_hash_and_verify():
    pw = "FinPal@CO1"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed)
    assert not verify_password("wrong", hashed)


def test_create_and_decode_token():
    # Demo mode: create_access_token returns an opaque token keyed by role,
    # and decode_token resolves it back to the matching demo user.
    token = create_access_token(subject="user-123", role="credit_officer")
    assert isinstance(token, str)
    payload = decode_token(token)
    assert payload["role"] == "credit_officer"
    assert "sub" in payload


def test_unknown_token_falls_back_to_demo_user():
    # Demo mode: unknown tokens resolve to the default demo user rather than raising,
    # so the UI stays usable without a configured Cognito pool.
    payload = decode_token("not-a-valid-token")
    assert "sub" in payload
    assert payload["role"] in {"borrower_sme", "credit_officer"}
