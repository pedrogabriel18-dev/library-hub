# Diretrizes de Acessibilidade (WCAG AA) — LibraryHub

 O **LibraryHub** adota as melhores práticas de acessibilidade de acordo com as normas **WCAG 2.1 nível AA**.

---

## ♿ Recursos Implementados

1. **Modo Alto Contraste Nativo**:
   - Ativado pelo seletor de temas (`data-high-contrast="true"`).
   - Ajusta automaticamente bordas, remove transparências e garante contraste mínimo de 4.5:1 em textos.

2. **Navegação Integral por Teclado**:
   - Suporte aos atalhos `Tab`, `Shift+Tab`, `Enter`, `Space` e `ESC`.
   - Atalho global `Ctrl+K` para Command Palette e `?` para lista de atalhos.
   - Anel de foco visível (`:focus-visible`) para indicação clara do elemento selecionado.

3. **Suporte a Leitores de Tela**:
   - Atributos `aria-modal="true"`, `aria-live="polite"`, `role="dialog"` e `aria-label` em botões e modais.

4. **Respeito às Preferências do Usuário**:
   - Suporte à consulta media query `@media (prefers-reduced-motion: reduce)` no CSS global.
