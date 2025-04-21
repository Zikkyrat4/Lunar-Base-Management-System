from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class MapBase(BaseModel):
    name: str
    description: Optional[str] = None
    file_type: str
    is_public: bool = False

class MapCreate(BaseModel):
    name: str
    file_type: str
    description: Optional[str] = None
    is_public: bool = False

class Map(MapBase):
    id: int
    created_at: datetime
    created_by: int
    file_path: str

    class Config:
        orm_mode = True