from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str
    type: str = "access"  # "access" or "refresh"
    iat: int
    exp: int

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginCorporateRequest(BaseModel):
    corporation_name: str
    user_name: str
    admin_password: Optional[str] = None  # Only for creating corporation
