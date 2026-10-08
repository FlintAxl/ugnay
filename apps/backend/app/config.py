from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Database
    MONGODB_URL: str = Field(
        ...,
        validation_alias=AliasChoices("MONGODB_URL", "DB_URI", "db_uri"),
        description="MongoDB connection string",
    )
    DATABASE_NAME: str = Field(
        default="ugnay",
        validation_alias=AliasChoices("DATABASE_NAME", "database_name"),
    )

    # JWT Authentication
    JWT_SECRET: str = Field(
        default="ugnay-insecure-secret-key-change-in-production",
        validation_alias=AliasChoices("JWT_SECRET", "jwt_secret"),
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        validation_alias=AliasChoices("JWT_ALGORITHM", "jwt_algorithm"),
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        validation_alias=AliasChoices("ACCESS_TOKEN_EXPIRE_MINUTES", "access_token_expire_minutes"),
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7,
        validation_alias=AliasChoices("REFRESH_TOKEN_EXPIRE_DAYS", "refresh_token_expire_days"),
    )

    # Microservices
    FACE_SERVICE_URL: str = Field(
        default="http://localhost:8001",
        validation_alias=AliasChoices("FACE_SERVICE_URL", "face_service_url"),
    )
    AI_SERVICE_URL: str = Field(
        default="http://localhost:8002",
        validation_alias=AliasChoices("AI_SERVICE_URL", "ai_service_url"),
    )

    # Cloudinary Storage
    CLOUDINARY_CLOUD_NAME: str = Field(
        default="",
        validation_alias=AliasChoices("CLOUDINARY_CLOUD_NAME", "cloudinary_cloud_name"),
    )
    CLOUDINARY_API_KEY: str = Field(
        default="",
        validation_alias=AliasChoices("CLOUDINARY_API_KEY", "cloudinary_api_key"),
    )
    CLOUDINARY_API_SECRET: str = Field(
        default="",
        validation_alias=AliasChoices("CLOUDINARY_API_SECRET", "cloudinary_api_secret"),
    )
    CLOUDINARY_UPLOAD_FOLDER: str = Field(
        default="ugnay",
        validation_alias=AliasChoices("CLOUDINARY_UPLOAD_FOLDER", "cloudinary_upload_folder"),
    )
    CLOUDINARY_UPLOAD_PRESET: str = Field(
        default="ugnay_preset",
        validation_alias=AliasChoices("CLOUDINARY_UPLOAD_PRESET", "cloudinary_upload_preset"),
    )

    # Cloudflare R2 / S3 (optional)
    R2_ACCESS_KEY: str = Field(default="", validation_alias=AliasChoices("R2_ACCESS_KEY", "r2_access_key"))
    R2_SECRET_KEY: str = Field(default="", validation_alias=AliasChoices("R2_SECRET_KEY", "r2_secret_key"))
    R2_BUCKET: str = Field(default="", validation_alias=AliasChoices("R2_BUCKET", "r2_bucket"))
    R2_ENDPOINT: str = Field(default="", validation_alias=AliasChoices("R2_ENDPOINT", "r2_endpoint"))


settings = Settings()