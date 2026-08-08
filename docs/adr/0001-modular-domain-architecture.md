# ADR 0001: Arquitetura Modular Baseada em Domínios no Frontend

- **Status**: Aprovado
- **Data**: 2026-08-04

## Contexto

A estrutura inicial do frontend possuía componentes com mais de 1.000 linhas de código misturando regra de negócio, chamadas HTTP diretas com `axios` e manipulação de estado. Isso prejudicava a testabilidade, manutenibilidade e a colaboração de múltiplos desenvolvedores.

## Decisão

Adotar uma **Arquitetura Modular Baseada em Domínios (`features/`)**:
1. Isolamento completo de requisições HTTP em uma camada de serviços estática (`src/services/`).
2. Separação de estado e efeitos em custom hooks reutilizáveis (`src/hooks/`).
3. Divisão dos componentes por domínio de negócio (`src/features/books`, `tccs`, `profile`, `moderation`).
4. Reutilização de componentes de UI atômicos em `src/components/ui/`.

## Consequências

- Redução do tamanho dos componentes de página para menos de 200 linhas.
- Facilidade em adicionar novos módulos sem afetar partes existentes.
- Possibilidade de testes unitários isolados por serviço e hook.
