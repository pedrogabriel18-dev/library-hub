# Guia de Implantação e Deploy em Produção — LibraryHub

Este documento orienta a implantação em produção do **LibraryHub** utilizando **Docker**, **Docker Compose** ou hospedagem de contêineres como EasyPanel / Portainer / VPS Linux.

---

## 🐳 Implantação via Docker Compose (Recomendado)

1. Clone o repositório no servidor de produção:
   ```bash
   git clone https://github.com/libraryhub/libraryhub.git /opt/libraryhub
   cd /opt/libraryhub
   ```

2. Crie o arquivo `.env` de produção baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Edite as variáveis com seus segredos de produção:
   ```env
   NODE_ENV=production
   PORT=3333
   JWT_SECRET=gere_uma_chave_forte_com_openssl_rand_hex_64
   DATABASE_URL=file:/app/data/sqlite.db
   FRONTEND_URL=https://sua-biblioteca.com.br
   ```

4. Suba a aplicação contêinerizada:
   ```bash
   docker-compose up -d --build
   ```

5. O serviço estará rodando e escutando na porta configurada (3333).
