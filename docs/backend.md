# Documentação Técnica do Backend — LibraryHub

O backend é uma API RESTful construída em **Node.js** com **Express.js**, **Prisma ORM** e **SQLite**.

---

## 🛡️ Middlewares de Segurança

- **Helmet**: Adiciona cabeçalhos HTTP seguros (CSP, HSTS, X-Frame-Options).
- **CORS**: Restringe chamadas de domínios não autorizados.
- **Express Rate Limit**: Proteção contra ataques de força bruta e negação de serviço (DoS).
- **AuthMiddleware**: Validação de JWT e verificação de conta ativa.
- **RoleMiddleware**: Controle de permissões por papel de usuário (RBAC).

---

## 📂 Sub-Roteadores (`src/routes/`)

O arquivo principal de rotas foi modularizado nos seguintes sub-roteadores:
- `auth.routes.ts`: Endpoints `/api/auth/*`
- `books.routes.ts`: Endpoints `/api/books/*`
- `tccs.routes.ts`: Endpoints `/api/tccs/*`
- `reviews.routes.ts`: Endpoints `/api/reviews/*`
- `users.routes.ts`: Endpoints `/api/users/*`
- `admin.routes.ts`: Endpoints `/api/admin/*`
