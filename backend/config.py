from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Configurações da aplicação"""

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "NeuraNote"
    PROJECT_VERSION: str = "0.1.0"

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "neuranote"

    # JWT
    SECRET_KEY: str = "seu-secret-key-super-secreto-mude-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    # CORS
    ALLOWED_ORIGINS: list = ["*"]
    # Llama/IA
    LLAMA_MODEL: str = "llama2"
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # Files
    MAX_FILE_SIZE_MB: int = 100
    UPLOAD_DIR: str = "uploads"

    # Environment
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
