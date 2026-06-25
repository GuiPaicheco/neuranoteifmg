# Setup Local - Backend NeuraNote

## Pré-requisitos

1. **Python 3.10+** - [Download](https://www.python.org/downloads/)
2. **MongoDB** - [Download Community](https://www.mongodb.com/try/download/community)
3. **Git** - [Download](https://git-scm.com/download/win)

## Instalação

### 1. Instalar Dependências Python

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configurar MongoDB

```bash
# Inicia MongoDB (Windows - se instalado)
mongod

# Ou usar Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Criar arquivo .env

```bash
cp .env.example .env
# Editar .env com suas configurações
```

### 4. Rodar o servidor

```bash
cd backend
python main.py

# Ou com uvicorn diretamente
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Servidor será acessível em `http://localhost:8000`

### 5. Testar API

```bash
# Health check
curl http://localhost:8000/health

# Documentação interativa (Swagger)
http://localhost:8000/docs

# ReDoc
http://localhost:8000/redoc
```

## Endpoints Disponíveis (MVP)

### Autenticação
- `POST /api/v1/auth/register/personal` - Registrar usuário
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Dados do usuário atual

### Notas
- `POST /api/v1/notes` - Criar nota
- `GET /api/v1/notes` - Listar notas
- `GET /api/v1/notes/{id}` - Obter nota
- `PUT /api/v1/notes/{id}` - Atualizar nota
- `DELETE /api/v1/notes/{id}` - Deletar nota

### Usuários
- `GET /api/v1/users/me` - Dados do usuário
- `PUT /api/v1/users/me` - Atualizar usuário

## Troubleshooting

**"ModuleNotFoundError: No module named 'motor'"**
```bash
pip install motor
```

**"Conexão recusada ao MongoDB"**
- Verificar se MongoDB está rodando: `mongod`
- Verificar MONGODB_URL em .env

**Port 8000 já em uso**
```bash
uvicorn main:app --port 8001
```

## Próximos Passos

1. Instalar e rodar o servidor localmente
2. Testar endpoints com Postman/Insomnia
3. Implementar frontend com integração da API
