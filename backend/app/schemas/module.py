from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class ModuleBase(BaseModel):
    name: str
    module_type: str
    area: float
    status: Optional[str] = "active"

class ModuleCreate(ModuleBase):
    properties: Optional[dict] = {}

class ModuleUpdate(ModuleBase):
    pass

class Module(ModuleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True