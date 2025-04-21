from fastapi import APIRouter
from app.api.v1.endpoints import (
    base, 
    login, 
    users, 
    resources, 
    maps,
    objects
)

api_router = APIRouter()
api_router.include_router(base.router, prefix="/base", tags=["base"])
api_router.include_router(login.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(resources.router, tags=["resources"])
api_router.include_router(maps.router, prefix="", tags=["maps"])
api_router.include_router(objects.router, prefix="/objects", tags=["objects"])