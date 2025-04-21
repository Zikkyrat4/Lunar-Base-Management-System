from sqlalchemy import Column, String, Float, DateTime
from app.db.base_class import Base

class LunarObject(Base):
    __tablename__ = "lunar_objects"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False)