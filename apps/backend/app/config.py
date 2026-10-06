from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str
    DATABASE_NAME: str = "ugnay"
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    FACE_SERVICE_URL: str = "http://localhost:8001"
    AI_SERVICE_URL: str = "http://localhost:8002"
    R2_ACCESS_KEY: str = ""
    R2_SECRET_KEY: str = ""
    R2_BUCKET: str = ""
    R2_ENDPOINT: str = ""

    class Config:
        env_file = ".env"

settings = Settings()