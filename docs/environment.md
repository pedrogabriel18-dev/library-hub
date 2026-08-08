# Guia de Variáveis de Ambiente — LibraryHub

Toda a configuração de ambiente é feita através de arquivos `.env`.

---

## ⚙️ Variáveis do Backend (`backend/.env`)

| Variável | Descrição | Exemplo em Dev | Exemplo em Prod |
| -------- | --------- | -------------- | --------------- |
| `NODE_ENV` | Modo de execução do Node | `development` | `production` |
| `PORT` | Porta de escuta do servidor Express | `3333` | `3333` |
| `JWT_SECRET` | Chave de assinatura dos tokens JWT | `secret_dev_key` | `chave_forte_openssl_rand_64` |
| `DATABASE_URL` | URL de conexão com banco de dados | `file:./dev.db` | `file:/app/data/prod.db` |
| `FRONTEND_URL` | Origem permitida para CORS | `http://localhost:5173` | `https://libraryhub.dev` |

---

## ⚙️ Variáveis do Frontend (`frontend/.env`)

| Variável | Descrição | Exemplo em Dev |
| -------- | --------- | -------------- |
| `VITE_API_URL` | Endereço base da API REST | `http://localhost:3333/api` |
