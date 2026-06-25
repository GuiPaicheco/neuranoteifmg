import aiofiles
import os
from datetime import datetime
import uuid
from pathlib import Path
from typing import Tuple, Optional

class FileService:
    """Serviço de gerenciamento de arquivos anexados"""

    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)

    def ensure_upload_dir(self):
        """Criar diretório de uploads se não existir"""
        self.upload_dir.mkdir(exist_ok=True)

    async def save_file(self, file_content: bytes, filename: str, user_id: str) -> dict:
        """Salvar arquivo e retornar metadados"""
        self.ensure_upload_dir()

        # Gerar ID único para o arquivo
        file_id = str(uuid.uuid4())
        file_ext = Path(filename).suffix
        stored_name = f"{file_id}{file_ext}"

        # Salvar arquivo no diretório do usuário
        user_dir = self.upload_dir / user_id
        user_dir.mkdir(parents=True, exist_ok=True)
        file_path = user_dir / stored_name

        async with aiofiles.open(file_path, "wb") as f:
            await f.write(file_content)

        # Retornar metadados
        return {
            "id": file_id,
            "name": filename,
            "file_type": self.get_file_type(filename),
            "size": len(file_content),
            "url": f"/api/v1/files/download/{file_id}",
            "uploaded_by": user_id,
            "created_at": datetime.utcnow(),
        }

    async def get_file_path(self, file_id: str, user_id: str) -> Tuple[Optional[Path], Optional[str]]:
        """Buscar caminho físico do arquivo e nome original"""
        user_dir = self.upload_dir / user_id
        if not user_dir.exists():
            return None, None

        # Procurar pelo ID do arquivo
        for file_path in user_dir.glob(f"{file_id}.*"):
            if file_path.is_file():
                return file_path, file_path.name
        return None, None

    async def delete_file(self, file_id: str, user_id: str) -> bool:
        """Deletar arquivo físico"""
        user_dir = self.upload_dir / user_id
        if not user_dir.exists():
            return False

        for file_path in user_dir.glob(f"{file_id}.*"):
            if file_path.is_file():
                file_path.unlink()
                return True
        return False

    def get_file_type(self, filename: str) -> str:
        """Determinar o tipo simplificado de arquivo"""
        ext = Path(filename).suffix.lower()
        type_map = {
            ".pdf": "pdf",
            ".doc": "doc",
            ".docx": "doc",
            ".xls": "xls",
            ".xlsx": "xls",
            ".jpg": "image",
            ".jpeg": "image",
            ".png": "image",
            ".gif": "image",
            ".mp3": "audio",
            ".wav": "audio",
            ".mp4": "video",
            ".avi": "video",
            ".txt": "text",
            ".md": "text",
            "zip": "archive",
            "rar": "archive",
        }
        return type_map.get(ext, "file")
