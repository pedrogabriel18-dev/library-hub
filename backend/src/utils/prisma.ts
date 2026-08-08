import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // ── Otimizações SQLite ───────────────────────────────────────────────────────
  // WAL mode: permite múltiplas leituras simultâneas sem bloquear escritas.
  // Essencial para multi-usuário em produção com SQLite.
  // Executa apenas uma vez por instância do processo.
  if (process.env.DATABASE_URL?.startsWith('file:')) {
    client.$connect().then(async () => {
      await client.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
      // synchronous=NORMAL é seguro com WAL e mais rápido que FULL
      await client.$queryRawUnsafe('PRAGMA synchronous = NORMAL;')
      // Cache de 64 MB para reduzir I/O de disco
      await client.$queryRawUnsafe('PRAGMA cache_size = -65536;')
      // Armazena tabelas temporárias em memória
      await client.$queryRawUnsafe('PRAGMA temp_store = MEMORY;')
      // mmap de 128 MB: acesso ao banco via memória mapeada
      await client.$queryRawUnsafe('PRAGMA mmap_size = 134217728;')
    }).catch((err) => {
      console.warn('[Prisma] Falha ao aplicar pragmas SQLite:', err)
    })
  }

  return client
}

export const prisma = global.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}

