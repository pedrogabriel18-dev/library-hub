# Library Hub

**Library Hub** is a modern full-stack web application designed to provide an organized, accessible, and efficient digital environment for managing and exploring books, academic works, reviews, and library-related information.

The project was developed as a software engineering and portfolio project, focusing on modular architecture, accessibility, security, performance, usability, and maintainability.

---

## About the Project

Library Hub provides a centralized platform for managing and accessing digital library content.

The platform includes:

* Digital book catalog
* Academic repository
* Search and filtering
* User authentication
* Role-Based Access Control (RBAC)
* Favorites and reading history
* Academic work organization
* Reviews and moderation
* Administrative management
* Accessibility features
* Responsive interface
* Security and privacy practices

The system was designed to be adaptable to different educational environments and library use cases.

---

## Main Features

### Digital Library

* Interactive book catalog
* Search and filtering
* Organization by categories and authors
* Book metadata
* Favorites
* Reading history
* Digital document access
* Reading progress tracking

### Academic Repository

* Repository for academic works
* Search by relevant metadata
* Organization by course, author, advisor, year, and keywords
* Automatically generated document covers
* Optional manual cover replacement
* Structured presentation of long academic titles and descriptions

### Reviews and Moderation

* User reviews
* Rating system
* Review management
* Moderation capabilities for authorized users
* Administrative review removal

### Authentication and Access Control

The application implements Role-Based Access Control (RBAC).

Available roles include:

* Student
* Developer
* Librarian
* Advisor

Each role has different permissions and access levels according to its responsibilities within the system.

### Administration

Administrative features include:

* User management
* Content management
* Academic repository management
* Review moderation
* Permission management
* System information
* Administrative controls

### Accessibility

Accessibility was considered throughout the interface and component design.

Implemented features include:

* Light theme
* Dark theme
* High-contrast mode
* Keyboard navigation
* Visible focus states
* Responsive layouts
* Accessible form controls
* Reduced-motion considerations
* Semantic interface structure

### Security

Security was considered throughout the application architecture.

The project includes mechanisms and practices involving:

* Authentication
* Authorization
* Role-Based Access Control
* Password hashing
* JWT-based authentication
* Input validation
* Rate limiting
* Security headers
* Logging and auditing
* Privacy-oriented logging practices

The application also incorporates privacy considerations based on principles of Brazil's General Data Protection Law (LGPD).

---

## Technologies

### Frontend

* React 18
* Vite
* TypeScript
* React Router DOM
* Vanilla CSS
* CSS Variables and Design Tokens
* Lucide React
* PDF.js

### Backend

* Node.js 20
* Express.js
* Prisma ORM
* SQLite
* JSON Web Tokens (JWT)
* bcryptjs
* Winston

### Testing

* Vitest
* Supertest
* Unit testing
* Integration testing

### Development and Infrastructure

* Git
* GitHub
* GitHub Desktop
* Docker
* Docker Compose

---

## Architecture

Library Hub follows a modular full-stack architecture that separates the frontend, backend, data layer, and supporting services.

The architecture focuses on:

* Maintainability
* Scalability
* Code reuse
* Separation of responsibilities
* Testing
* Security

Additional technical documentation is available in the [`docs/`](./docs/) directory.

---

## Project Structure

```text
library-hub/
├── frontend/
├── backend/
├── docs/
├── tests/
├── .github/
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── ...
```

The exact structure may evolve as the project continues to develop.

---

## Installation

### Requirements

* Node.js 20.x or newer
* npm 10.x or newer
* Git

