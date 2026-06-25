from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.config import settings
from typing import Optional, Union
import uuid
import logging
from datetime import datetime

logger = logging.getLogger("neuranote.database")

# In-memory Mock Database to run the application without MongoDB service installed
class MockCollection:
    def __init__(self, name: str):
        self.name = name
        self.data = {}

    async def find_one(self, query: dict) -> Optional[dict]:
        for item in self.data.values():
            match = True
            for k, v in query.items():
                # Simple dot notation resolution for nested structures e.g. "users.user_id"
                if "." in k:
                    parts = k.split(".")
                    # Simple user role check nested in array
                    if parts[0] == "users" and parts[1] == "user_id":
                        user_found = False
                        for u in item.get("users", []):
                            if u.get("user_id") == v:
                                user_found = True
                                break
                        if not user_found:
                            match = False
                            break
                    else:
                        match = False
                        break
                elif item.get(k) != v:
                    match = False
                    break
            if match:
                # Return a copy to avoid in-place mutations outside of repository updates
                return dict(item)
        return None

    def find(self, query: Optional[dict] = None):
        query = query or {}
        results = []
        for item in self.data.values():
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                results.append(dict(item))

        class MockCursor:
            async def to_list(self, length=None):
                return results
        return MockCursor()

    async def insert_one(self, document: dict):
        doc_copy = dict(document)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        self.data[doc_copy["_id"]] = doc_copy
        return doc_copy

    async def update_one(self, query: dict, update: dict):
        doc = await self.find_one(query)
        if not doc:
            class MockUpdateResult:
                matched_count = 0
                modified_count = 0
            return MockUpdateResult()

        target = self.data[doc["_id"]]

        if "$set" in update:
            for k, v in update["$set"].items():
                if "." in k:
                    parts = k.split(".")
                    if parts[0] == "users" and parts[1] == "$" and len(parts) == 3:
                        # e.g., "users.$.role"
                        user_id = query.get("users.user_id") or query.get("_id")
                        for u in target.get("users", []):
                            if u.get("user_id") == user_id or u.get("name") == user_id:
                                u[parts[2]] = v
                    else:
                        target[k] = v
                else:
                    target[k] = v

        if "$push" in update:
            for k, v in update["$push"].items():
                if k not in target:
                    target[k] = []
                target[k].append(v)

        if "$pull" in update:
            for k, v in update["$pull"].items():
                if k in target and isinstance(target[k], list):
                    if isinstance(v, dict):
                        target[k] = [
                            item for item in target[k]
                            if not all(item.get(pk) == pv for pk, pv in v.items())
                        ]
                    else:
                        target[k] = [item for item in target[k] if item != v]

        class MockUpdateResult:
            matched_count = 1
            modified_count = 1
        return MockUpdateResult()

    async def delete_one(self, query: dict):
        doc = await self.find_one(query)
        if doc and doc["_id"] in self.data:
            del self.data[doc["_id"]]
            class MockDeleteResult:
                deleted_count = 1
            return MockDeleteResult()
        class MockDeleteResult:
            deleted_count = 0
        return MockDeleteResult()

class MockDatabase:
    def __init__(self):
        self.collections = {}

    def __getitem__(self, name: str) -> MockCollection:
        if name not in self.collections:
            self.collections[name] = MockCollection(name)
        return self.collections[name]


