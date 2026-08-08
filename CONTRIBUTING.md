# Guia de Contribuição — LibraryHub

Ficamos muito felizes pelo seu interesse em contribuir com o **LibraryHub**! Este documento orienta o processo de desenvolvimento e os padrões adotados no projeto.

---

## 🚀 Como Começar

1. Faça um **Fork** deste repositório para sua conta no GitHub.
2. Clone o repositório forkado para sua máquina:
   ```bash
   git clone https://github.com/seu-usuario/biblioteca.git
   cd biblioteca
   ```
3. Crie uma nova **Branch** para sua funcionalidade ou correção:
   ```bash
   git checkout -b feature/minha-nova-funcionalidade
   ```

---

## 🛠️ Padrão de Commits (Conventional Commits)

Utilizamos o padrão internacional **Conventional Commits** para manter o histórico claro e possibilitar a geração automática de changelogs:

- `feat:` Adição de nova funcionalidade (ex: `feat: adiciona filtro por ano nos TCCs`)
- `fix:` Correção de bug (ex: `fix: corrige alinhamento do modal de busca`)
- `docs:` Alterações na documentação (ex: `docs: atualiza guia de instalacao no README`)
- `style:` Formatação de código sem alteração de lógica (ex: `style: ajusta espacamento css`)
- `refactor:` Refatoração de código (ex: `refactor: desacopla servico de autenticacao`)
- `perf:` Melhoria de performance (ex: `perf: adiciona debounce na busca`)
- `test:` Adição ou correção de testes (ex: `test: adiciona teste unitario para BookService`)
- `build:` Alterações que afetam o sistema de build ou dependências (ex: `build: atualiza prisma`)

---

## 🧪 Executando Testes e Validação

Antes de enviar seu Pull Request, certifique-se de que o código passa em todas as verificações:

```bash
# Frontend
cd frontend
npm run lint

# Backend
cd ../backend
npm test
```

---

## 📬 Enviando um Pull Request (PR)

1. Envie suas alterações para o seu repositório remoto:
   ```bash
   git push origin feature/minha-nova-funcionalidade
   ```
2. Abra um **Pull Request** no repositório principal descrevendo:
   - O motivo e objetivo da alteração.
   - Screenshots/gravações se houver modificações na interface.
   - Quais testes foram executados para validar a mudança.
3. Aguarde o Code Review e aprovação da equipe mantenedora!
