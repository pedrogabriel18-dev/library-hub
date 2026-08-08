import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { asyncHandler } from '../../utils/asyncHandler'

const DEFAULT_USER_PAGE_SIZE = 20

/**
 * Lista usuários com paginação e filtros opcionais. (#8)
 * ADVISORs só veem alunos; DEVELOPERs veem todos.
 */
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, search, page = '1', limit = String(DEFAULT_USER_PAGE_SIZE) } = req.query
  const requesterRole = req.user!.role

  const pageNum = Math.max(1, parseInt(page as string))
  const limitNum = Math.min(1000, parseInt(limit as string))
  const skip = (pageNum - 1) * limitNum

  const where: Record<string, unknown> = {}

  // ADVISOR só pode ver alunos
  if (requesterRole === 'ADVISOR') {
    where.role = 'STUDENT'
  } else if (role) {
    where.role = role
  }

  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { login: { contains: search as string } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, login: true, name: true,
        role: true, avatarId: true, isActive: true, createdAt: true,
        turma: true, curso: true,
      },
      orderBy: { name: 'asc' },
      skip,
      take: limitNum,
    }),
    prisma.user.count({ where }),
  ])

  return res.json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  })
})

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { login, name, role, password, turma, curso } = req.body
  const requesterRole = req.user!.role
  const requesterId = req.user!.userId

  let finalRole = role || 'STUDENT'
  if (requesterRole === 'ADVISOR' && finalRole !== 'STUDENT') {
    return res.status(403).json({ success: false, message: 'Você só tem permissão para cadastrar alunos.' })
  }

  const existing = await prisma.user.findUnique({ where: { login } })
  if (existing) {
    return res.status(409).json({ success: false, message: 'Este login já está em uso.' })
  }

  // Usa senha fornecida ou a senha padrão da variável de ambiente (#2)
  const rawPassword = password || process.env.DEFAULT_PASSWORD || 'Ler@2026'
  const passwordHash = await bcrypt.hash(rawPassword, 10)

  const newUser = await prisma.user.create({
    data: { login, name, role: finalRole, passwordHash, mustChangePassword: true, isActive: true, turma, curso },
  })

  await prisma.log.create({
    data: {
      userId: requesterId,
      action: 'USER_CREATED',
      description: `Usuário criado: ${name} (${finalRole})`,
      metadata: JSON.stringify({ createdUserId: newUser.id, role: finalRole }),
    },
  })

  return res.status(201).json({
    success: true,
    data: {
      id: newUser.id, login: newUser.login, name: newUser.name,
      role: newUser.role, isActive: newUser.isActive, createdAt: newUser.createdAt,
      turma: newUser.turma, curso: newUser.curso,
    },
  })
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params
  const { login, name, role, turma, curso } = req.body
  const requesterRole = req.user!.role
  const requesterId = req.user!.userId

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado.' })
  }

  if (requesterRole === 'ADVISOR') {
    if (user.role !== 'STUDENT') {
      return res.status(403).json({ success: false, message: 'Você só pode editar dados de alunos.' })
    }
    if (role && role !== 'STUDENT') {
      return res.status(403).json({ success: false, message: 'Você não pode alterar o papel de um aluno.' })
    }
  }

  const loginConflict = await prisma.user.findFirst({ where: { login, id: { not: userId } } })
  if (loginConflict) {
    return res.status(409).json({ success: false, message: 'Este login já está em uso por outro usuário.' })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      login,
      name,
      // Apenas DEVELOPER pode alterar o role
      role: requesterRole === 'DEVELOPER' && role ? role : user.role,
      turma,
      curso,
    },
  })

  await prisma.log.create({
    data: {
      userId: requesterId,
      action: 'USER_UPDATED',
      description: `Dados de usuário atualizados: ${name}`,
      metadata: JSON.stringify({ targetUserId: userId }),
    },
  })

  return res.json({
    success: true,
    data: { id: updated.id, login: updated.login, name: updated.name, role: updated.role, isActive: updated.isActive, turma: updated.turma, curso: updated.curso },
  })
})

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params
  const requesterRole = req.user!.role
  const requesterId = req.user!.userId

  if (userId === requesterId) {
    return res.status(400).json({ success: false, message: 'Você não pode excluir sua própria conta.' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado.' })
  }

  if (requesterRole === 'ADVISOR' && user.role !== 'STUDENT') {
    return res.status(403).json({ success: false, message: 'Você só pode excluir contas de alunos.' })
  }

  await prisma.user.delete({ where: { id: userId } })

  await prisma.log.create({
    data: {
      userId: requesterId,
      action: 'USER_DELETED',
      description: `Usuário excluído: ${user.name} (${user.role})`,
      metadata: JSON.stringify({ deletedUserId: userId }),
    },
  })

  return res.json({ success: true, message: 'Usuário excluído com sucesso.' })
})

export const toggleUserActive = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params
  const requesterId = req.user!.userId
  const requesterRole = req.user!.role

  if (userId === requesterId) {
    return res.status(400).json({ success: false, message: 'Você não pode desativar sua própria conta.' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado.' })
  }

  if (requesterRole === 'ADVISOR' && user.role !== 'STUDENT') {
    return res.status(403).json({ success: false, message: 'Você só pode ativar/desativar contas de alunos.' })
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } })

  await prisma.log.create({
    data: {
      userId: requesterId,
      action: user.isActive ? 'USER_DEACTIVATED' : 'USER_ACTIVATED',
      description: `Usuário ${user.name} ${user.isActive ? 'desativado' : 'ativado'}.`,
      metadata: JSON.stringify({ targetUserId: userId }),
    },
  })

  return res.json({
    success: true,
    message: `Usuário ${user.isActive ? 'desativado' : 'ativado'} com sucesso.`,
  })
})

export const resetUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params
  const { password } = req.body
  const requesterRole = req.user!.role
  const requesterId = req.user!.userId

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado.' })
  }

  if (requesterRole === 'ADVISOR' && user.role !== 'STUDENT') {
    return res.status(403).json({ success: false, message: 'Você só pode redefinir a senha de alunos.' })
  }

  // Usa senha fornecida ou a senha padrão da variável de ambiente (#2)
  const rawPassword = password || process.env.DEFAULT_PASSWORD || 'Ler@2026'
  const passwordHash = await bcrypt.hash(rawPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: true },
  })

  await prisma.log.create({
    data: {
      userId: requesterId,
      action: 'USER_PASSWORD_RESET',
      description: `Senha do usuário ${user.name} redefinida.`,
      metadata: JSON.stringify({ targetUserId: userId }),
    },
  })

  return res.json({ success: true, message: 'Senha redefinida com sucesso para o padrão temporário.' })
})
