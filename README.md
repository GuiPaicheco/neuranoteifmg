# NeuraNote 🧠

NeuraNote é um aplicativo moderno de anotações baseado no conceito de "segundo cérebro" com foco em **Mobile-First** e relações entre notas. Com ele, você pode criar conexões bidirecionais entre seus conhecimentos, gerenciar listas de tarefas contextualizadas nas anotações, anexar arquivos e visualizar toda a sua base de conhecimento através de um grafo interativo.

---

## 🌟 Recursos Principais
- **Visualização de Grafo**: Mapeie conexões semânticas entre notas e visualize-as dinamicamente.
- **Estruturação por Categoria & Hashtags**: Organize de forma eficiente.
- **Tarefas Integradas**: Tarefas que vivem diretamente no contexto em que o pensamento acontece.
- **Anexação de Arquivos**: Suporte para PDFs, Imagens, Áudios e Documentos.
- **Mobile-First e Responsivo**: Layout de painel único e transições nativas e adaptadas para telas móveis, além de visualizações expandidas em telas grandes.
- **Internacionalização (i18n)**: Suporte integrado para múltiplos idiomas (Português, Inglês, Espanhol, etc.).

---

## ⚙️ Detalhes de Funcionamento (SaaS & Wikilinks)

O NeuraNote implementa mecânicas sofisticadas de estruturação de conhecimento e gerenciamento multi-inquilino (SaaS):

### 1. Sistema de Wikilinks e Conexões Bidirecionais
* **Linkagem Semântica**: Ao escrever em qualquer nota usando a sintaxe clássica de Wiki `[[Título da Nota]]`, o backend do NeuraNote processa automaticamente o conteúdo por meio de expressões regulares.
* **Criação Automática de Stubs**: Se a nota referenciada ainda não existir, o backend criará imediatamente uma nota vazia com a etiqueta "stub" e o título indicado, servindo de base temporária para desenvolvimento posterior.
* **Grafo Bidirecional**: As conexões são salvas no banco de dados nas duas direções. Ou seja, se a nota A conecta à nota B, a nota B exibe um link reverso (backlink) para a nota A, aparecendo conectadas no mapa do grafo 2D de forma dinâmica.

### 2. Arquitetura Multi-Tenant (SaaS)
O NeuraNote opera em dois modos distintos de inquilinato:
* **Espaço Pessoal (Personal Workspace)**: Ideal para uso individual. Cada nota pertence única e exclusivamente ao autor logado. É ideal para uso casual, gratuito e confidencial.
* **Espaço Corporativo (Corporate Workspace)**: Projetado para equipes de desenvolvimento, pesquisa e empresas. Ao registrar uma organização (Corporate Workspace):
  - Um usuário administrador cria a corporação e define seu nome exclusivo.
  - O administrador pode gerenciar usuários, adicionar novos membros e configurar permissões.
  - As notas compartilhadas dentro do espaço corporativo contam com herança de permissões por papéis (Role-Based Access Control - RBAC: Admin, Editor, Viewer).

---

## 🏗️ Arquitetura do Sistema
O NeuraNote é estruturado sob uma arquitetura de duas camadas (Client-Server):

### 1. Backend (Python POO)
Escrito em **Python** utilizando **FastAPI** e estruturado segundo os princípios da **Programação Orientada a Objetos (POO)**:
- **Repository Pattern**: Abstrai as operações de banco de dados do MongoDB em classes repositório dedicadas (`UserRepository`, `NoteRepository`, `CorporationRepository`).
- **Service Layer**: Centraliza a lógica de negócios e regras da aplicação (`UserService`, `NoteService`, `CorporationService`, `FileService`).
- **Dependency Injection**: Utiliza o container nativo do FastAPI para injetar instâncias de serviços e repositórios nas rotas.
- **Resilient Fallback**: Se o MongoDB não estiver rodando localmente, o backend automaticamente ativa uma implementação de `MockDatabase` transparente em memória (pré-populada com dados de teste) para que a aplicação funcione imediatamente sem configurações adicionais.

