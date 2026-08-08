# 🎬 Guia de Demonstração e Apresentação de Portfólio — LibraryHub

Este documento fornece um roteiro estruturado para apresentar o **LibraryHub** em entrevistas técnicas, demonstrações ao vivo, feiras de tecnologia e gravação de vídeos/GIFs de portfólio.

---

## 🔑 Credenciais de Demonstração Prontas para Uso

Todas as contas abaixo utilizam a senha padronizada: `Senha@123`

| Papel / Perfil | Login Fictício | Senha | Principais Permissões & Recursos para Demonstrar |
| -------------- | -------------- | ----- | ------------------------------------------------ |
| 🎓 **Estudante** | `aluno.teste` | `Senha@123` | Ler livros/TCCs, favoritar obras, enviar resenha com nota e ver histórico de leitura. |
| 📚 **Bibliotecária** | `biblio.teste` | `Senha@123` | Gerenciar livros, moderar resenhas de alunos, ver analytics por turma. |
| 👨‍🏫 **Orientador** | `orientador.teste` | `Senha@123` | Gerenciar TCCs acadêmicos, moderar resenhas e consultar estatísticas. |
| 🛡️ **Desenvolvedor** | `admin.teste` | `Senha@123` | Acesso administrativo completo, controle de usuários e logs de auditoria. |

---

## ⏱️ Roteiro de Demonstração em 2 Minutos (Entrevistas Técnicas)

### Cenário 1: Experiência do Leitor & Acessibilidade (60 segundos)
1. Faça login como **Estudante** (`aluno.teste` / `Senha@123`).
2. Pressione `Ctrl + K` (ou `⌘K`) para abrir a **Command Palette** e busque por *"Dom Casmurro"*.
3. Navegue até o livro e abra o **Leitor Imersivo de PDF**. Mostre o progresso automático de leitura.
4. Clique no botão de **Favoritar** e demonstre a notificação Toast com a opção de **Desfazer (Undo)**.
5. Pressione `Ctrl + Shift + L` para alternar entre os temas **Claro**, **Escuro** e **Alto Contraste (WCAG AA)**.

### Cenário 2: Painel Administrativo & Moderação (60 segundos)
1. Alterne para a conta de **Bibliotecária** (`biblio.teste` / `Senha@123`).
2. Acesse o menu **Moderação** para aprovar ou rejeitar resenhas enviadas pelos alunos.
3. Acesse o **Painel Administrativo** para visualizar o gráfico de livros e TCCs mais consultados por turma escolar.
4. Pressione `?` para abrir o guia interativo de **Atalhos de Teclado**.

---

## 💎 Diferenciais Técnicos em Destaque

| Categoria | Recurso Implementado no LibraryHub |
| --------- | ---------------------------------- |
| **Arquitetura** | Monolito Modular Desacoplado, TypeScript estrito, serviços REST desacoplados do React. |
| **Segurança** | Criptografia bcrypt, tokens JWT stateless, controle de acesso RBAC, Rate Limiting contra força bruta. |
| **Acessibilidade** | Conformidade WCAG 2.1 AA, anel de foco visível, temas nativos, navegação por teclado e `prefers-reduced-motion`. |
| **PWA & Offline** | Web App Manifest, Service Worker (*Stale-While-Revalidate*) e detector de perda de conexão. |
| **Testes** | Suíte automatizada com **52 testes de integração** no Vitest cobrindo segurança, auth e recursos. |
| **LGPD & Privacidade** | Anonimização de IPs em logs, consentimento de cookies e políticas institucionais transparentes. |
