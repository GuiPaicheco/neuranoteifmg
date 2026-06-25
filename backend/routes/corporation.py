from fastapi import APIRouter, HTTPException, status, Depends
from backend.models.corporation import CorporationResponse, CorporateUser, Role
from backend.services.corporation_service import CorporationService
from backend.dependencies import get_corporation_service
from backend.middleware.auth import get_current_user

router = APIRouter()

@router.get("/{corporation_id}", response_model=CorporationResponse)
async def get_corporation(
    corporation_id: str,
    current_user_id: str = Depends(get_current_user),
    corp_service: CorporationService = Depends(get_corporation_service),
):
    """Obter dados da corporação"""
    corporation = await corp_service.get_corporation(corporation_id)
    if not corporation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Corporação não encontrada",
        )

    # Verificar se usuário é admin
    if corporation["admin_id"] != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem visualizar dados completos da corporação",
        )

    return CorporationResponse(**corporation)

@router.post("/{corporation_id}/users")
async def create_corporate_user(
    corporation_id: str,
    user_data: dict,
    current_user_id: str = Depends(get_current_user),
    corp_service: CorporationService = Depends(get_corporation_service),
):
    """Criar novo usuário corporativo"""
    corporation = await corp_service.get_corporation(corporation_id)
    if not corporation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Corporação não encontrada",
        )

    # Verificar se usuário é admin
    if corporation["admin_id"] != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem adicionar usuários",
        )

    result = await corp_service.create_corporate_user(corporation_id, user_data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Falha ao adicionar usuário corporativo",
        )
    return result

@router.delete("/{corporation_id}/users/{user_id}")
async def delete_corporate_user(
    corporation_id: str,
    user_id: str,
    current_user_id: str = Depends(get_current_user),
    corp_service: CorporationService = Depends(get_corporation_service),
):
    """Deletar usuário corporativo"""
    corporation = await corp_service.get_corporation(corporation_id)
    if not corporation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Corporação não encontrada",
        )

    # Verificar se usuário é admin
    if corporation["admin_id"] != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem remover usuários",
        )

    success = await corp_service.delete_corporate_user(corporation_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado na corporação",
        )

    return {"message": "Usuário deletado"}

@router.put("/{corporation_id}/users/{user_id}/role")
async def update_user_role(
    corporation_id: str,
    user_id: str,
    role: str,
    current_user_id: str = Depends(get_current_user),
    corp_service: CorporationService = Depends(get_corporation_service),
):
    """Atualizar papel do usuário corporativo"""
    corporation = await corp_service.get_corporation(corporation_id)
    if not corporation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Corporação não encontrada",
        )

    # Verificar se usuário é admin
    if corporation["admin_id"] != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem atualizar papéis de usuários",
        )

    success = await corp_service.update_user_role(corporation_id, user_id, role)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Falha ao atualizar papel",
        )

    return {"message": "Papel atualizado"}
