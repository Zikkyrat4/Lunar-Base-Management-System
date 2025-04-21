from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.crud.user import get_users, create_user
from app.db.session import get_db
from app.schemas.user import User, UserCreate

router = APIRouter()

@router.get("/", response_model=list[User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=User)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(db=db, user=user)