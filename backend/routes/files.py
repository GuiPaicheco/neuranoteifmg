from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from fastapi.responses import FileResponse
from backend.services.file_service import FileService
from backend.dependencies import get_file_service
from backend.middleware.auth import get_current_user

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user),
    file_service: FileService = Depends(get_file_service),
):
    """Fazer upload de arquivo"""
    try:
        # Ler conteúdo do arquivo
        content = await file.read()

        # Limitar tamanho (100MB)
        if len(content) > 100 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Arquivo muito grande (máx 100MB)",
            )

        # Salvar arquivo
        file_metadata = await file_service.save_file(
            content, file.filename or "unknown", current_user_id
        )

        return file_metadata

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer upload: {str(e)}",
        )

@router.get("/download/{file_id}")
async def download_file(
    file_id: str,
    current_user_id: str = Depends(get_current_user),
    file_service: FileService = Depends(get_file_service),
):
    """Baixar arquivo"""
    file_path, filename = await file_service.get_file_path(file_id, current_user_id)

    if not file_path or not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo não encontrado",
        )

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream",
    )

@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    current_user_id: str = Depends(get_current_user),
    file_service: FileService = Depends(get_file_service),
):
    """Deletar arquivo"""
    success = await file_service.delete_file(file_id, current_user_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo não encontrado",
        )

    return {"message": "Arquivo deletado"}
