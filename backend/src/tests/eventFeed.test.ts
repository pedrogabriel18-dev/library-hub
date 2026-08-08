import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import app from '../app'
import { prisma } from '../utils/prisma'
import { registerEvent } from '../utils/eventFeed'

let studentToken: string
const TEST_USER_LOGIN = 'test.eventfeed@vitest'

beforeAll(async () => {
  // Limpeza preventiva de execuções anteriores
  await prisma.eventFeed.deleteMany()
  await prisma.user.deleteMany({ where: { login: TEST_USER_LOGIN } })

  // Cria usuário de teste
  const hash = await bcrypt.hash('Password123!', 10)
  await prisma.user.create({
    data: {
      login: TEST_USER_LOGIN,
      name: 'EventFeed Tester',
      passwordHash: hash,
      role: 'STUDENT',
      mustChangePassword: false,
      isActive: true,
    },
  })

  // Login para obter token
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ login: TEST_USER_LOGIN, password: 'Password123!' })
  studentToken = loginRes.body.data.token
})

afterAll(async () => {
  // Limpeza final
  await prisma.eventFeed.deleteMany()
  await prisma.user.deleteMany({ where: { login: TEST_USER_LOGIN } })
})

describe('Event Feed & Toasts Procedurais', () => {
  it('registra eventos corretamente via utilitário registerEvent', async () => {
    const event = await registerEvent('NEW_BOOK', {
      title: 'O Guarani',
      slug: 'o-guarani',
      authorName: 'José de Alencar',
      coverImage: '/covers/o-guarani.jpg'
    })

    expect(event).not.toBeNull()
    expect(event!.type).toBe('NEW_BOOK')
    expect(event!.category).toBe('Livro')
    expect(event!.title).toBe('📘 Novo livro disponível')
    expect(event!.description).toContain('O Guarani')
    expect(event!.priority).toBe(3)
  })

  it('retorna os eventos ordenados por prioridade (DESC) e tempo (ASC) - FIFO', async () => {
    // Limpa a tabela para termos um teste determinístico
    await prisma.eventFeed.deleteMany()

    // 1. Evento de prioridade baixa (NEW_USER - Priority 1) - Criado primeiro
    await registerEvent('NEW_USER', { name: 'João Silva' })

    // 2. Evento de prioridade alta (NEW_BOOK - Priority 3) - Criado depois
    await registerEvent('NEW_BOOK', {
      title: 'Livro A',
      slug: 'livro-a',
      authorName: 'Autor A'
    })

    // 3. Evento de prioridade alta (NEW_TCC - Priority 3) - Criado depois do Livro A
    await registerEvent('NEW_TCC', {
      title: 'TCC B',
      slug: 'tcc-b',
      authorName: 'Autor B'
    })

    const res = await request(app)
      .get('/api/activities')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.length).toBe(3)

    // O primeiro da lista deve ser o de maior prioridade (Priority 3) e o mais antigo (Livro A antes de TCC B)
    expect(res.body.data[0].type).toBe('new_book')
    expect(res.body.data[0].title).toBe('📘 Novo livro disponível')

    // O segundo deve ser o TCC B (Priority 3, mas criado depois do Livro A)
    expect(res.body.data[1].type).toBe('new_tcc')
    expect(res.body.data[1].title).toBe('🎓 Novo TCC disponível')

    // O terceiro deve ser o usuário João Silva (Priority 1)
    expect(res.body.data[2].type).toBe('new_user')
  })

  it('não retorna eventos expirados', async () => {
    await prisma.eventFeed.deleteMany()

    // Evento válido
    await registerEvent('NEW_USER', { name: 'Válido' })

    // Evento expirado (criamos direto no prisma para forçar expiracao no passado)
    await prisma.eventFeed.create({
      data: {
        type: 'PROFILE_UPDATE',
        category: 'Usuário',
        title: 'Expirado',
        description: 'Expirado',
        priority: 1,
        expiresAt: new Date(Date.now() - 1000) // expira 1s atrás
      }
    })

    const res = await request(app)
      .get('/api/activities')
      .set('Authorization', `Bearer ${studentToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBe(1)
    expect(res.body.data[0].userName).toBe('👤 Novo aluno cadastrado')
  })
})
