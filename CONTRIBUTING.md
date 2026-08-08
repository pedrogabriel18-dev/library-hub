# Guia de Contribuição — Library Hub

Obrigado pelo interesse em contribuir com o **Library Hub**.

Este documento apresenta as orientações para contribuir com o projeto, incluindo configuração do ambiente, organização das branches, padrões de commits, testes e Pull Requests.

O Library Hub é um projeto de portfólio mantido por **Pedro Gabriel**. Contribuições, sugestões, correções e melhorias são bem-vindas desde que estejam alinhadas aos objetivos técnicos e às diretrizes do projeto.

---

## Como Começar

### 1. Faça um Fork

Caso você não possua permissão de escrita no repositório, faça um **Fork** do projeto para sua conta do GitHub.

### 2. Clone o Repositório

Clone o seu fork:

```bash
git clone https://github.com/SEU_USUARIO/library-hub.git
cd library-hub
```

Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub.

### 3. Crie uma Branch

Evite realizar alterações diretamente na branch `main`.

Crie uma branch específica para a alteração:

```bash
git checkout -b feature/minha-nova-funcionalidade
```

Exemplos:

```bash
git checkout -b feature/search-filters
git checkout -b fix/authentication-error
git checkout -b docs/update-installation
```

Prefira nomes curtos e descritivos.

---

## Organização das Branches

A branch `main` representa a versão principal do projeto.

Alterações devem ser desenvolvidas em branches separadas e posteriormente submetidas por meio de Pull Requests.

Exemplos de categorias:

| Prefixo     | Utilização             |
| ----------- | ---------------------- |
| `feature/`  | Nova funcionalidade    |
| `fix/`      | Correção de problema   |
| `refactor/` | Refatoração            |
| `docs/`     | Documentação           |
| `test/`     | Testes                 |
| `perf/`     | Performance            |
| `security/` | Melhorias de segurança |

Exemplo:

```bash
git checkout -b feature/improve-book-search
```

---

## Padrão de Commits

O projeto utiliza o padrão **Conventional Commits** para manter o histórico organizado e facilitar a identificação das alterações.

### Tipos principais

| Tipo       | Utilização                         | Exemplo                                        |
| ---------- | ---------------------------------- | ---------------------------------------------- |
| `feat`     | Nova funcionalidade                | `feat: adiciona filtro por ano aos livros`     |
| `fix`      | Correção de problema               | `fix: corrige erro na autenticação`            |
| `docs`     | Documentação                       | `docs: atualiza guia de instalação`            |
| `style`    | Formatação sem alteração de lógica | `style: ajusta espacamento da interface`       |
| `refactor` | Refatoração                        | `refactor: reorganiza servico de autenticacao` |
| `perf`     | Performance                        | `perf: otimiza busca do catalogo`              |
| `test`     | Testes                             | `test: adiciona testes para BookService`       |
| `build`    | Build e dependências               | `build: atualiza dependencia do prisma`        |
| `security` | Segurança                          | `security: adiciona validacao de entrada`      |

### Exemplos

```bash
git commit -m "feat: adiciona filtro por autor"
```

```bash
git commit -m "fix: corrige erro no carregamento dos tccs"
```

```bash
git commit -m "security: melhora validacao de autenticacao"
```

Evite mensagens genéricas como:

```text
update
fix
changes
teste
alteracoes
```

A mensagem do commit deve explicar de forma objetiva o que foi alterado.

---

## Qualidade do Código

As contribuições devem priorizar:

* Código legível;
* Separação adequada de responsabilidades;
* Componentes reutilizáveis;
* Baixo acoplamento;
* Validação adequada de dados;
* Tratamento de erros;
* Segurança;
* Acessibilidade;
* Desempenho;
* Manutenibilidade.

Evite introduzir dependências desnecessárias ou alterações que aumentem significativamente a complexidade do projeto sem uma justificativa técnica.

---

## Acessibilidade

Alterações na interface devem considerar acessibilidade.

Sempre que aplicável, verifique:

* Navegação por teclado;
* Estados de foco;
* Contraste;
* Elementos semânticos;
* Labels de formulários;
* Textos alternativos;
* Responsividade;
* Compatibilidade com os modos de acessibilidade existentes.

Uma alteração visual não deve prejudicar os recursos de acessibilidade já existentes.

---

## Segurança e Privacidade

Alterações relacionadas a autenticação, autorização, usuários, banco de dados ou processamento de dados devem receber atenção especial.

Nunca envie para o repositório:

* Senhas;
* Tokens;
* Chaves de API;
* Segredos;
* Arquivos `.env`;
* Dados pessoais reais;
* Bancos de dados contendo informações reais;
* Credenciais de qualquer serviço.

