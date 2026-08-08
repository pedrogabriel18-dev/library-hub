# Arquitetura do Sistema — LibraryHub

O **LibraryHub** é uma plataforma moderna desenvolvida sob o modelo de **Monolito Modular Desacoplado**, separando claramente a camada de apresentação no cliente (SPA React) do servidor de aplicação e APIs (Express.js REST).

---

## 📐 Visão Geral da Arquitetura

```mermaid
graph TD
    Client["💻 Single Page Application (React 18 + Vite)"]
    ServiceLayer["⚡ Camada de Serviços (AuthService, BookService, etc.)"]
    ExpressApp["🚀 Servidor Express.js (Node.js API)"]
    AuthMiddleware["🛡️ Middleware de Autenticação & RBAC"]
    PrismaORM["🗄️ Prisma ORM"]
    SQLiteDB[("💾 Banco de Dados SQLite")]
    PDFStorage["📁 Storage de Arquivos (PDFs)"]

    Client --> ServiceLayer
    ServiceLayer -->|HTTP REST / JSON| ExpressApp
    ExpressApp --> AuthMiddleware
    AuthMiddleware --> Controllers["🎮 Controllers por Recurso"]
    Controllers --> PrismaORM
    Controllers --> PDFStorage
    PrismaORM --> SQLiteDB
```

---

## 🔐 Fluxo de Autenticação (JWT + LocalStorage)

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuário / Leitor
    participant SPA as Frontend (React SPA)
    participant AuthCtrl as AuthController (Backend)
    participant DB as Banco SQLite (Prisma)

    Usuario->>SPA: Preenche login e senha
    SPA->>AuthCtrl: POST /api/auth/login
    AuthCtrl->>DB: Busca usuário pelo login
    DB-->>AuthCtrl: Retorna dados e passwordHash
    AuthCtrl->>AuthCtrl: Valida hash via bcrypt.compare()
    AuthCtrl-->>SPA: Retorna token JWT + dados do usuário
    SPA->>SPA: Armazena token no localStorage
    SPA-->>Usuario: Redireciona para o Dashboard / Catálogo
```

---

## 📁 Organização de Pastas do Frontend

```
frontend/src/
├── app/            # Roteador, provedores globais e inicialização
├── assets/         # Imagens estáticas e recursos visuais
├── components/     # Sistema de Design (UI) e componentes compartilhados
│   ├── ui/         # Botões, Modais, Skeletons, Toasts, Inputs
│   ├── layout/     # Navbar, Sidebar, Footer, MainLayout
│   └── common/     # UserAvatar, BookCard, TCCCard
├── features/       # Módulos por Domínio/Funcionalidade
│   ├── authentication/
│   ├── books/
│   ├── tccs/
│   ├── reviews/
│   ├── users/
│   ├── moderation/
│   └── profile/
├── hooks/          # Custom hooks reutilizáveis (useAuth, useBooks, useToast)
├── services/       # Camada isolada de comunicação com a API REST
├── constants/      # Mapeamentos e constantes centralizadas
└── types/          # Interfaces e declarações TypeScript
```
