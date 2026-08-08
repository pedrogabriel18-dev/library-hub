/**
 * Configuração do aplicativo Express sem o listen.
 * Separado do server.ts para permitir imports em testes sem iniciar o servidor. (#12)
 */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import path from 'path'
import routes from './routes'
import { resolveAppPath } from './utils/paths'
import { statsCache } from './utils/cache'
import { prisma } from './utils/prisma'

// ── Validação de variáveis de ambiente críticas (#16) ─────────────────────────
// Em modo de teste, as variáveis são injetadas pelo vitest.config.ts
if (process.env.NODE_ENV !== 'test') {
  const required = ['JWT_SECRET', 'DATABASE_URL']
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`\n⛔  FATAL: Variável de ambiente "${key}" não está definida.`)
      console.error('    Configure o arquivo .env antes de iniciar o servidor.\n')
      process.exit(1)
    }
  }
}

const app = express()

// ── Segurança & Compressão ────────────────────────────────────────────────────
app.use(helmet())
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), interest-cohort=()')
  next()
})
app.use(compression())

// ── Invalidação do cache em mutações (POST, PUT, DELETE, PATCH) ───────────────
app.use((req, _res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    statsCache.clear()
  }
  next()
})

const corsOrigins =
  process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL ?? ''].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:4173']

app.use(cors({ origin: corsOrigins, credentials: true }))

// Rate limiting — proteção contra brute force no login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
})
app.use('/api/auth/login', loginLimiter)

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Arquivos estáticos ────────────────────────────────────────────────────────
app.use('/assets', express.static(resolveAppPath('public/assets')))
app.use('/covers', express.static(resolveAppPath('public/covers')))
app.use('/data', express.static(resolveAppPath('public/data')))

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.use('/api', routes)

// ── Frontend (SPA) — apenas em produção ──────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendDist = resolveAppPath('frontend/dist')
  app.use(express.static(frontendDist))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

// ── Health check & Observabilidade ──────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  let dbStatus = 'ok'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'error'
  }

  const memory = process.memoryUsage()
  res.json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    memory: {
      rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
    },
  })
})

// ── Middleware global de erros (captura erros do asyncHandler) (#5) ───────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err)
  res.status(500).json({
    success: false,
    message: 'Ocorreu um erro inesperado. Tente novamente.',
  })
})

export default app
