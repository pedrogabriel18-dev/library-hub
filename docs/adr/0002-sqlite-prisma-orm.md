# ADR 0002: Uso do Banco SQLite com Prisma ORM

- **Status**: Aprovado
- **Data**: 2026-08-04

## Contexto

Para garantir facilidade de implantação em servidores escolares, contêineres Docker leves e execução local sem dependências de serviços de banco pesados (como PostgreSQL ou MySQL externos).

## Decisão

Adotar o **SQLite** integrado ao **Prisma ORM**:
- O banco roda de forma nativa em um arquivo local (`dev.db` em dev / volume em prod).
- O Prisma ORM gerencia schema, migrações, tipos TypeScript e consultas seguras prevenindo SQL Injection.

## Consequências

- Instalação e execução instantânea sem necessidade de instalar servidores de banco separados.
- Caso o projeto cresça para múltiplas réplicas, o Prisma permite migrar para PostgreSQL apenas alterando o provider no `schema.prisma`.
