import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import app from '../app'
import { prisma } from '../utils/prisma'

let studentToken: string
let advisorToken: string
let librarianToken: string
let testBookId: string

const STUDENT_LOGIN = 'security.student@vitest'
const ADVISOR_LOGIN = 'security.advisor@vitest'
const LIBRARIAN_LOGIN = 'security.librarian@vitest'
const TEST_PASSWORD = 'PasswordSecure2026!'

beforeAll(async () => {
  const hash = await bcrypt.hash(TEST_PASSWORD, 10)

  // Criar os usuários de teste
  await prisma.user.upsert({
    where: { login: STUDENT_LOGIN },
    update: {},
    create: {
      login: STUDENT_LOGIN,
      name: 'Security Student',
      passwordHash: hash,
      role: 'STUDENT',
      mustChangePassword: false,
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { login: ADVISOR_LOGIN },
    update: {},
    create: {
      login: ADVISOR_LOGIN,
      name: 'Security Advisor',
      passwordHash: hash,
      role: 'ADVISOR',
      mustChangePassword: false,
      isActive: true,
    },
  })

  await prisma.user.upsert({
    where: { login: LIBRARIAN_LOGIN },
    update: {},
    create: {
      login: LIBRARIAN_LOGIN,
      name: 'Security Librarian',
      passwordHash: hash,
      role: 'LIBRARIAN',
      mustChangePassword: false,
      isActive: true,
    },
  })

  // Fazer login e obter os tokens
  const [studentRes, advisorRes, librarianRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ login: STUDENT_LOGIN, password: TEST_PASSWORD }),
    request(app).post('/api/auth/login').send({ login: ADVISOR_LOGIN, password: TEST_PASSWORD }),
    request(app).post('/api/auth/login').send({ login: LIBRARIAN_LOGIN, password: TEST_PASSWORD }),
  ])

  studentToken = studentRes.body.data.token
  advisorToken = advisorRes.body.data.token
  librarianToken = librarianRes.body.data.token

  // Criar uma categoria e um livro de teste
  const category = await prisma.category.upsert({
    where: { slug: 'security-category' },
    update: {},
    create: { name: 'Security Category', slug: 'security-category' },
  })

  const book = await prisma.book.create({
    data: {
      title: 'Livro de Segurança',
      slug: 'livro-de-seguranca',
      filePath: 'https://example.com/sec.pdf',
      categoryId: category.id,
      isPublished: true,
    },
  })
  testBookId = book.id
})

