from backend.repositories.user_repository import UserRepository
from datetime import datetime
from typing import Optional

class UserService:
    """Serviço de negócio para Usuários"""

    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def get_profile(self, user_id: str) -> Optional[dict]:
        return await self.user_repo.get_by_id(user_id)

    async def update_profile(self, user_id: str, nickname: Optional[str], bio: Optional[str], preferences: Optional[dict]) -> Optional[dict]:
        update_dict = {}
        if nickname is not None:
            update_dict["nickname"] = nickname
        if bio is not None:
            update_dict["bio"] = bio
        if preferences is not None:
            update_dict["preferences"] = preferences
        
        update_dict["updated_at"] = datetime.utcnow()
        success = await self.user_repo.update(user_id, update_dict)
        if not success:
            return None
        return await self.user_repo.get_by_id(user_id)

    async def update_avatar(self, user_id: str, avatar_url: str) -> str:
        update_dict = {
            "avatar": avatar_url,
            "updated_at": datetime.utcnow()
        }
        await self.user_repo.update(user_id, update_dict)
        return avatar_url
