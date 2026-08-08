import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    // Executa testes sequencialmente para evitar conflitos no banco SQLite
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 20000,
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    env: {
      // Variáveis definidas aqui são injetadas ANTES de qualquer import de módulo,
      // garantindo que o Prisma client use o banco de testes correto.
      DATABASE_URL: 'file:./test-acervo.db',
      JWT_SECRET: 'test-jwt-secret-vitest',
      NODE_ENV: 'test',
      DEFAULT_PASSWORD: 'TestPass2026!',
      STORAGE_ROOT: process.cwd(),
    },
  },
})
