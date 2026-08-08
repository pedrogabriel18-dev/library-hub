# Changelog — LibraryHub

Todas as mudanças notáveis no projeto **LibraryHub** serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [2.0.0] - 2026-08-04

### Adicionado
- **Arquitetura Modular Profissional**: Separação estrita em camadas (`services/`, `hooks/`, `features/`, `components/ui/`, `constants/`).
- **Sistema Global de Notificações Toast**: Alertas flutuantes (`success`, `error`, `warning`, `info`) integrados à aplicação.
- **Busca Instantânea com Debounce**: Busca em tempo real com realce de termos e atalho `Ctrl+K`.
- **Navegação com Breadcrumbs**: Componente `Breadcrumb` em páginas de detalhes.
- **Restauração de Rolagem (`ScrollToTop`)**: Rolagem automática para o topo ao alternar páginas.
- **Modarilização de Rotas no Backend**: Sub-roteadores desacoplados (`auth.routes.ts`, `books.routes.ts`, `tccs.routes.ts`, etc.).
- **Suíte Completa de Testes**: 52 testes de integração cobrindo fluxos de autenticação, segurança, autorização e gerenciamento de acervo.

### Alterado
- Refatoração dos componentes gigantes `ProfilePage`, `HomePage`, `AdminUsersPage` e `AdminModerationPage` para subcomponentes reutilizáveis (< 200 linhas).
- Atualização do roteamento com `React.lazy()` e `Suspense` para suporte a Code Splitting.

---

## [1.0.0] - 2026-03-01

### Adicionado
- Lançamento inicial da plataforma LibraryHub com catálogo de livros, TCCs acadêmicos, leitor imersivo de PDFs e painel administrativo.
