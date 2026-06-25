from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from backend.models import UserResponse
from backend.services.user_service import UserService
from backend.dependencies import get_user_service
from backend.middleware.auth import get_current_user
from typing import Optional

router = APIRouter()

class UpdateProfileRequest(BaseModel):
    nickname: Optional[str] = None
    bio: Optional[str] = None
    preferences: Optional[dict] = None

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

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    update_data: UpdateProfileRequest,
    current_user_id: str = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Atualizar informações do usuário"""
    user = await user_service.update_profile(
        current_user_id,
        update_data.nickname,
        update_data.bio,
        update_data.preferences
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )
    return UserResponse(**user)

@router.post("/me/avatar")
async def upload_avatar(
    file_data: dict,
    current_user_id: str = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Salvar URL/data do avatar"""
    avatar_url = file_data.get("url")
    if not avatar_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL do avatar não informada",
        )
        
    url = await user_service.update_avatar(current_user_id, avatar_url)
    return {"avatar": url}
