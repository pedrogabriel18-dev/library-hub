# ADR 0003: Autenticação via JWT e Autorização baseada em Papéis (RBAC)

- **Status**: Aprovado
- **Data**: 2026-08-04

## Contexto

A plataforma atende diferentes públicos (Estudantes, Bibliotecários, Orientadores e Desenvolvedores/Administradores) com permissões estritas para evitar escalada de privilégios.

## Decisão

Implementar **JSON Web Tokens (JWT)** assinados digitalmente e middleware de autorização por papéis (**RBAC**):
- Tokens de acesso enviados via cabeçalho `Authorization: Bearer <token>`.
- Senhas salvas com algoritmo hash **bcrypt** (salt factor 10).
- Middleware `requireRole(['LIBRARIAN', 'DEVELOPER'])` no backend para proteção de rotas administrativas.

## Consequências

- Autenticação stateless de alta performance.
- Proteção garantida contra escalada de privilégios nos endpoints da API REST.
