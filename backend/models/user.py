from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class LoginType(str, Enum):
    PERSONAL = "personal"
    CORPORATE = "corporate"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    nickname: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str
    login_type: LoginType = LoginType.PERSONAL
    corporation_id: Optional[str] = None

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    login_type: LoginType
    corporation_id: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    login_type: LoginType
    corporation_id: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None
    preferences: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
