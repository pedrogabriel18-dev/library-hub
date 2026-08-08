# 🚀 Guia de Boas-Vindas ao Desenvolvedor — LibraryHub

Bem-vindo ao **LibraryHub**! Este guia foi criado para que você consiga entender a arquitetura do sistema, configurar o ambiente local e começar a contribuir ou realizar manutenções em menos de **10 minutos**.

---

## ⚡ Início Rápido em 3 Passos

### 1. Requisitos do Sistema
- **Node.js**: versão `20.x` ou superior
- **npm**: versão `10.x` ou superior

### 2. Configuração do Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run dev
```
> O servidor backend iniciará em `http://localhost:3333` com o banco SQLite `dev.db` pronto.

### 3. Configuração do Frontend
```bash
cd ../frontend
npm install
npm run dev
```
> A aplicação React iniciará em `http://localhost:5173`.

---

## 🏛️ Visão Geral da Arquitetura

O LibraryHub adota o modelo de **Monolito Modular Desacoplado**:

```
libraryhub/
├── frontend/             # Single Page Application (React 18 + Vite + TypeScript)
│   └── src/
│       ├── components/   # Design System e UI Reutilizável
│       ├── features/     # Módulos por Domínio (books, tccs, profile, moderation)
│       ├── hooks/        # Hooks globais (useAuth, useToast, useDebounce)
│       ├── services/     # Camada de comunicação com a API REST
│       └── styles/       # Tokens e estilos CSS Globais
├── backend/              # Servidor Node.js + Express REST API
│   └── src/
│       ├── controllers/  # Controladores de Requisição HTTP
│       ├── routes/       # Sub-roteadores REST por recurso
│       ├── middlewares/  # Autenticação JWT, RBAC e Rate Limiter
│       └── utils/        # Winston Logger, Prisma Client e Cache
├── docs/                 # Documentação Técnica e Registros de Arquitetura (ADRs)
└── .github/              # Workflows CI, Templates de Issues e PRs
```

---

## 🛠️ Principais Scripts Disponíveis

### No Frontend (`frontend/`)
- `npm run dev`: Inicia o servidor de desenvolvimento Vite.
- `npm run build`: Compila e minifica o projeto para produção (`dist/`).
- `npm run lint`: Executa verificação estática do TypeScript (`tsc --noEmit`).

### No Backend (`backend/`)
- `npm run dev`: Inicia o backend Express com recarregamento automático (`tsx`).
- `npm test`: Executa a suíte completa de 52 testes de integração (`Vitest`).
- `npm run build`: Compila o código TypeScript para JavaScript (`dist/`).

---

## 📋 Como Adicionar um Novo Módulo ou Funcionalidade

1. **Defina a Rota no Backend**:
   - Crie o sub-roteador em `backend/src/routes/meumodulo.routes.ts`.
   - Registre a rota em `backend/src/routes/index.ts`.
2. **Crie o Serviço no Frontend**:
   - Crie a classe de serviço em `frontend/src/services/MeuModuloService.ts`.
3. **Crie o Componente / Feature**:
   - Adicione os componentes em `frontend/src/features/meumodulo/`.
4. **Adicione a Rota no Roteador**:
   - Registre a nova rota em `frontend/src/router/index.tsx` usando `React.lazy()`.

---

## 📚 Documentação Técnica Aprofundada

Para detalhes sobre decisões de arquitetura e padrões:
- 📐 [Arquitetura Geral](./docs/architecture.md)
- 🎨 [Frontend & Design System](./docs/frontend.md)
- 🚀 [Backend & APIs](./docs/backend.md)
- 🔒 [Matriz de Permissões RBAC](./docs/authorization.md)
- 📑 [Registros de Decisões de Arquitetura (ADRs)](./docs/adr/)
