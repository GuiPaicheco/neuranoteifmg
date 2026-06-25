from backend.repositories.note_repository import NoteRepository
from backend.models.note import NoteCreate, NoteUpdate
from datetime import datetime
import uuid
from typing import Optional, List

class NoteService:
    """Serviço de negócio para gerenciamento de Notas"""

    def __init__(self, note_repo: NoteRepository):
        self.note_repo = note_repo

    async def _process_wikilinks(self, content: str, author_id: str, category: str) -> List[str]:
        """Extrai wikilinks [[Título]] do conteúdo, cria stubs se não existirem e retorna seus IDs"""
        import re
        if not content:
            return []
        
        # Encontra [[Título]] ou [[Título|Alias]] e captura apenas "Título" no grupo 1
        matches = re.findall(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]", content)
        if not matches:
            return []
        
        titles = list(set([m.strip() for m in matches if m.strip()]))
        if not titles:
            return []
            
        all_notes = await self.note_repo.list_by_author(author_id)
        connection_ids = []
        
        for t in titles:
            matched = next((n for n in all_notes if n.get("title", "").strip().lower() == t.lower()), None)
            if matched:
                connection_ids.append(matched["_id"])
            else:
                # Criar uma nova nota stub
                stub_id = str(uuid.uuid4())
                stub_note = {
                    "_id": stub_id,
                    "title": t,
                    "content": f"Esta nota foi criada automaticamente a partir de uma referência em outra nota.",
                    "category": category or "Ideas",
                    "keywords": ["stub"],
                    "author": author_id,
                    "corporation_id": None,
                    "connections": [],
                    "tasks": [],
                    "attachments": [],
                    "history": [
                        {
                            "id": str(uuid.uuid4()),
                            "timestamp": datetime.utcnow(),
                            "action": "created",
                            "summary": "Nota criada automaticamente (stub)",
                            "modified_by": author_id
                        }
                    ],
                    "location": "Local",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "last_modified_by": author_id,
                    "last_modified_at": datetime.utcnow(),
                    "access_count": 0,
                    "last_accessed_at": datetime.utcnow(),
                }
                await self.note_repo.create(stub_note)
                all_notes.append(stub_note)
                connection_ids.append(stub_id)
                
        return connection_ids

    def create_history_entry(
        self, action: str, summary: str, modified_by: str, file_changes: list = None
    ) -> dict:
        """Criar entrada de histórico"""
        return {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow(),
            "action": action,
            "summary": summary,
            "modified_by": modified_by,
            "file_changes": file_changes or [],
        }

    def add_to_history(self, note: dict, action: str, summary: str, user_id: str) -> dict:
        """Adicionar entrada ao histórico da nota"""
        entry = self.create_history_entry(action, summary, user_id)
        if "history" not in note:
            note["history"] = []
        note["history"].insert(0, entry)  # Inserir no início (mais recente primeiro)
        return note

    async def create_note(self, note_data: NoteCreate, author_id: str) -> dict:
        """Criar nova nota e salvar no repositório"""
        # Processar wikilinks do conteúdo para criar stubs
        wikilink_conns = await self._process_wikilinks(note_data.content, author_id, note_data.category)
        all_conns = list(set((note_data.connections or []) + wikilink_conns))

        note = {
            "_id": str(uuid.uuid4()),
            "title": note_data.title,
            "content": note_data.content,
            "category": note_data.category,
            "keywords": note_data.keywords,
            "author": author_id,
            "corporation_id": None,
            "connections": all_conns,
            "tasks": [t.dict() for t in note_data.tasks] if note_data.tasks else [],
            "attachments": [a.dict() for a in note_data.attachments] if note_data.attachments else [],
            "history": [],
            "location": "Local",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_modified_by": author_id,
            "last_modified_at": datetime.utcnow(),
            "access_count": 0,
            "last_accessed_at": datetime.utcnow(),
        }

        # Adicionar histórico de criação
        note = self.add_to_history(note, "created", "Nota criada", author_id)

        # Tratar conexões reversas (garantir que notas referenciadas conectem de volta)
        created_note = await self.note_repo.create(note)

        # Atualizar conexões reversas no banco
        for connected_id in all_conns:
            connected_note = await self.note_repo.get_by_id(connected_id)
            if connected_note:
                conns = connected_note.get("connections", [])
                if note["_id"] not in conns:
                    conns.append(note["_id"])
                    await self.note_repo.update(connected_id, {"connections": conns})

        return created_note

    async def list_notes(self, author_id: str) -> List[dict]:
        """Listar notas do autor"""
        return await self.note_repo.list_by_author(author_id)

    async def get_note(self, note_id: str, user_id: str) -> Optional[dict]:
        """Buscar nota e atualizar estatísticas de acesso"""
        note = await self.note_repo.get_by_id(note_id)
        if not note:
            return None

        # Verificar permissão (autor ou corporativo)
        if note["author"] != user_id and note.get("corporation_id") is None:
            return None

        # Atualizar access count e last_accessed_at
        access_count = note.get("access_count", 0) + 1
        last_accessed = datetime.utcnow()
        await self.note_repo.update(note_id, {
            "access_count": access_count,
            "last_accessed_at": last_accessed
        })

        note["access_count"] = access_count
        note["last_accessed_at"] = last_accessed
        return note

    async def update_note(self, note_id: str, note_data: NoteUpdate, user_id: str) -> Optional[dict]:
        """Atualizar campos da nota e registrar histórico"""
        note = await self.note_repo.get_by_id(note_id)
        if not note:
            return None

        # Verificar permissão
        if note["author"] != user_id:
            return None

        # Preparar dados para atualização
        update_data = note_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        update_data["last_modified_by"] = user_id
        update_data["last_modified_at"] = datetime.utcnow()

        # Adicionar ao histórico
        summary_parts = []
        if note_data.title and note_data.title != note.get("title"):
            summary_parts.append(f"título alterado para '{note_data.title}'")
        if note_data.category and note_data.category != note.get("category"):
            summary_parts.append(f"categoria alterada para '{note_data.category}'")
        
        summary = "Nota atualizada: " + ", ".join(summary_parts) if summary_parts else "Conteúdo ou parâmetros da nota editados"

        # Salvar histórico
        history_entry = self.create_history_entry("edited", summary, user_id)
        update_data["history"] = [history_entry] + note.get("history", [])

        # Processar conexões de wikilinks se o conteúdo ou conexões mudarem
        content_to_parse = note_data.content if note_data.content is not None else note.get("content", "")
        category_to_use = note_data.category if note_data.category is not None else note.get("category", "Ideas")
        wikilink_conns = await self._process_wikilinks(content_to_parse, user_id, category_to_use)

        passed_conns = note_data.connections if note_data.connections is not None else note.get("connections", [])
        all_conns = list(set(passed_conns + wikilink_conns))
        update_data["connections"] = all_conns

        # Se tarefas ou anexos forem fornecidos
        if note_data.tasks is not None:
            update_data["tasks"] = [t.dict() for t in note_data.tasks]
        if note_data.attachments is not None:
            update_data["attachments"] = [a.dict() for a in note_data.attachments]
            
        # Atualizar conexões bidirecionais
        new_conns = set(all_conns)
        old_conns = set(note.get("connections", []))
        
        # Adicionar conexões reversas para novas conexões
        for conn_id in (new_conns - old_conns):
            conn_note = await self.note_repo.get_by_id(conn_id)
            if conn_note:
                c_conns = conn_note.get("connections", [])
                if note_id not in c_conns:
                    c_conns.append(note_id)
                    await self.note_repo.update(conn_id, {"connections": c_conns})
        
        # Remover conexões reversas para conexões removidas
        for conn_id in (old_conns - new_conns):
            conn_note = await self.note_repo.get_by_id(conn_id)
            if conn_note:
                c_conns = conn_note.get("connections", [])
                if note_id in c_conns:
                    c_conns.remove(note_id)
                    await self.note_repo.update(conn_id, {"connections": c_conns})

        await self.note_repo.update(note_id, update_data)
        return await self.note_repo.get_by_id(note_id)

    async def delete_note(self, note_id: str, user_id: str) -> bool:
        """Remover nota e limpar referências nas conexões bidirecionais"""
        note = await self.note_repo.get_by_id(note_id)
        if not note or note["author"] != user_id:
            return False

        # Remover nota do banco
        success = await self.note_repo.delete(note_id)
        if not success:
            return False

        # Limpar conexões reversas nas notas que estavam conectadas a esta
        for conn_id in note.get("connections", []):
            conn_note = await self.note_repo.get_by_id(conn_id)
            if conn_note:
                c_conns = conn_note.get("connections", [])
                if note_id in c_conns:
                    c_conns.remove(note_id)
                    await self.note_repo.update(conn_id, {"connections": c_conns})

        return True
