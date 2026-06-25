from backend.repositories.corporation_repository import CorporationRepository
from backend.repositories.user_repository import UserRepository
from backend.models.corporation import CorporationCreate
from backend.services.auth_service import AuthService
from datetime import datetime
import uuid
from typing import Optional

class CorporationService:
    """Serviço de negócio para Corporações"""

    def __init__(self, corp_repo: CorporationRepository, user_repo: UserRepository):
        self.corp_repo = corp_repo
        self.user_repo = user_repo

    async def get_corporation(self, corp_id: str) -> Optional[dict]:
        return await self.corp_repo.get_by_id(corp_id)

    async def create_corporation(self, corp_data: CorporationCreate) -> dict:
        admin_id = str(uuid.uuid4())
        hashed_password = AuthService.hash_password(corp_data.admin_password)
        
        # Criar admin
        admin_user = {
            "_id": admin_id,
            "email": corp_data.admin_email,
            "name": corp_data.admin_name,
            "nickname": None,
            "bio": None,
            "hashed_password": hashed_password,
            "login_type": "corporate",
            "corporation_id": None,  # Será atualizado após criar corporação
            "role": "admin",
            "avatar": None,
            "preferences": {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        corporation_id = str(uuid.uuid4())

        default_roles = [
            {"id": str(uuid.uuid4()), "name": "Admin", "permissions": ["*"]},
            {"id": str(uuid.uuid4()), "name": "Manager", "permissions": ["read_notes", "write_notes", "manage_users"]},
            {"id": str(uuid.uuid4()), "name": "Developer", "permissions": ["read_notes", "write_notes"]},
            {"id": str(uuid.uuid4()), "name": "Viewer", "permissions": ["read_notes"]},
        ]

        corporation = {
            "_id": corporation_id,
            "name": corp_data.name,
            "admin_id": admin_id,
            "roles": default_roles,
            "users": [
                {
                    "user_id": admin_id,
                    "name": corp_data.admin_name,
                    "nickname": None,
                    "role": "Admin",
                    "joined_at": datetime.utcnow(),
                }
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        admin_user["corporation_id"] = corporation_id

        await self.user_repo.create(admin_user)
        await self.corp_repo.create(corporation)

        return {"admin_id": admin_id, "corporation_id": corporation_id}

    async def create_corporate_user(self, corp_id: str, user_data: dict) -> dict:
        corporation = await self.corp_repo.get_by_id(corp_id)
        if not corporation:
            return {}

        new_user_id = str(uuid.uuid4())
        new_user = {
            "_id": new_user_id,
            "email": f"{user_data['name'].lower()}@{corporation['name'].lower()}.corp",
            "name": user_data["name"],
            "nickname": user_data.get("nickname"),
            "bio": None,
            "hashed_password": "",  # Usuários corporativos sem senha individual
            "login_type": "corporate",
            "corporation_id": corp_id,
            "role": user_data.get("role", "Viewer"),
            "avatar": None,
            "preferences": {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }

        await self.user_repo.create(new_user)

        corporate_user = {
            "user_id": new_user_id,
            "name": user_data["name"],
            "nickname": user_data.get("nickname"),
            "role": user_data.get("role", "Viewer"),
            "joined_at": datetime.utcnow(),
        }

        await self.corp_repo.add_user(corp_id, corporate_user)

        return {"id": new_user_id, "user": new_user}

    async def delete_corporate_user(self, corp_id: str, user_id: str) -> bool:
        await self.user_repo.delete(user_id)
        return await self.corp_repo.remove_user(corp_id, user_id)

    async def update_user_role(self, corp_id: str, user_id: str, role: str) -> bool:
        await self.user_repo.update(user_id, {"role": role, "updated_at": datetime.utcnow()})
        return await self.corp_repo.update_user_role(corp_id, user_id, role)
