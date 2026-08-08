import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import app from '../app'
import { prisma } from '../utils/prisma'

let devToken: string
let librarianToken: string
let createdBookId: string
let createdUserId: string

beforeAll(async () => {
  // Cria usuário DEVELOPER
  const devHash = await bcrypt.hash('DevPass2026!', 10)
  await prisma.user.upsert({
    where: { login: 'test.dev@vitest' },
    update: {},
    create: {
      login: 'test.dev@vitest',
      name: 'Test Developer',
      passwordHash: devHash,
      role: 'DEVELOPER',
      mustChangePassword: false,
      isActive: true,
    },
  })

  // Cria usuário LIBRARIAN
  const libHash = await bcrypt.hash('LibPass2026!', 10)
  await prisma.user.upsert({
    where: { login: 'test.lib@vitest' },
    update: {},
    create: {
      login: 'test.lib@vitest',
      name: 'Test Librarian',
      passwordHash: libHash,
      role: 'LIBRARIAN',
      mustChangePassword: false,
      isActive: true,
    },
  })

  // Limpa livros remanescentes de execuções anteriores
  await prisma.book.deleteMany({ where: { title: 'Livro Criado pelo Admin Test' } })

  // Faz login
  const [devRes, libRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ login: 'test.dev@vitest', password: 'DevPass2026!' }),
    request(app).post('/api/auth/login').send({ login: 'test.lib@vitest', password: 'LibPass2026!' }),
  ])
  devToken = devRes.body.data.token
  librarianToken = libRes.body.data.token
})

afterAll(async () => {
  if (createdBookId) await prisma.book.deleteMany({ where: { id: createdBookId } })
  if (createdUserId) await prisma.user.deleteMany({ where: { id: createdUserId } })
  await prisma.user.deleteMany({ where: { login: { in: ['test.dev@vitest', 'test.lib@vitest'] } } })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/admin/books — Criação de livro', () => {
  it('cria um livro diretamente no banco (sem JSON)', async () => {
    const res = await request(app)
      .post('/api/admin/books')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({
        title: 'Livro Criado pelo Admin Test',
        author: 'Autor Admin Test',
        category: 'Tecnologia',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        publishedYear: 2024,
        description: 'Descrição de teste',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.title).toBe('Livro Criado pelo Admin Test')
    createdBookId = res.body.data.id
  })

  it('retorna 409 para livro com título duplicado', async () => {
    const res = await request(app)
      .post('/api/admin/books')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({
        title: 'Livro Criado pelo Admin Test',
        author: 'Outro Autor',
        category: 'Tecnologia',
        url: 'https://example.com/outro.pdf',
      })

    expect(res.status).toBe(409)
  })

  it('retorna 400 para dados inválidos (Zod)', async () => {
    const res = await request(app)
      .post('/api/admin/books')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ title: '', author: 'Autor', category: 'Cat', url: 'url' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('retorna 403 para usuário STUDENT', async () => {
    const studentHash = await bcrypt.hash('pass', 10)
    await prisma.user.upsert({
      where: { login: 'test.student.admin@vitest' },
      update: {},
      create: {
        login: 'test.student.admin@vitest',
        name: 'Test Student',
        passwordHash: studentHash,
        role: 'STUDENT',
        mustChangePassword: false,
        isActive: true,
      },
    })
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ login: 'test.student.admin@vitest', password: 'pass' })
    const studentToken = studentRes.body.data.token

    const res = await request(app)
      .post('/api/admin/books')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Livro', author: 'Autor', category: 'Cat', url: 'url' })

    expect(res.status).toBe(403)
    await prisma.user.deleteMany({ where: { login: 'test.student.admin@vitest' } })
  })
})

describe('GET /api/admin/users — Listagem de usuários com paginação', () => {
  it('retorna usuários paginados', async () => {
    const res = await request(app)
      .get('/api/admin/users?page=1&limit=5')
      .set('Authorization', `Bearer ${devToken}`)

    expect(res.status).toBe(200)
    expect(res.body.pagination).toBeDefined()
    expect(res.body.pagination.limit).toBe(5)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeLessThanOrEqual(5)
  })

  it('suporta busca por nome', async () => {
    const res = await request(app)
      .get('/api/admin/users?search=Test+Developer')
      .set('Authorization', `Bearer ${devToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.some((u: { name: string }) => u.name.includes('Test Developer'))).toBe(true)
  })
})

describe('POST /api/admin/users — Criação de usuário', () => {
  it('cria um usuário com a senha padrão do env', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${devToken}`)
      .send({ login: 'novo.user.test@vitest', name: 'Novo Usuário Teste', role: 'STUDENT' })

    expect(res.status).toBe(201)
    expect(res.body.data.login).toBe('novo.user.test@vitest')
    createdUserId = res.body.data.id
  })

  it('retorna 409 para login duplicado', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${devToken}`)
      .send({ login: 'novo.user.test@vitest', name: 'Outro Nome', role: 'STUDENT' })

    expect(res.status).toBe(409)
  })

  it('retorna 400 para dados inválidos (Zod)', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${devToken}`)
      .send({ login: '', name: 'Nome Válido', role: 'STUDENT' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })
})

describe('GET /api/admin/stats — Dashboard', () => {
  it('retorna estatísticas do sistema', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${devToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.totals).toBeDefined()
    expect(res.body.data.recentLogs).toBeDefined()
    expect(res.body.data.logsPagination).toBeDefined()
  })

  it('suporta paginação de logs', async () => {
    const res = await request(app)
      .get('/api/admin/stats?logPage=1')
      .set('Authorization', `Bearer ${devToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.logsPagination.page).toBe(1)
  })
})

describe('POST /api/admin/categories — Categorias', () => {
  const CAT_NAME = 'Categoria Teste Vitest'

  afterAll(async () => {
    await prisma.category.deleteMany({ where: { name: CAT_NAME } })
  })

  it('cria uma nova categoria', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ name: CAT_NAME })

    expect(res.status).toBe(201)
    expect(res.body.data.name).toBe(CAT_NAME)
  })

  it('retorna 409 para categoria duplicada', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ name: CAT_NAME })

    expect(res.status).toBe(409)
  })

  it('retorna 400 para nome vazio (Zod)', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ name: '' })

    expect(res.status).toBe(400)
  })
})
