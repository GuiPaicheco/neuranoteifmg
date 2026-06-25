from backend.repositories.base_repository import BaseRepository
from typing import Optional, List

class NoteRepository(BaseRepository):
    """Repositório de dados para Notas"""

    def __init__(self, db):
        super().__init__(db)
        self.collection_name = "notes"

    async def get_by_id(self, note_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": note_id})

    async def list_by_author(self, author_id: str) -> List[dict]:
        return await self.collection.find({"author": author_id}).to_list(None)

    async def create(self, note_data: dict) -> dict:
        await self.collection.insert_one(note_data)
        return note_data

    async def update(self, note_id: str, update_data: dict) -> bool:
        result = await self.collection.update_one({"_id": note_id}, {"$set": update_data})
        return result.matched_count > 0

    async def delete(self, note_id: str) -> bool:
        result = await self.collection.delete_one({"_id": note_id})
        return result.deleted_count > 0
