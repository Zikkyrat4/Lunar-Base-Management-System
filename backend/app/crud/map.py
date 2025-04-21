from typing import Optional
from sqlalchemy.orm import Session
from app.models.map import UserMap
from app.schemas.map import MapCreate

def create_user_map(db: Session, map: MapCreate, user_id: int, file_path: str):
    db_map = UserMap(
        name=map.name,
        description=map.description,
        file_path=file_path,
        file_type=map.file_type,
        created_by=user_id,
        is_public=map.is_public
    )
    db.add(db_map)
    db.commit()
    db.refresh(db_map)
    return db_map

def get_user_maps(db: Session, user_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(UserMap)
    if user_id is not None:
        query = query.filter((UserMap.created_by == user_id) | (UserMap.is_public == True))
    return query.offset(skip).limit(limit).all()