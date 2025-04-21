from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.db.session import get_db
from app.models.object import LunarObject
from app.schemas.object import ObjectCreate, Object

router = APIRouter()

@router.post("/", response_model=Object)
def create_object(obj: ObjectCreate, db: Session = Depends(get_db)):
    db_obj = LunarObject(
        id=str(uuid.uuid4()),
        type=obj.type,
        name=obj.name,
        lat=obj.lat,
        lng=obj.lng,
        created_at=datetime.utcnow()
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[Object])
def read_objects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(LunarObject).order_by(LunarObject.created_at.desc()).offset(skip).limit(limit).all()

@router.delete("/{object_id}")
def delete_object(object_id: str, db: Session = Depends(get_db)):
    db_obj = db.query(LunarObject).filter(LunarObject.id == object_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Object not found")
    db.delete(db_obj)
    db.commit()
    return {"ok": True}