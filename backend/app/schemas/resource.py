from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ResourceBase(BaseModel):
    name: str
    current_level: float
    capacity: float
    unit: str

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    current_level: Optional[float] = None
    capacity: Optional[float] = None
    status: Optional[str] = None

class Resource(ResourceBase):
    id: int
    last_updated: datetime
    status: str

    class Config:
        orm_mode = True