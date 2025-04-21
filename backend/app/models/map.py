from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean 
from sqlalchemy.sql import func
from app.db.base_class import Base

class UserMap(Base):
    __tablename__ = "user_maps"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # 'geotiff', 'shapefile', etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)