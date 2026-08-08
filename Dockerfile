# ─────────────────────────────────────────────────────────────────────────────
# LibraryHub — Dockerfile (multi-stage)
# ─────────────────────────────────────────────────────────────────────────────

# ── Estágio 1: Build do Frontend ──────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ── Estágio 2: Build do Backend ───────────────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
ENV DATABASE_URL=file:./build.db

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

# Gera o Prisma Client antes de compilar
RUN npx prisma generate
RUN npm run build

# ── Estágio 3: Imagem final de produção ───────────────────────────────────────
FROM node:20-alpine AS production

# Dependências de sistema (necessário para SQLite nativo)
RUN apk add --no-cache openssl

WORKDIR /app

# ── Backend: dependências de produção + dist ──────────────────────────────────
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY backend/prisma ./backend/prisma
RUN cd backend && npx prisma generate

# ── Frontend: arquivos estáticos gerados ──────────────────────────────────────
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# ── Arquivos estáticos públicos (assets, capas, PDFs) ─────────────────────────
COPY public ./public
COPY storage ./seed-storage

# ── Diretório de storage (volumes persistentes serão montados aqui) ───────────
RUN mkdir -p /app/storage/books /app/storage/tccs

# ── Script de inicialização ───────────────────────────────────────────────────
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3333

ENV NODE_ENV=production

ENTRYPOINT ["/docker-entrypoint.sh"]
