from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.crud.base import CRUDBase
from app.models.module import Module
from app.schemas.module import ModuleCreate, ModuleUpdate, Module as ModuleSchema

router = APIRouter()

@router.get("/modules/", response_model=List[ModuleSchema])
def read_modules(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    modules = CRUDBase(Module).get_multi(db, skip=skip, limit=limit)
    return modules

@router.post("/modules/", response_model=ModuleSchema)
def create_module(module: ModuleCreate, db: Session = Depends(get_db)):
    return CRUDBase(Module).create(db, obj_in=module)

@router.put("/modules/{module_id}", response_model=ModuleSchema)
def update_module(
    module_id: int, 
    module: ModuleUpdate, 
    db: Session = Depends(get_db)
):
    db_module = CRUDBase(Module).get(db, id=module_id)
    if not db_module:
        raise HTTPException(status_code=404, detail="Module not found")
    return CRUDBase(Module).update(db, db_obj=db_module, obj_in=module)

@router.delete("/modules/{module_id}")
def delete_module(module_id: int, db: Session = Depends(get_db)):
    db_module = CRUDBase(Module).get(db, id=module_id)
    if not db_module:
        raise HTTPException(status_code=404, detail="Module not found")
    CRUDBase(Module).remove(db, id=module_id)
    return {"ok": True}


@router.get("/resources", response_model=dict)
def get_resources(db: Session = Depends(get_db)):
    return {
        "energy": {"current_level": 1200, "capacity": 2000},
        "water": {"current_level": 500, "capacity": 1000},
        "oxygen": {"current_level": 300, "capacity": 500},
        "food": {"current_level": 30, "capacity": 60}
    }