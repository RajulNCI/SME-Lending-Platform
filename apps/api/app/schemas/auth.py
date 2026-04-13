"""Auth schemas — login request/response, token payload."""
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    display_name: str
    expires_in: int  # seconds


class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: datetime
    iat: datetime


class UserOut(BaseModel):
    id: str
    username: str
    email: str
    display_name: str
    role: str
    is_active: bool
    mfa_enabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}