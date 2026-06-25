from backend.repositories.base_repository import BaseRepository
from typing import Optional

class CorporationRepository(BaseRepository):
    """Repositório de dados para Corporações"""

    def __init__(self, db):
        super().__init__(db)
        self.collection_name = "corporations"

    async def get_by_id(self, corp_id: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": corp_id})

    async def get_by_name(self, name: str) -> Optional[dict]:
        return await self.collection.find_one({"name": name})

    async def create(self, corp_data: dict) -> dict:
        await self.collection.insert_one(corp_data)
        return corp_data

    async def add_user(self, corp_id: str, user_in_corp: dict) -> bool:
        result = await self.collection.update_one(
            {"_id": corp_id},
            {"$push": {"users": user_in_corp}}
        )
        return result.modified_count > 0

    async def remove_user(self, corp_id: str, user_id: str) -> bool:
        result = await self.collection.update_one(
            {"_id": corp_id},
            {"$pull": {"users": {"user_id": user_id}}}
        )
        return result.modified_count > 0

    async def update_user_role(self, corp_id: str, user_id: str, role: str) -> bool:
        result = await self.collection.update_one(
            {"_id": corp_id, "users.user_id": user_id},
            {"$set": {"users.$.role": role}}
        )
        return result.modified_count > 0