Utilize arquivos como `.env.example` para documentar variáveis necessárias sem expor valores sensíveis.

Alterações que possam afetar autenticação, autorização, sessões, permissões ou tratamento de dados devem ser cuidadosamente testadas antes de serem submetidas.

Questões de segurança devem ser tratadas de acordo com as orientações disponíveis no arquivo [`SECURITY.md`](./SECURITY.md), quando aplicável.

---

## Executando o Projeto

Consulte o [`README.md`](./README.md) para obter as instruções atualizadas de instalação e configuração.

De maneira geral, o projeto possui uma estrutura separada entre frontend e backend.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

As variáveis de ambiente necessárias devem ser configuradas utilizando o `.env.example` como referência.

---

## Testes e Validação

Antes de abrir um Pull Request, execute os testes e verificações disponíveis no projeto.

### Frontend

```bash
cd frontend
npm run lint
```

### Backend

```bash
cd backend
npm test
```

Caso existam outros scripts de validação definidos nos arquivos `package.json`, eles também devem ser executados quando forem relevantes para a alteração realizada.

Além dos testes automatizados, verifique manualmente as funcionalidades afetadas.

---

## Pull Requests

Depois de concluir as alterações:

```bash
git add .
git commit -m "feat: descreve a alteracao"
git push origin feature/minha-nova-funcionalidade
```

Depois, abra um **Pull Request** para a branch `main`.

O Pull Request deve apresentar informações suficientes para que a alteração possa ser compreendida e avaliada.

### Inclua:

* Descrição objetiva da alteração;
* Motivo da alteração;
* Problema solucionado ou funcionalidade adicionada;
* Arquivos ou componentes relevantes;
* Testes realizados;
* Possíveis limitações ou pontos que ainda precisam de atenção.

Para alterações de interface, screenshots ou gravações podem ser adicionados quando forem úteis para demonstrar o resultado.

---

## Checklist do Pull Request

Antes de enviar sua contribuição, verifique:

* [ ] O código foi testado localmente;
* [ ] Os testes relevantes foram executados;
* [ ] O lint foi executado quando aplicável;
* [ ] Nenhuma credencial ou informação sensível foi adicionada;
* [ ] A alteração não introduz dados reais no projeto;
* [ ] Acessibilidade foi considerada;
* [ ] A alteração não quebra funcionalidades existentes;
* [ ] O commit segue o padrão Conventional Commits;
* [ ] O Pull Request possui uma descrição clara.

---

## Code Review

Pull Requests podem passar por revisão antes de serem incorporados à branch `main`.

A revisão pode considerar:

* Correção técnica;
* Qualidade do código;
* Segurança;
* Acessibilidade;
* Desempenho;
* Manutenibilidade;
* Compatibilidade com a arquitetura existente;
* Impacto sobre funcionalidades atuais.

Solicitações de alteração devem ser tratadas de maneira construtiva e técnica.

---

## Contribuições de Documentação

Melhorias na documentação também são bem-vindas.

Isso inclui:

* Correções de erros;
* Melhorias nas instruções de instalação;
* Documentação da API;
* Documentação de arquitetura;
* Exemplos de uso;
* Explicações técnicas.

Para alterações exclusivamente documentais, utilize uma branch como:

```bash
git checkout -b docs/improve-readme
```

---

## Propostas de Novas Funcionalidades

Antes de desenvolver uma funcionalidade significativa, recomenda-se abrir uma Issue para discutir:

* Problema que a funcionalidade pretende solucionar;
* Benefícios esperados;
* Impacto na arquitetura;
* Possíveis alternativas;
* Impacto sobre segurança e acessibilidade;
* Complexidade de implementação.

Isso reduz o risco de desenvolver uma solução que não esteja alinhada aos objetivos do projeto.

---

## Respeito ao Código de Conduta

Todas as contribuições devem seguir o [Código de Conduta](./CODE_OF_CONDUCT.md) do Library Hub.

O objetivo é manter um ambiente de colaboração técnico, respeitoso e profissional.

---

## Licença

Ao contribuir com o projeto, você concorda que sua contribuição será disponibilizada sob os termos da licença utilizada pelo Library Hub.

Consulte o arquivo [`LICENSE`](./LICENSE) para obter mais informações.

---

## Mantenedor

**Pedro Gabriel**

Library Hub é um projeto independente de portfólio desenvolvido como parte do processo de aprendizado e prática em desenvolvimento Full Stack e engenharia de software.

**#acrediteemsimesmo #believeinyourself**
