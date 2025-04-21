from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    current_level = Column(Float, nullable=False)
    capacity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="normal")