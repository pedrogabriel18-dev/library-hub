/**
 * Setup global dos testes: aplica migrações no banco de teste SQLite e
 * desconecta o Prisma ao final de todos os testes. (#12)
 */
import { beforeAll, afterAll } from 'vitest'
import { execSync } from 'child_process'
import { join } from 'path'
import { prisma } from '../utils/prisma'

// Rota de configuração global sem reexecutar migrações simultâneas no SQLite
beforeAll(async () => {
  // Conecta ao banco de dados limpo e configurado
  await prisma.$connect()
})

// Desconecta o Prisma ao final de todos os testes
afterAll(async () => {
  await prisma.$disconnect()
})
