# Documentação Técnica do Frontend — LibraryHub

O frontend do **LibraryHub** foi desenvolvido em **React 18** com **TypeScript** e **Vite**, seguindo uma arquitetura modular por domínios.

---

## 🏗️ Estrutura de Diretórios

```
frontend/src/
├── app/            # Roteador e Provedores globais
├── components/     # Componentes compartilhados da UI (Modal, Toast, Skeletons)
├── constants/      # Mapeamento de papéis, avatares e banners
├── contexts/       # Contextos React (AuthContext, ThemeContext, ToastContext)
├── features/       # Módulos por Domínio de Negócio
│   ├── books/      # Cards, leitor de PDF e catálogo
│   ├── tccs/       # Visualização e lista de trabalhos
│   ├── profile/    # Edição de perfil, avatares e banners
│   ├── moderation/ # Aprovação/Rejeição de resenhas
│   └── users/      # Gerenciamento de usuários
├── hooks/          # Hooks customizados (useAuth, useToast, useDebounce, useNetworkStatus)
├── pages/          # Páginas renderizadas no roteador
├── services/       # Camada de comunicação com a API REST
├── styles/         # Globais CSS e Design Tokens
└── types/          # Declarações TypeScript
```

---

## ⚡ Serviços REST (`src/services/`)

Toda requisição HTTP é abstraída em classes estáticas sem dependência direta dos componentes React:
- `AuthService`: Login, logout, perfil e alteração de senha.
- `BookService`: Listagem, detalhes, favoritar e download de livros.
- `TccService`: Consulta e visualização de trabalhos acadêmicos.
- `ReviewService`: Submissão e moderação de avaliações.
- `UserService`: Cadastro e controle administrativo de usuários.
