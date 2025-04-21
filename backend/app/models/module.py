from sqlalchemy import Column, Integer, String, Float, JSON
from geoalchemy2 import Geometry
from app.db.base_class import Base

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    module_type = Column(String, nullable=False)
    area = Column(Float, nullable=False)
    location = Column(Geometry('POINT', srid=4326))
    status = Column(String, default="active")
    properties = Column(JSON, default={})