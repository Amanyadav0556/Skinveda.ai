"""
SkinVeda.ai — Application Settings
All config loaded from environment variables with sensible defaults for development.
"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "SkinVeda.ai"
    VERSION: str = "2.1.0"
    DEBUG: bool = False

    # PostgreSQL (Supabase) — postgresql://user:password@host:5432/postgres
    DATABASE_URL: str = ""

    # JWT
    JWT_SECRET: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # OpenWeather
    OPENWEATHER_API_KEY: str = ""
    OPENWEATHER_BASE_URL: str = "https://api.openweathermap.org/data/2.5"

    # OpenAI (Whisper)
    OPENAI_API_KEY: str = ""

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:4173", "http://127.0.0.1:4173", "https://skinveda.ai",
    ]

    # AI Model
    MODEL_PATH: str = "./ai/checkpoints/dinov2_skin_v2.pth"
    MODEL_CLASSES: List[str] = ["eczema", "psoriasis", "vitiligo", "acne", "dermatitis"]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
