# ADR 0004: Design System Vanilla CSS Tokens e Acessibilidade WCAG AA

- **Status**: Aprovado
- **Data**: 2026-08-04

## Contexto

Para garantir que a interface seja moderna, personalizável, de carregamento ultra-rápido e 100% acessível para leitores de tela e usuários navegando via teclado.

## Decisão

Utilizar **Vanilla CSS com Design Tokens (Variáveis CSS)**:
- Suporte a 3 temas nativos: Claro, Escuro e Alto Contraste.
- Anéis de foco visíveis `:focus-visible` em todos os elementos interativos.
- Suporte a `prefers-reduced-motion` no CSS global.

## Consequências

- Zero dependências de frameworks CSS pesados.
- Troca de tema instantânea sem re-renderizar a árvore DOM do React.
- Conformidade estrita com diretrizes de acessibilidade WCAG AA.
