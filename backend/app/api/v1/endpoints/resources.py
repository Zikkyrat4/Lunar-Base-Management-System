from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db

router = APIRouter()

@router.get("/resources")
def get_resources(db: Session = Depends(get_db)):
    return {
        "energy": {"current_level": 1200, "capacity": 2000, "unit": "kWh"},
        "water": {"current_level": 500, "capacity": 1000, "unit": "liters"},
        "oxygen": {"current_level": 300, "capacity": 500, "unit": "m³"},
        "food": {"current_level": 30, "capacity": 60, "unit": "days"}
    }