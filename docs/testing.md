# Estratégia de Testes Automatizados — LibraryHub

O **LibraryHub** utiliza o runner **Vitest** com **Supertest** para testes de integração no backend e **React Testing Library** no frontend.

---

## 🧪 Estrutura da Suíte de Testes Backend (`backend/src/tests/`)

- `auth.test.ts`: Testes do fluxo de autenticação, login com credenciais válidas e inválidas, alteração de senha e geração de token JWT.
- `books.test.ts`: Listagem de livros, paginação, detalhes e funcionalidade de favoritos.
- `admin.test.ts`: Proteção de rotas administrativas (criação de livros, gestão de usuários e restrições RBAC).
- `security.test.ts`: Testes de tentativas de escalada de privilégios, SQL Injection, XSS e Rate Limiting.
- `eventFeed.test.ts`: Registro e consulta de logs de auditoria e atividades.

---

## 🚀 Como Executar os Testes

```bash
# Executar suíte de testes no backend
cd backend
npm test

# Executar verificações de tipos no frontend
cd ../frontend
npm run lint
```
