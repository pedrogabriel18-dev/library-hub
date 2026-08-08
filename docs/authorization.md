# Matriz de Autorização e Permissões (RBAC) — LibraryHub

O sistema utiliza **Role-Based Access Control (RBAC)** com 4 papéis definidos:

| Funcionalidade / Recurso | Student (Aluno) | Librarian (Bibliotecária) | Advisor (Orientador) | Developer (Admin) |
| ----------------------- | :-------------: | :-----------------------: | :------------------: | :---------------: |
| Consultar Catálogo      | ✔               | ✔                         | ✔                    | ✔                 |
| Ler PDFs de Livros/TCCs | ✔               | ✔                         | ✔                    | ✔                 |
| Favoritar Obras         | ✔               | ✔                         | ✔                    | ✔                 |
| Enviar Resenha          | ✔               | ❌                        | ❌                   | ❌                |
| Moderar Resenhas        | ❌              | ✔                         | ✔                    | ✔                 |
| Cadastrar/Editar Livros | ❌              | ✔                         | ❌                   | ✔                 |
| Cadastrar/Editar TCCs   | ❌              | ✔                         | ✔                    | ✔                 |
| Gerenciar Usuários      | ❌              | ❌                        | ❌                   | ✔                 |
| Ver Analytics por Turma | ❌              | ✔                         | ✔                    | ✔                 |

---

## 🔒 Aplicação dos Middlewares no Backend

```typescript
// Exemplo: Endpoint restrito a Bibliotecários e Desenvolvedores
router.post(
  '/admin/books',
  requireAuth,
  requireRole(['LIBRARIAN', 'DEVELOPER']),
  BookController.createBook
)
```
