from pydantic import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://moon_admin:secure_password@db:5432/moon_base"
    PROJECT_NAME: str = "Lunar Base API"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str
    GEOSERVER_URL: str
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()