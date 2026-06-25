from fastapi import APIRouter, HTTPException, status, Depends
from backend.models import UserCreate, UserResponse, LoginRequest, Token, LoginType
from backend.models.corporation import CorporationCreate, CorporationResponse, Role, CorporateUser
from backend.models.auth import LoginCorporateRequest
from backend.services.auth_service import AuthService
from backend.repositories.user_repository import UserRepository
from backend.repositories.corporation_repository import CorporationRepository
from backend.services.corporation_service import CorporationService
from backend.services.user_service import UserService
from backend.dependencies import (
    get_user_repository,
    get_corporation_repository,
    get_corporation_service,
    get_user_service,
)
from backend.middleware.auth import get_current_user
from datetime import datetime, timedelta
import uuid

router = APIRouter()

@router.post("/register/personal", response_model=Token)
async def register_personal(
    user_data: UserCreate,
    user_repo: UserRepository = Depends(get_user_repository),
):
    """Registrar novo usuário pessoal"""
    # Verificar se email já existe
    existing_user = await user_repo.get_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já registrado",
        )

    # Criar usuário
    hashed_password = AuthService.hash_password(user_data.password)
    user_id = str(uuid.uuid4())
    user = {
        "_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "nickname": user_data.nickname or user_data.name.split(" ")[0],
        "bio": user_data.bio,
        "hashed_password": hashed_password,
        "login_type": LoginType.PERSONAL,
        "corporation_id": None,
        "role": None,
        "avatar": None,
        "preferences": {},
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await user_repo.create(user)

    # Gerar tokens
    access_token = AuthService.create_access_token({"sub": user["_id"]})
    refresh_token = AuthService.create_refresh_token({"sub": user["_id"]})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/register/corporate", response_model=Token)
async def register_corporate(
    corp_data: CorporationCreate,
    corp_service: CorporationService = Depends(get_corporation_service),
    user_repo: UserRepository = Depends(get_user_repository),
):
    """Criar nova corporação e registrar admin"""
    # Verificar se email admin já existe
    existing_user = await user_repo.get_by_email(corp_data.admin_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email do administrador já registrado",
        )

    # Criar corporação e administrador
    result = await corp_service.create_corporation(corp_data)

    admin_id = result["admin_id"]

    # Gerar tokens
    access_token = AuthService.create_access_token({"sub": admin_id})
    refresh_token = AuthService.create_refresh_token({"sub": admin_id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/login", response_model=Token)
async def login(
    credentials: LoginRequest,
    user_repo: UserRepository = Depends(get_user_repository),
):
    """Login de usuário pessoal"""
    # Buscar usuário
    user = await user_repo.get_by_email(credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )

    # Verificar senha
    if not AuthService.verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )

    # Gerar tokens
    access_token = AuthService.create_access_token({"sub": user["_id"]})
    refresh_token = AuthService.create_refresh_token({"sub": user["_id"]})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/login/corporate", response_model=Token)
async def login_corporate(
    credentials: LoginCorporateRequest,
    corp_repo: CorporationRepository = Depends(get_corporation_repository),
    user_repo: UserRepository = Depends(get_user_repository),
):
    """Login de usuário corporativo"""
    # Buscar corporação
    corporation = await corp_repo.get_by_name(credentials.corporation_name)
    if not corporation:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Corporação não encontrada",
        )

    # Buscar usuário na corporação
    user_in_corp = next(
        (u for u in corporation.get("users", []) if u["name"] == credentials.user_name),
        None,
    )
    if not user_in_corp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado nesta corporação",
        )

    # Buscar usuário completo
    user = await user_repo.get_by_id(user_in_corp["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cadastro do usuário não encontrado",
        )

    # Se houver senha do admin para validação
    if credentials.admin_password and user.get("hashed_password"):
        if not AuthService.verify_password(credentials.admin_password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Senha de administrador incorreta",
            )

    # Gerar tokens
    access_token = AuthService.create_access_token({"sub": user["_id"]})
    refresh_token = AuthService.create_refresh_token({"sub": user["_id"]})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """Renovar token de acesso"""
    payload = AuthService.decode_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido",
        )

    user_id = payload.get("sub")
    new_access_token = AuthService.create_access_token({"sub": user_id})
    new_refresh_token = AuthService.create_refresh_token({"sub": user_id})

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user_id: str = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Obter informações do usuário atual"""
    user = await user_service.get_profile(current_user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    return UserResponse(**user)
