from backend.repositories.base_repository import BaseRepository
from typing import Optional

class UserRepository(BaseRepository):
    """Repositório de dados para Usuários"""

    def __init__(self, db):
        super().__init__(db)
        self.collection_name = "users"

    async def get_by_id(self, user_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": user_id})

    async def get_by_email(self, email: str) -> Optional[dict]:
        return await self.collection.find_one({"email": email})

    async def create(self, user_data: dict) -> dict:
        await self.collection.insert_one(user_data)
        return user_data

    async def update(self, user_id: str, update_data: dict) -> bool:
        result = await self.collection.update_one({"_id": user_id}, {"$set": update_data})
        return result.matched_count > 0

    async def delete(self, user_id: str) -> bool:
        result = await self.collection.delete_one({"_id": user_id})
        return result.deleted_count > 0
