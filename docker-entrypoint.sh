#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# docker-entrypoint.sh — Script de inicialização do container
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo ""
echo "🚀 LibraryHub — Iniciando container..."
echo ""

# ── Verifica variáveis obrigatórias ──────────────────────────────────────────
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERRO: Variável DATABASE_URL não definida!"
  exit 1
fi

if [ -z "$JWT_SECRET" ]; then
  echo "❌ ERRO: Variável JWT_SECRET não definida!"
  exit 1
fi

# ── Diretórios de storage ─────────────────────────────────────────────────────
echo "📁 Verificando diretórios de armazenamento..."
mkdir -p /app/storage/books /app/storage/tccs /app/public/assets

if [ -d /app/seed-storage/books ] && [ -z "$(ls -A /app/storage/books 2>/dev/null)" ]; then
  echo "Copiando livros iniciais para o volume persistente..."
  cp -R /app/seed-storage/books/. /app/storage/books/
fi

if [ -d /app/seed-storage/tccs ] && [ -z "$(ls -A /app/storage/tccs 2>/dev/null)" ]; then
  echo "Copiando TCCs iniciais para o volume persistente..."
  cp -R /app/seed-storage/tccs/. /app/storage/tccs/
fi

# ── Migrations do banco de dados ──────────────────────────────────────────────
echo "Sincronizando schema do Prisma..."
cd /app/backend
npx prisma db push --skip-generate

# Captura apenas stdout (descarta warnings do Prisma que vão para stderr).
# tail -1 garante que apenas a última linha (o número) seja usada,
# mesmo que o Node imprima mensagens adicionais antes.
USER_COUNT=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.user.count()
    .then(c => { console.log(c); return p.\$disconnect(); })
    .catch(async e => { console.error(e); await p.\$disconnect(); process.exit(1); })
" 2>/dev/null | tail -1)

# Valida que USER_COUNT é um número (proteção contra output inesperado)
case "$USER_COUNT" in
  ''|*[!0-9]*)
    echo "⚠️  Não foi possível verificar usuários. Executando seed como precaução..."
    node dist/seed.js
    ;;
  0)
    echo "Banco vazio. Executando seed inicial..."
    node dist/seed.js
    ;;
  *)
    echo "Seed ignorado. Usuarios existentes: $USER_COUNT"
    ;;
esac


echo ""
echo "✅ Inicialização concluída! Iniciando servidor na porta ${PORT:-3333}..."
echo ""

# ── Inicia o servidor backend ─────────────────────────────────────────────────
exec node dist/server.js
