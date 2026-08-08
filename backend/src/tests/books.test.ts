import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import app from '../app'
import { prisma } from '../utils/prisma'

let studentToken: string
let testBookId: string
const TEST_BOOK_SLUG = 'livro-de-teste-vitest'

beforeAll(async () => {
  // Limpeza preventiva de execuções mal-sucedidas anteriores
  await prisma.book.deleteMany({ where: { slug: TEST_BOOK_SLUG } })
  await prisma.author.deleteMany({ where: { name: 'Autor Teste Vitest' } })
  await prisma.category.deleteMany({ where: { slug: 'test-category' } })

  // Cria usuário de teste
  const hash = await bcrypt.hash('SenhaTest123!', 10)
  await prisma.user.upsert({
    where: { login: 'test.books@vitest' },
    update: {},
    create: {
      login: 'test.books@vitest',
      name: 'Test Books User',
      passwordHash: hash,
      role: 'STUDENT',
      mustChangePassword: false,
      isActive: true,
    },
  })

  // Faz login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ login: 'test.books@vitest', password: 'SenhaTest123!' })
  studentToken = loginRes.body.data.token

  // Cria categoria e livro de teste no banco
  const cat = await prisma.category.upsert({
    where: { slug: 'test-category' },
    update: {},
    create: { name: 'Test Category', slug: 'test-category' },
  })
  const author = await prisma.author.create({ data: { name: 'Autor Teste Vitest' } })
  const book = await prisma.book.create({
    data: {
      title: 'Livro de Teste Vitest',
      slug: TEST_BOOK_SLUG,
      filePath: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      categoryId: cat.id,
      isPublished: true,
      authors: { create: { authorId: author.id } },
    },
  })
  testBookId = book.id
})

afterAll(async () => {
  await prisma.book.deleteMany({ where: { slug: TEST_BOOK_SLUG } })
  await prisma.user.deleteMany({ where: { login: 'test.books@vitest' } })
  await prisma.author.deleteMany({ where: { name: 'Autor Teste Vitest' } })
  await prisma.category.deleteMany({ where: { slug: 'test-category' } })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/books', () => {
  it('retorna lista de livros publicados', async () => {
    const res = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.pagination).toBeDefined()
  })

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get('/api/books')
    expect(res.status).toBe(401)
  })

  it('suporta busca por texto', async () => {
    const res = await request(app)
      .get('/api/books?search=Livro+de+Teste')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).toBe(200)
    const titles: string[] = res.body.data.map((b: { title: string }) => b.title)
    expect(titles.some((t) => t.toLowerCase().includes('teste'))).toBe(true)
  })

  it('retorna paginação correta', async () => {
    const res = await request(app)
      .get('/api/books?page=1&limit=5')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).toBe(200)
    expect(res.body.pagination.limit).toBe(5)
    expect(res.body.data.length).toBeLessThanOrEqual(5)
  })
})

describe('GET /api/books/:slug', () => {
  it('retorna dados do livro pelo slug', async () => {
    const res = await request(app)
      .get(`/api/books/${TEST_BOOK_SLUG}`)
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.slug).toBe(TEST_BOOK_SLUG)
    expect(res.body.data.progress).toBeDefined()
    expect(res.body.data.isFavorited).toBeDefined()
  })

  it('retorna 404 para slug inexistente', async () => {
    const res = await request(app)
      .get('/api/books/livro-que-nao-existe')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).toBe(404)
  })
})

describe('POST /api/books/:bookId/favorite', () => {
  it('favorita e desfavorita um livro', async () => {
    // Favorita
    const res1 = await request(app)
      .post(`/api/books/${testBookId}/favorite`)
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res1.status).toBe(200)
    expect(res1.body.data.isFavorited).toBe(true)

    // Desfavorita
    const res2 = await request(app)
      .post(`/api/books/${testBookId}/favorite`)
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res2.status).toBe(200)
    expect(res2.body.data.isFavorited).toBe(false)
  })
})

describe('POST /api/books/:bookId/progress', () => {
  it('salva o progresso de leitura', async () => {
    const res = await request(app)
      .post(`/api/books/${testBookId}/progress`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ currentPage: 42, totalPages: 200, isFinished: false })

    expect(res.status).toBe(200)
    expect(res.body.data.currentPage).toBe(42)
  })
})

describe('GET /api/me/favorites', () => {
  it('retorna lista de favoritos do usuário', async () => {
    const res = await request(app)
      .get('/api/me/favorites')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})

describe('GET /api/me/history', () => {
  it('retorna histórico de leitura do usuário', async () => {
    const res = await request(app)
      .get('/api/me/history')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
  })
})