### 2. Frontend (React + TypeScript)
Desenvolvido em **React** utilizando **Vite**, **TypeScript**, **Tailwind CSS** e **Shadcn UI**:
- **Store Pattern**: Estado global sincronizado de forma assíncrona com os endpoints do backend.
- **Autenticação com JWT**: Login persistente via `localStorage` (Pessoal ou Corporativo).
- **Vite Proxy**: Redireciona chamadas `/api` locais de forma transparente para evitar problemas de CORS no desenvolvimento.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- **Python 3.10+** (Launcher `py` no Windows)
- **Node.js 18+** e gerenciador de pacotes **npm** ou **bun**

---

### Passo 1: Inicializar e Executar o Backend

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. Crie o ambiente virtual e ative-o:
   ```bash
   py -m venv venv
   # No Windows (PowerShell/CMD):
   venv\Scripts\activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure o arquivo de ambiente:
   Copie `.env.example` para `.env` e configure conforme necessário (por padrão, tenta se conectar a `mongodb://localhost:27017`):
   ```bash
   copy .env.example .env
   ```

5. Inicie o servidor do backend:
   ```bash
   python main.py
   ```
   *O backend subirá em `http://localhost:8000`. A documentação Swagger estará disponível em `http://localhost:8000/docs`.*

---

### Passo 2: Inicializar e Executar o Frontend

1. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   *O frontend subirá em `http://localhost:8080`.*

---

## 🧪 Verificação de Testes

Para executar os testes automatizados do frontend (Vitest):
```bash
npm run test
```

Para verificar o health-check do backend:
```bash
curl http://localhost:8000/health
```

---

## 🌐 Hospedagem Online (Deploy)

O NeuraNote está preparado para ser hospedado gratuitamente na nuvem. Siga o guia abaixo para implantar o frontend e o backend.

### 1. Frontend (Vercel)
A Vercel é a plataforma ideal e gratuita para hospedar o frontend SPA em React.
1. **Conecte seu Repositório**: Crie uma conta na Vercel e importe seu repositório Git do NeuraNote.
2. **Configuração de Build**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Variáveis de Ambiente**:
   - Adicione `VITE_API_URL` com a URL do seu backend hospedado (ex: `https://neuranote-backend.onrender.com`).
4. **Roteamento SPA**:
   - O arquivo `vercel.json` na raiz já está configurado para direcionar todas as rotas do frontend (`/auth`, `/notes`, etc.) para o `index.html`, evitando erros de 404 em recarregamentos de página.

### 2. Backend (Render / Railway / Fly.io)
O backend em FastAPI pode ser hospedado em plataformas de nuvem de contêineres gratuitas ou de baixo custo como Render ou Railway.
1. **Conecte seu Repositório**: Crie um serviço web ("Web Service") e aponte para o repositório do NeuraNote.
2. **Configuração de Execução**:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` (ou defina o diretório de trabalho na pasta `backend` e use `uvicorn main:app --host 0.0.0.0 --port $PORT`).
3. **Variáveis de Ambiente**:
   - `MONGODB_URL`: Sua string de conexão do MongoDB (ex: cluster gratuito no MongoDB Atlas). Caso esta variável esteja ausente ou inacessível, o app ativará o fallback do `MockDatabase` em memória.
   - `SECRET_KEY`: Uma frase secreta segura para codificação dos tokens JWT.
   - `DEBUG`: `False`
   - `ALLOWED_ORIGINS`: `["*"]` (ou sua URL específica da Vercel).
   - `LLAMA_MODEL` e `OLLAMA_BASE_URL` (se for usar IA integrada).

---

## 🔑 Credenciais Padrão para Demonstração
Se o banco de dados iniciar vazio (ou em memória), os seguintes dados de seed estarão disponíveis para testes imediatos no modo **Pessoal**:
- **Email**: `ada.lovelace@neuranote.app`
- **Senha**: `ada`
