"""Unit tests — JWT and password utilities."""

import pytest

from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash_and_verify():
    pw = "FinPal@CO1"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed)
    assert not verify_password("wrong", hashed)


def test_create_and_decode_token():
    token = create_access_token(subject="user-123", role="credit_officer")
    assert isinstance(token, str)
    payload = decode_token(token)
    assert payload["sub"] == "user-123"
    assert payload["role"] == "credit_officer"


def test_invalid_token_raises():
    from fastapi import HTTPException

    with pytest.raises(HTTPException):
        decode_token("not-a-valid-token")