class DatabaseManager:
    """Gerenciador de conexões com o Banco de Dados com fallback local em memória"""

    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.is_mock: bool = False

    async def connect(self):
        try:
            # Tentar conexão com MongoDB com timeout curto (2 segundos)
            self.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            # Ping para testar conexão ativa
            await self.client.admin.command("ping")
            self.db = self.client[settings.DATABASE_NAME]
            self.is_mock = False
            logger.info("[OK] Conectado ao MongoDB com sucesso.")
            print("[OK] Conectado ao MongoDB com sucesso.")
        except Exception as e:
            logger.warning(f"[WARN] MongoDB indisponivel ({e}). Usando MockDatabase local em memoria.")
            print("[WARN] MongoDB indisponivel. Usando MockDatabase local em memoria.")
            self.client = None
            self.db = MockDatabase()
            self.is_mock = True
        
        await self._seed_if_empty()

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("[INFO] Conexao com MongoDB encerrada.")
            print("[INFO] Conexao com MongoDB encerrada.")

    async def _seed_if_empty(self):
        # Verificar se o usuário admin padrão já existe
        default_user = await self.db["users"].find_one({"email": "ada.lovelace@neuranote.app"})
        if not default_user:
            from backend.services.auth_service import AuthService
            from backend.models import LoginType

            logger.info("Semeando dados iniciais no NeuraNote...")
            print("Semeando dados iniciais no NeuraNote...")
            
            # Hash da senha padrão 'ada'
            hashed = AuthService.hash_password("ada")
            user_id = "user-ada-lovelace"
            
            # Criar usuário Ada Lovelace
            user_doc = {
                "_id": user_id,
                "email": "ada.lovelace@neuranote.app",
                "name": "Ada Lovelace",
                "nickname": "Ada",
                "bio": "Primeira programadora da história.",
                "hashed_password": hashed,
                "login_type": LoginType.PERSONAL,
                "corporation_id": None,
                "role": None,
                "avatar": None,
                "preferences": {},
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            await self.db["users"].insert_one(user_doc)

            # Semeando notas iniciais
            notes = [
                {
                    "_id": "n1",
                    "title": "Redes Neurais — Fundamentos",
                    "content": "Uma rede neural é um sistema em camadas de conexões ponderadas inspirado em neurônios biológicos. Blocos fundamentais: camada de entrada, camadas ocultas, ativações (ReLU, GELU) e uma função de perda otimizada via retropropagação (backpropagation).\n\nO treinamento alterna passadas para frente (predições) e passadas para trás (atualizações de gradiente). A escolha do otimizador (SGD, Adam) e a taxa de aprendizado afetam dramaticamente a convergência.",
                    "category": "Aulas",
                    "keywords": ["deep-learning", "backprop", "ReLU", "optimization"],
                    "author": user_id,
                    "corporation_id": None,
                    "connections": ["n2", "n4", "n6"],
                    "tasks": [
                        {"id": "t1", "description": "Deduzir retropropagação em um MLP de 2 camadas", "completed": True, "priority": "high", "created_at": datetime.utcnow()},
                        {"id": "t2", "description": "Implementar otimizador Adam do zero", "completed": False, "priority": "medium", "created_at": datetime.utcnow()},
                        {"id": "t3", "description": "Ler capítulo 6 do livro de Deep Learning de Goodfellow", "completed": False, "priority": "low", "created_at": datetime.utcnow()},
                    ],
                    "attachments": [
                        {"id": "a1", "name": "aula-03.pdf", "file_type": "pdf", "size": 2516582, "url": "/api/v1/files/download/a1", "uploaded_by": user_id, "created_at": datetime.utcnow()},
                        {"id": "a2", "name": "diagrama-backprop.png", "file_type": "image", "size": 626688, "url": "/api/v1/files/download/a2", "uploaded_by": user_id, "created_at": datetime.utcnow()},
                    ],
                    "history": [
                        {"id": "h1", "timestamp": datetime.utcnow(), "action": "edited", "summary": "Seção sobre otimizadores adicionada", "modified_by": user_id},
                        {"id": "h2", "timestamp": datetime.utcnow(), "action": "linked", "summary": "Conectado à nota 'Mergulho em Transformers'", "modified_by": user_id},
                        {"id": "h3", "timestamp": datetime.utcnow(), "action": "created", "summary": "Nota criada", "modified_by": user_id},
                    ],
                    "location": "Biblioteca — 3º Andar",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "last_modified_by": user_id,
                    "last_modified_at": datetime.utcnow(),
                    "access_count": 0,
                    "last_accessed_at": datetime.utcnow(),
                },
                {
                    "_id": "n2",
                    "title": "Mergulho em Transformers",
                    "content": "A auto-atenção (self-attention) calcula a relevância entre pares de tokens. A atenção multi-cabeça (multi-head attention) permite que o modelo atenda a diferentes subespaços em paralelo. As codificações posicionais injetam informações sobre a ordem.\n\nO artigo original 'Attention is All You Need' substituiu a recorrência por atenção, permitindo a paralelização em massa.",
                    "category": "Pesquisa",
                    "keywords": ["attention", "transformers", "NLP"],
                    "author": user_id,
                    "corporation_id": None,
                    "connections": ["n1", "n6"],
                    "tasks": [
                        {"id": "t4", "description": "Esboçar a matemática da atenção no quadro", "completed": True, "priority": "medium", "created_at": datetime.utcnow()},
                        {"id": "t5", "description": "Comparar embeddings RoPE vs sinusoidais", "completed": False, "priority": "high", "created_at": datetime.utcnow()},
                    ],
                    "attachments": [
                        {"id": "a3", "name": "artigo-attention.pdf", "file_type": "pdf", "size": 1153433, "url": "/api/v1/files/download/a3", "uploaded_by": user_id, "created_at": datetime.utcnow()}
                    ],
                    "history": [
                        {"id": "h4", "timestamp": datetime.utcnow(), "action": "edited", "summary": "Referência ao RoPE adicionada", "modified_by": user_id},
                        {"id": "h5", "timestamp": datetime.utcnow(), "action": "created", "summary": "Nota criada", "modified_by": user_id},
                    ],
                    "location": "Home Office",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "last_modified_by": user_id,
                    "last_modified_at": datetime.utcnow(),
                    "access_count": 0,
                    "last_accessed_at": datetime.utcnow(),
                },
                {
                    "_id": "n3",
                    "title": "Cronograma de Lançamentos Q2",
                    "content": "Tema central: entregar a visualização do grafo conectado para todos os usuários. Três marcos — alfa (interno), beta (lista de espera), GA (lançamento geral). Coordenar com design sobre a iconografia e com infra sobre performance de layout do grafo.",
                    "category": "Projetos",
                    "keywords": ["roadmap", "planning", "product"],
                    "author": user_id,
                    "corporation_id": None,
                    "connections": ["n5"],
                    "tasks": [
                        {"id": "t6", "description": "Finalizar escopo do alfa com o time de design", "completed": False, "priority": "high", "created_at": datetime.utcnow()},
                        {"id": "t7", "description": "Esboçar email da lista de espera", "completed": False, "priority": "medium", "created_at": datetime.utcnow()},
                        {"id": "t8", "description": "Preparar painel de KPIs", "completed": True, "priority": "low", "created_at": datetime.utcnow()},
                    ],
                    "attachments": [
                        {"id": "a4", "name": "roadmap-v3.doc", "file_type": "doc", "size": 90112, "url": "/api/v1/files/download/a4", "uploaded_by": user_id, "created_at": datetime.utcnow()}
                    ],
                    "history": [
                        {"id": "h6", "timestamp": datetime.utcnow(), "action": "edited", "summary": "Cronograma atualizado", "modified_by": user_id},
                        {"id": "h7", "timestamp": datetime.utcnow(), "action": "created", "summary": "Nota criada", "modified_by": user_id},
                    ],
                    "location": "Sede — Sala de Reuniões B",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "last_modified_by": user_id,
                    "last_modified_at": datetime.utcnow(),
                    "access_count": 0,
                    "last_accessed_at": datetime.utcnow(),
                },
                {
                    "_id": "n4",
                    "title": "Experimentos de Rotina Matinal",
                    "content": "Testando um experimento de 5 semanas: caminhada de 20 minutos, escrita reflexiva (journaling), e depois um bloco de trabalho focado. Rastreando energia e foco diariamente em uma escala de 1 a 5.",
                    "category": "Trabalhos",
                    "keywords": ["habits", "routine", "wellness"],
                    "author": user_id,
                    "corporation_id": None,
                    "connections": ["n1"],
                    "tasks": [
                        {"id": "t9", "description": "Registrar classificações da semana 2", "completed": True, "priority": "low", "created_at": datetime.utcnow()},
                        {"id": "t10", "description": "Testar variante com banho frio", "completed": False, "priority": "low", "created_at": datetime.utcnow()},
                    ],
                    "attachments": [],
                    "history": [
                        {"id": "h8", "timestamp": datetime.utcnow(), "action": "edited", "summary": "Notas da semana 2 adicionadas", "modified_by": user_id},
                        {"id": "h9", "timestamp": datetime.utcnow(), "action": "created", "summary": "Nota criada", "modified_by": user_id},
                    ],
                    "location": "Apartamento",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "last_modified_by": user_id,
                    "last_modified_at": datetime.utcnow(),
                    "access_count": 0,
                    "last_accessed_at": datetime.utcnow(),
                },
                {
                    "_id": "n5",
                    "title": "Síntese de Pesquisa com Usuários",
                    "content": "12 entrevistas revelaram três temas: (1) as pessoas perdem o contexto entre notas, (2) as tarefas se perdem, (3) apenas a busca não é suficiente — elas desejam relações espaciais e visuais.",
                    "category": "Projetos",
                    "keywords": ["research", "interviews", "themes"],
                    "author": user_id,
                    "corporation_id": None,
                    "connections": ["n3", "n6"],
                    "tasks": [
                        {"id": "t11", "description": "Agrupar citações no Miro", "completed": True, "priority": "medium", "created_at": datetime.utcnow()},
                        {"id": "t12", "description": "Compartilhar resultados com o time", "completed": False, "priority": "high", "created_at": datetime.utcnow()},
                    ],
                    "attachments": [
                        {"id": "a5", "name": "audio-entrevistas.audio", "file_type": "audio", "size": 14680064, "url": "/api/v1/files/download/a5", "uploaded_by": user_id, "created_at": datetime.utcnow()},
                        {"id": "a6", "name": "mapa-afinidade.png", "file_type": "image", "size": 1887436, "url": "/api/v1/files/download/a6", "uploaded_by": user_id, "created_at": datetime.utcnow()},
                    ],
                    "history": [
                        {"id": "h10", "timestamp": datetime.utcnow(), "action": "edited", "summary": "Tema 3 adicionado", "modified_by": user_id},
                        {"id": "h11", "timestamp": datetime.utcnow(), "action": "created", "summary": "Nota criada", "modified_by": user_id},
                    ],
                    "location": "Cafeteria — Mission St",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "last_modified_by": user_id,
                    "last_modified_at": datetime.utcnow(),
                    "access_count": 0,
                    "last_accessed_at": datetime.utcnow(),
                },
                {
                    "_id": "n6",
                    "title": "Grafos de Conhecimento vs Bancos Vetoriais",
                    "content": "Grafos codificam relacionamentos explícitos; bancos vetoriais codificam similaridade semântica latente. Os melhores sistemas combinam ambos: grafos para estrutura rígida, vetores para recuperação difusa.",
                    "category": "Ideias",
                    "keywords": ["graphs", "embeddings", "retrieval"],
                    "author": user_id,
                    "corporation_id": None,
                    "connections": ["n1", "n2", "n5"],
                    "tasks": [
                        {"id": "t13", "description": "Prototipar recuperação híbrida", "completed": False, "priority": "high", "created_at": datetime.utcnow()},
                    ],
                    "attachments": [],
                    "history": [
                        {"id": "h12", "timestamp": datetime.utcnow(), "action": "created", "summary": "Nota criada", "modified_by": user_id},
                    ],
                    "location": "Banco de Parque",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "last_modified_by": user_id,
                    "last_modified_at": datetime.utcnow(),
                    "access_count": 0,
                    "last_accessed_at": datetime.utcnow(),
                }
            ]
            for note in notes:
                await self.db["notes"].insert_one(note)
            logger.info("Semeamento concluído.")
            print("Semeamento concluído.")

db_manager = DatabaseManager()

async def connect_to_mongo():
    await db_manager.connect()

async def close_mongo_connection():
    await db_manager.close()

def get_database():
    return db_manager.db