afterAll(async () => {
  // Limpar dados criados
  await prisma.review.deleteMany({
    where: { bookId: testBookId },
  })
  await prisma.book.deleteMany({
    where: { id: testBookId },
  })
  await prisma.category.deleteMany({
    where: { slug: 'security-category' },
  })
  await prisma.user.deleteMany({
    where: { login: { in: [STUDENT_LOGIN, ADVISOR_LOGIN, LIBRARIAN_LOGIN] } },
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('Segurança — 1. Broken Authentication', () => {
  it('rejeita acesso a rotas protegidas sem token JWT', async () => {
    const res = await request(app).get('/api/books')
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toContain('Token de autenticação não fornecido')
  })

  it('rejeita acesso com cabeçalho de autenticação malformado', async () => {
    const res = await request(app)
      .get('/api/books')
      .set('Authorization', 'Basic dXNlcjpwYXNz') // Basic auth em vez de Bearer

    expect(res.status).toBe(401)
    expect(res.body.message).toContain('Token de autenticação não fornecido')
  })

  it('rejeita token assinado com chave secreta diferente/falsa', async () => {
    // Assina um token válido com uma chave qualquer
    const fakeToken = jwt.sign(
      { userId: 'algum-id', login: STUDENT_LOGIN, role: 'STUDENT', name: 'Fake' },
      'chave-secreta-falsa-123',
      { expiresIn: '1h' }
    )

    const res = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${fakeToken}`)

    expect(res.status).toBe(401)
    expect(res.body.message).toContain('Token inválido ou expirado')
  })
})

describe('Segurança — 2. Privilege Escalation / Broken Access Control', () => {
  it('rejeita role STUDENT ao tentar acessar endpoints administrativos de estatísticas', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toContain('permissão para acessar este recurso')
  })

  it('rejeita role STUDENT ao tentar gerenciar categorias', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Nova Categoria Invasora' })

    expect(res.status).toBe(403)
  })

  it('rejeita role STUDENT ao tentar criar livros', async () => {
    const res = await request(app)
      .post('/api/admin/books')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Livro Invasor',
        author: 'Hack',
        category: 'Geral',
        url: 'https://site.com/hack.pdf',
      })

    expect(res.status).toBe(403)
  })

  it('rejeita role LIBRARIAN ao tentar acessar o controle de usuários', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${librarianToken}`)

    expect(res.status).toBe(403)
  })

  it('rejeita role ADVISOR ao tentar gerenciar categorias', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${advisorToken}`)
      .send({ name: 'Categoria por Advisor' })

    expect(res.status).toBe(403)
  })
})

describe('Segurança — 3. Mass Assignment', () => {
  it('rejeita se ADVISOR tentar criar usuário com role privilegiada (ex: DEVELOPER)', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${advisorToken}`)
      .send({
        login: 'novo.dev.invasor@vitest',
        name: 'Invasor Developer',
        role: 'DEVELOPER',
      })

    expect(res.status).toBe(403)
    expect(res.body.message).toContain('permissão para cadastrar alunos')
  })

  it('ignora role privilegiada se ADVISOR tentar atualizar papel de aluno para DEVELOPER', async () => {
    // Criar um aluno de teste comum primeiro
    const hash = await bcrypt.hash('Senha123', 10)
    const aluno = await prisma.user.create({
      data: {
        login: 'aluno.comum.sec@vitest',
        name: 'Aluno Comum Seg',
        passwordHash: hash,
        role: 'STUDENT',
        mustChangePassword: false,
        isActive: true,
      },
    })

    // Tentar atualizar para DEVELOPER como ADVISOR
    const res = await request(app)
      .put(`/api/admin/users/${aluno.id}`)
      .set('Authorization', `Bearer ${advisorToken}`)
      .send({
        login: 'aluno.comum.sec@vitest',
        name: 'Aluno Comum Seg Atualizado',
        role: 'DEVELOPER',
      })

    // Deve falhar com 403 pois ADVISOR não pode passar role != STUDENT
    expect(res.status).toBe(403)
    expect(res.body.message).toContain('não pode alterar o papel de um aluno')

    // Confirmar no banco que o role continua STUDENT
    const dbUser = await prisma.user.findUnique({ where: { id: aluno.id } })
    expect(dbUser?.role).toBe('STUDENT')

    // Limpar o aluno criado
    await prisma.user.delete({ where: { id: aluno.id } })
  })
})

describe('Segurança — 4. Injeção de Código e Sanitização de Entrada', () => {
  it('parametrizada buscas de livros de forma segura contra SQL Injection', async () => {
    // Tenta uma query de injeção clássica contendo aspas simples e comandos SQL
    const sqlInjectionPayload = "' OR '1'='1' --"
    
    const res = await request(app)
      .get(`/api/books?search=${encodeURIComponent(sqlInjectionPayload)}`)
      .set('Authorization', `Bearer ${studentToken}`)

    // Deve retornar 200 normal (não dar crash 500)
    expect(res.status).toBe(200)
    // O Prisma converte isso em uma busca textual exata, resultando em 0 livros correspondentes
    expect(res.body.data.length).toBe(0)
  })

  it('persiste payloads de Script XSS como puro texto sem execução', async () => {
    const xssPayload = "<script>alert('XSS Attack')</script>"

    const res = await request(app)
      .post(`/api/books/${testBookId}/reviews`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        rating: 5,
        comment: xssPayload,
      })

    expect(res.status).toBe(201)

    // A avaliação é salva. Se o moderador aprová-la, ela aparecerá em getBook.
    // Vamos moderar e aprovar a avaliação com a conta de LIBRARIAN
    const reviewId = res.body.data.id
    await request(app)
      .patch(`/api/admin/reviews/${reviewId}/moderate`)
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({ action: 'approve' })

    // Buscar o livro e verificar se o comentário voltou exatamente intacto como texto
    const bookRes = await request(app)
      .get(`/api/books/livro-de-seguranca`)
      .set('Authorization', `Bearer ${studentToken}`)

    expect(bookRes.status).toBe(200)
    const review = bookRes.body.data.reviews.find((r: any) => r.id === reviewId)
    expect(review).toBeDefined()
    expect(review.comment).toBe(xssPayload) // String guardada exatamente como inserida
  })
})

describe('Segurança — 5. Rate Limiting', () => {
  it('bloqueia tentativas sucessivas de login com 429 Too Many Requests', async () => {
    // A configuração do loginLimiter é max: 10 dentro da janela.
    // Faremos 11 tentativas rápidas de login.
    const promises = Array.from({ length: 11 }).map(() =>
      request(app)
        .post('/api/auth/login')
        .send({ login: STUDENT_LOGIN, password: 'senha-errada-qualquer' })
    )

    const responses = await Promise.all(promises)

    // Pelo menos uma das últimas respostas deve ser 429 devido ao rate limit
    const statuses = responses.map((r) => r.status)
    const hasTooManyRequests = statuses.includes(429)

    expect(hasTooManyRequests).toBe(true)
  }, 20000)
})
