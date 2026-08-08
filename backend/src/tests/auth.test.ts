import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import app from '../app'
import { prisma } from '../utils/prisma'

const TEST_LOGIN = 'test.auth@vitest'
const TEST_PASSWORD = 'SenhaSegura2026!'

beforeAll(async () => {
  const hash = await bcrypt.hash(TEST_PASSWORD, 10)
  await prisma.user.upsert({
    where: { login: TEST_LOGIN },
    update: {},
    create: {
      login: TEST_LOGIN,
      name: 'Test Auth User',
      passwordHash: hash,
      role: 'STUDENT',
      mustChangePassword: false,
      isActive: true,
    },
  })
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { login: TEST_LOGIN } })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('retorna token com credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: TEST_LOGIN, password: TEST_PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.login).toBe(TEST_LOGIN)
  })

  it('retorna token com credenciais válidas e perfil correto', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: TEST_LOGIN, password: TEST_PASSWORD, role: 'STUDENT' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
  })

  it('retorna 401 com credenciais válidas e perfil incorreto', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: TEST_LOGIN, password: TEST_PASSWORD, role: 'ADVISOR' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
    expect(res.body.message).toBe('O usuário informado não pertence ao perfil selecionado.')
  })

  it('retorna 401 com senha incorreta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: TEST_LOGIN, password: 'senhaerrada' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('retorna 400 sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: TEST_LOGIN })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('retorna 401 para usuário inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: 'naoexiste@test', password: 'qualquercoisa' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  let token: string

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: TEST_LOGIN, password: TEST_PASSWORD })
    token = res.body.data.token
  })

  it('retorna dados do usuário com token válido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.login).toBe(TEST_LOGIN)
  })

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('retorna 401 com token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token-invalido')
    expect(res.status).toBe(401)
  })
})

describe('PUT /api/auth/password', () => {
  const CHANGE_LOGIN = 'test.changepass@vitest'
  let token: string

  beforeAll(async () => {
    const hash = await bcrypt.hash('SenhaAntiga!', 10)
    await prisma.user.upsert({
      where: { login: CHANGE_LOGIN },
      update: { passwordHash: hash, mustChangePassword: false },
      create: {
        login: CHANGE_LOGIN,
        name: 'Change Pass Test',
        passwordHash: hash,
        role: 'STUDENT',
        mustChangePassword: false,
        isActive: true,
      },
    })
    const res = await request(app)
      .post('/api/auth/login')
      .send({ login: CHANGE_LOGIN, password: 'SenhaAntiga!' })
    token = res.body.data.token
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { login: CHANGE_LOGIN } })
  })

  it('altera senha com dados corretos', async () => {
    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'SenhaAntiga!', newPassword: 'NovaSenha2026!' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('rejeita senha atual incorreta', async () => {
    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'senhaerrada', newPassword: 'NovaSenha2026!' })

    expect(res.status).toBe(401)
  })

  it('rejeita nova senha muito curta', async () => {
    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'SenhaAntiga!', newPassword: '123' })

    expect(res.status).toBe(400)
  })
})
