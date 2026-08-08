# Especificação da API REST — LibraryHub

Todas as requisições para a API do LibraryHub utilizam o prefixo `/api` e retornam respostas padronizadas em formato JSON.

---

## 🔒 Formato de Resposta Padronizado

```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso."
}
```

---

## 🔑 Autenticação

### `POST /api/auth/login`
Autentica um usuário e retorna o token Bearer JWT.

**Payload de Requisição**:
```json
{
  "login": "aluno.teste",
  "password": "Senha@123",
  "role": "STUDENT"
}
```

---

## 📖 Livros e Catálogo

### `GET /api/books`
Lista os livros catalogados com suporte a paginação e filtros.

**Parâmetros de Query**:
- `page` (number, opcional): Número da página (padrão: 1).
- `limit` (number, opcional): Itens por página (padrão: 12).
- `search` (string, opcional): Busca por título ou sinopse.
- `categoryId` (string, opcional): ID da categoria.
- `sort` (string, opcional): `trending` para livros em alta.

---

## 🎓 Trabalhos de Conclusão de Curso (TCCs)

### `GET /api/tccs`
Lista os TCCs acadêmicos aprovados.

---

## 💬 Resenhas e Avaliações

### `POST /api/books/:bookId/reviews`
Submete uma resenha para um livro (requer função `STUDENT`). A resenha permanece pendente até a moderação.

### `PATCH /api/admin/reviews/:reviewId/moderate`
Aprova ou rejeita uma resenha pendente (requer permissão `LIBRARIAN`, `DEVELOPER` ou `ADVISOR`).
