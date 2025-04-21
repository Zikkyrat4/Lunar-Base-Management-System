from sqlalchemy.orm import Session
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate

def get_resource(db: Session, resource_id: int):
    return db.query(Resource).filter(Resource.id == resource_id).first()

def get_resources(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Resource).offset(skip).limit(limit).all()

def create_resource(db: Session, resource: ResourceCreate):
    db_resource = Resource(**resource.dict())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

def update_resource(db: Session, resource_id: int, resource: ResourceUpdate):
    db_resource = get_resource(db, resource_id)
    if not db_resource:
        return None
    for field, value in resource.dict(exclude_unset=True).items():
        setattr(db_resource, field, value)
    db.commit()
    db.refresh(db_resource)
    return db_resource