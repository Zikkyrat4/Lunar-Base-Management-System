from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInDBBase(UserBase):
    id: int
    is_active: bool
    is_superuser: bool

    class Config:
        orm_mode = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str