from fastapi import APIRouter, HTTPException, status, Depends
from backend.models import NoteCreate, NoteUpdate, NoteResponse
from backend.services.note_service import NoteService
from backend.dependencies import get_note_service
from backend.middleware.auth import get_current_user

router = APIRouter()

@router.post("", response_model=NoteResponse)
async def create_note(
    note_data: NoteCreate,
    current_user_id: str = Depends(get_current_user),
    note_service: NoteService = Depends(get_note_service),
):
    """Criar nova nota"""
    note = await note_service.create_note(note_data, current_user_id)
    return NoteResponse(**note)

@router.get("", response_model=list)
async def list_notes(
    current_user_id: str = Depends(get_current_user),
    note_service: NoteService = Depends(get_note_service),
):
    """Listar todas as notas do usuário"""
    notes = await note_service.list_notes(current_user_id)
    return [NoteResponse(**note) for note in notes]

@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user_id: str = Depends(get_current_user),
    note_service: NoteService = Depends(get_note_service),
):
    """Obter nota específica"""
    note = await note_service.get_note(note_id, current_user_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota não encontrada ou sem permissão de acesso",
        )
    return NoteResponse(**note)

@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note_data: NoteUpdate,
    current_user_id: str = Depends(get_current_user),
    note_service: NoteService = Depends(get_note_service),
):
    """Atualizar nota"""
    note = await note_service.update_note(note_id, note_data, current_user_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota não encontrada ou sem permissão para atualizar",
        )
    return NoteResponse(**note)

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user_id: str = Depends(get_current_user),
    note_service: NoteService = Depends(get_note_service),
):
    """Deletar nota"""
    success = await note_service.delete_note(note_id, current_user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota não encontrada ou sem permissão para deletar",
        )
