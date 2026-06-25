from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Role(BaseModel):
    id: str
    name: str
    permissions: List[str] = Field(default_factory=list)

class CorporateUser(BaseModel):
    user_id: str
    name: str
    nickname: Optional[str] = None
    role: str
    joined_at: datetime = Field(default_factory=datetime.utcnow)

class CorporationBase(BaseModel):
    name: str

class CorporationCreate(CorporationBase):
    admin_email: str
    admin_password: str
    admin_name: str

class CorporationResponse(CorporationBase):
    id: str = Field(alias="_id")
    admin_id: str
    roles: List[Role] = Field(default_factory=list)
    users: List[CorporateUser] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class CorporationInDB(CorporationBase):
    id: str = Field(alias="_id")
    admin_id: str
    roles: List[Role] = Field(default_factory=list)
    users: List[CorporateUser] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
