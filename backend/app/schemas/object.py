from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class ObjectBase(BaseModel):
    type: str
    lat: float
    lng: float
    name: str

class ObjectCreate(ObjectBase):
    pass

class Object(ObjectBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True