Docker is optional.

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/library-hub.git
cd library-hub
```

Replace `YOUR_USERNAME` with the GitHub account that owns the repository.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

Configure the required environment variables in `.env` according to `.env.example`.

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The development server will provide the local address displayed in the terminal.

---

## Docker

If Docker support is configured in the project, the application can also be started using:

```bash
docker compose up -d --build
```

The application will be available through the address configured by the Docker services.

---

## Documentation

Additional documentation is available in [`docs/`](./docs/).

It may include:

* [System Architecture](./docs/architecture.md)
* [REST API](./docs/api.md)
* [Database Model](./docs/database.md)
* [Production Deployment](./docs/deployment.md)

---

## Testing

The project includes automated tests for important application components.

The testing strategy includes:

* Unit tests
* Integration tests
* API tests
* Authentication tests
* Application behavior validation

The test suite may evolve as the project continues to receive improvements.

---

## AI-Assisted Development

Library Hub was developed with the assistance of several AI-powered development tools.

The primary tools used during development were:

* Claude Code
* Antigravity
* ChatGPT

They were used as development assistants for activities including:

* Brainstorming
* Architecture discussions
* Code analysis
* Debugging
* Refactoring
* Documentation
* UX/UI exploration
* Security reviews
* Development planning

AI tools were used as part of the development workflow and did not replace the need for implementation, testing, validation, and technical decision-making.

---

## Project Status

**Version:** 1.0.0

Library Hub is currently presented as a completed portfolio project.

Future improvements may include additional features, security improvements, performance refinements, and further architectural evolution.

---

## Author

**Pedro Gabriel**

Beginner Full Stack Developer and Information Technology student.

Interested in:

* Full Stack Development
* Software Engineering
* Web Development
* Artificial Intelligence
* Automation
* APIs
* Databases
* System Architecture
* Cybersecurity
* Cloud Computing

**#acrediteemsimesmo #believeinyourself**

---

## License

This project is licensed under the MIT License.

See the [`LICENSE`](./LICENSE) file for more information.

---

# Português

# Library Hub

O **Library Hub** é uma aplicação web full-stack moderna desenvolvida para oferecer um ambiente digital organizado, acessível e eficiente para gerenciamento e exploração de livros, trabalhos acadêmicos, resenhas e informações relacionadas a bibliotecas.

O projeto foi desenvolvido como um projeto de engenharia de software e portfólio, com foco em arquitetura modular, acessibilidade, segurança, desempenho, usabilidade e manutenibilidade.

---

## Sobre o Projeto

O Library Hub oferece uma plataforma centralizada para gerenciamento e acesso a conteúdos digitais de biblioteca.

A plataforma possui recursos como:

* Catálogo digital de livros
* Repositório acadêmico
* Pesquisa e filtragem
* Autenticação de usuários
* Controle de acesso baseado em funções (RBAC)
* Favoritos e histórico de leitura
* Organização de trabalhos acadêmicos
* Resenhas e moderação
* Gerenciamento administrativo
* Recursos de acessibilidade
* Interface responsiva
* Práticas de segurança e privacidade

O sistema foi projetado para ser adaptável a diferentes ambientes educacionais e casos de uso relacionados a bibliotecas.

---

## Principais Funcionalidades

### Biblioteca Digital

* Catálogo interativo de livros
* Pesquisa e filtragem
* Organização por categorias e autores
* Metadados dos livros
* Favoritos
* Histórico de leitura
* Acesso a documentos digitais
* Registro de progresso de leitura

### Repositório Acadêmico

* Repositório para trabalhos acadêmicos
* Pesquisa por metadados relevantes
* Organização por curso, autor, orientador, ano e palavras-chave
* Geração automática de capas para documentos
* Possibilidade de substituição manual das capas
* Apresentação estruturada de títulos e descrições extensas

### Resenhas e Moderação

* Resenhas de usuários
* Sistema de avaliações
* Gerenciamento de resenhas
* Moderação por usuários autorizados
* Exclusão administrativa de resenhas

### Autenticação e Controle de Acesso

A aplicação utiliza Controle de Acesso Baseado em Funções (RBAC).

Os perfis disponíveis incluem:

* Aluno
* Desenvolvedor
* Bibliotecária
* Orientador

Cada perfil possui diferentes permissões e níveis de acesso de acordo com suas responsabilidades dentro do sistema.

### Administração

Os recursos administrativos incluem:

* Gerenciamento de usuários
* Gerenciamento de conteúdos
* Gerenciamento do repositório acadêmico
* Moderação de resenhas
* Gerenciamento de permissões
* Informações do sistema
* Controles administrativos

### Acessibilidade

A acessibilidade foi considerada durante o desenvolvimento da interface e dos componentes.

Entre os recursos implementados estão:

* Tema claro
* Tema escuro
* Alto contraste
* Navegação por teclado
* Estados de foco visíveis
* Layouts responsivos
* Controles de formulário acessíveis
* Considerações para redução de movimento
* Estrutura semântica da interface

### Segurança

A segurança foi considerada ao longo da arquitetura da aplicação.

O projeto utiliza mecanismos e práticas relacionadas a:

* Autenticação
* Autorização
* Controle de acesso baseado em funções
* Hash de senhas
* Autenticação baseada em JWT
* Validação de entradas
* Rate limiting
* Headers de segurança
* Logs e auditoria
* Práticas de logging orientadas à privacidade

A aplicação também incorpora considerações de privacidade baseadas nos princípios da Lei Geral de Proteção de Dados (LGPD).

---

## Tecnologias

### Frontend

* React 18
* Vite
* TypeScript
* React Router DOM
* Vanilla CSS
* CSS Variables e Design Tokens
* Lucide React
* PDF.js

### Backend

* Node.js 20
* Express.js
* Prisma ORM
* SQLite
* JSON Web Tokens (JWT)
* bcryptjs
* Winston

### Testes

* Vitest
* Supertest
* Testes unitários
* Testes de integração

### Desenvolvimento e Infraestrutura

* Git
* GitHub
* GitHub Desktop
* Docker
* Docker Compose

---

## Arquitetura

O Library Hub utiliza uma arquitetura full-stack modular que separa frontend, backend, camada de dados e serviços de suporte.

A arquitetura prioriza:

* Manutenibilidade
* Escalabilidade
* Reutilização de código
* Separação de responsabilidades
* Testes
* Segurança

A documentação técnica adicional está disponível no diretório [`docs/`](./docs/).

---

## Estrutura do Projeto

```text
library-hub/
├── frontend/
├── backend/
├── docs/
├── tests/
├── .github/
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── ...
```

A estrutura exata pode evoluir conforme o projeto continuar recebendo melhorias.

---

## Instalação

### Requisitos

* Node.js 20.x ou superior
* npm 10.x ou superior
* Git

Docker é opcional.

### Clonar o Repositório

```bash
git clone https://github.com/SEU_USUARIO/library-hub.git
cd library-hub
```

Substitua `SEU_USUARIO` pelo usuário do GitHub responsável pelo repositório.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

Configure as variáveis de ambiente necessárias no arquivo `.env`, utilizando `.env.example` como referência.

### Frontend

Abra outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O servidor de desenvolvimento fornecerá o endereço local exibido no terminal.

---

## Docker

Caso o suporte a Docker esteja configurado no projeto, a aplicação também poderá ser iniciada utilizando:

```bash
docker compose up -d --build
```

A aplicação estará disponível no endereço configurado pelos serviços do Docker.

---

## Documentação

A documentação adicional está disponível em [`docs/`](./docs/).

Ela pode incluir:

* [Arquitetura do Sistema](./docs/architecture.md)
* [API REST](./docs/api.md)
* [Modelo do Banco de Dados](./docs/database.md)
* [Deploy em Produção](./docs/deployment.md)

---

## Testes

O projeto possui testes automatizados para componentes importantes da aplicação.

A estratégia de testes inclui:

* Testes unitários
* Testes de integração
* Testes de API
* Testes de autenticação
* Validação do comportamento da aplicação

A suíte de testes pode evoluir conforme o projeto receber novas melhorias.

---

## Desenvolvimento Assistido por IA

O Library Hub foi desenvolvido com o auxílio de diversas ferramentas de inteligência artificial.

As principais ferramentas utilizadas durante o desenvolvimento foram:

* Claude Code
* Antigravity
* ChatGPT

Essas ferramentas foram utilizadas como assistentes durante atividades como:

* Brainstorming
* Discussões de arquitetura
* Análise de código
* Debugging
* Refatoração
* Documentação
* Exploração de UX/UI
* Revisões de segurança
* Planejamento do desenvolvimento

As ferramentas de IA fizeram parte do fluxo de desenvolvimento, sem substituir a necessidade de implementação, testes, validação e tomada de decisões técnicas.

---

## Status do Projeto

**Versão:** 1.0.0

O Library Hub é apresentado atualmente como um projeto de portfólio concluído.

Futuras melhorias podem incluir novos recursos, aprimoramentos de segurança, otimizações de desempenho e evolução da arquitetura.

---

## Autor

**Pedro Gabriel**

Desenvolvedor Full Stack iniciante e estudante de Tecnologia da Informação.

Interesses:

* Desenvolvimento Full Stack
* Engenharia de Software
* Desenvolvimento Web
* Inteligência Artificial
* Automação
* APIs
* Bancos de Dados
* Arquitetura de Sistemas
* Cibersegurança
* Computação em Nuvem

**#acrediteemsimesmo #believeinyourself**

---

## Licença

Este projeto está licenciado sob a Licença MIT.

Consulte o arquivo [`LICENSE`](./LICENSE) para obter mais informações.
