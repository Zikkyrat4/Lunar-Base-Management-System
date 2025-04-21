from app.db.base_class import Base
from app.db.session import engine
from app.models.user import User
from app.models.resource import Resource
from app.models.object import LunarObject
from app.core.security import get_password_hash
import uuid
from datetime import datetime

def init_db(db):
    Base.metadata.create_all(bind=engine)
    
    # Инициализация администратора
    if not db.query(User).filter(User.email == "admin@lunar.com").first():
        user = User(
            email="admin@lunar.com",
            username="admin",
            full_name="Admin",
            hashed_password=get_password_hash("admin"),
            is_superuser=True,
            is_active=True
        )
        db.add(user)
    
    # Инициализация ресурсов
    if not db.query(Resource).first():
        resources = [
            Resource(name="energy", current_level=1000, capacity=2000, unit="kWh"),
            Resource(name="water", current_level=500, capacity=1000, unit="liters"),
            Resource(name="oxygen", current_level=300, capacity=500, unit="m³"),
            Resource(name="food", current_level=30, capacity=60, unit="days")
        ]
        db.add_all(resources)
    
    if not db.query(LunarObject).first():
        test_objects = [
            LunarObject(
                id=str(uuid.uuid4()),
                type="habitat",
                name="Главный жилой модуль",
                lat=20.5,
                lng=30.4,
                created_at=datetime.utcnow()
            ),
            LunarObject(
                id=str(uuid.uuid4()),
                type="power",
                name="Солнечная электростанция",
                lat=20.51,
                lng=30.41,
                created_at=datetime.utcnow()
            )
        ]
        db.add_all(test_objects)
    
    db.commit()