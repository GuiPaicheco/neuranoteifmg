from fastapi import Depends
from backend.database import get_database
from backend.config import settings
from backend.repositories.user_repository import UserRepository
from backend.repositories.note_repository import NoteRepository
from backend.repositories.corporation_repository import CorporationRepository
from backend.services.user_service import UserService
from backend.services.note_service import NoteService
from backend.services.corporation_service import CorporationService
from backend.services.file_service import FileService

def get_db():
    """Retorna a base de dados ativa (real ou em memória)"""
    return get_database()

def get_user_repository(db = Depends(get_db)) -> UserRepository:
    return UserRepository(db)

def get_note_repository(db = Depends(get_db)) -> NoteRepository:
    return NoteRepository(db)

def get_corporation_repository(db = Depends(get_db)) -> CorporationRepository:
    return CorporationRepository(db)

def get_user_service(user_repo = Depends(get_user_repository)) -> UserService:
    return UserService(user_repo)

def get_note_service(note_repo = Depends(get_note_repository)) -> NoteService:
    return NoteService(note_repo)

def get_corporation_service(
    corp_repo = Depends(get_corporation_repository),
    user_repo = Depends(get_user_repository)
) -> CorporationService:
    return CorporationService(corp_repo, user_repo)

def get_file_service() -> FileService:
    return FileService(upload_dir=settings.UPLOAD_DIR)
