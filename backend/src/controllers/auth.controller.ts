import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { prisma } from '../utils/prisma'
import { JwtPayload } from '../types'
import { registerEvent } from '../utils/eventFeed'
import { blacklistToken } from '../utils/cache'
import { trackAccessFailure } from '../utils/logger'

export async function login(req: Request, res: Response) {
  const { login, password, role } = req.body

  if (!login || !password) {
    return res.status(400).json({
      success: false,
      message: 'Login e senha são obrigatórios.',
    })
  }

  const user = await prisma.user.findUnique({ where: { login } })

  if (!user || !user.isActive) {
    trackAccessFailure(req.ip, 'LOGIN')
    return res.status(401).json({
      success: false,
      message: 'Usuário ou senha inválidos.',
    })
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)

  if (!passwordMatch) {
    // Log de tentativa falha
    await prisma.log.create({
      data: {
        action: 'LOGIN_FAILED',
        description: `Tentativa de login falha para: ${login}`,
        ipAddress: req.ip,
      },
    })

    trackAccessFailure(req.ip, 'LOGIN')

    return res.status(401).json({
      success: false,
      message: 'Usuário ou senha inválidos.',
    })
  }

  if (role && user.role !== role) {
    trackAccessFailure(req.ip, 'LOGIN')

    return res.status(401).json({
      success: false,
      message: 'O usuário informado não pertence ao perfil selecionado.',
    })
  }

  const payload: JwtPayload = {
    userId: user.id,
    login: user.login,
    role: user.role as JwtPayload['role'],
    name: user.name,
  }

  const signOptions: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as SignOptions['expiresIn'],
  }
  const token = jwt.sign(payload, process.env.JWT_SECRET!, signOptions)

  // Log de login bem-sucedido
  await prisma.log.create({
    data: {
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      description: `Login realizado com sucesso.`,
      ipAddress: req.ip,
    },
  })

  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        role: user.role,
        avatarId: user.avatarId,
        bannerType: user.bannerType,
        bannerValue: user.bannerValue,
        turma: user.turma,
        curso: user.curso,
        mustChangePassword: user.mustChangePassword,
      },
    },
  })
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body
  const userId = req.user!.userId

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: 'A nova senha é obrigatória.',
    })
  }

  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)

  if (newPassword.length < 8 || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return res.status(400).json({
      success: false,
      message: 'A nova senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.',
    })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado.' })
  }

  // Só exige e valida a senha atual se o usuário NÃO estiver forçado a alterar (não for o primeiro login)
  if (!user.mustChangePassword) {
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'A senha atual é obrigatória.',
      })
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash)

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta.',
      })
    }
  }

  const newHash = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash, mustChangePassword: false },
  })

  await prisma.log.create({
    data: {
      userId,
      action: 'PASSWORD_CHANGED',
      description: 'Senha alterada com sucesso.',
      ipAddress: req.ip,
    },
  })

  return res.json({ success: true, message: 'Senha alterada com sucesso.' })
}

export async function updateAvatar(req: Request, res: Response) {
  const { avatarId } = req.body
  const userId = req.user!.userId

  if (!avatarId) {
    return res.status(400).json({ success: false, message: 'avatarId é obrigatório.' })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatarId },
  })

  // Registra no Event Feed
  await registerEvent('PROFILE_UPDATE', {
    name: req.user!.name,
    action: 'avatar',
  })

  return res.json({ success: true, message: 'Avatar atualizado.' })
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      login: true,
      name: true,
      role: true,
      avatarId: true,
      bannerType: true,
      bannerValue: true,
      turma: true,
      curso: true,
      mustChangePassword: true,
      createdAt: true,
    },
  })

  if (!user) {
    return res.status(404).json({ success: false, message: 'Usuário não encontrado.' })
  }

  return res.json({ success: true, data: user })
}

export async function updateProfileCustomization(req: Request, res: Response) {
  const { avatarId, bannerType, bannerValue } = req.body
  const userId = req.user!.userId

  const updateData: any = {}
  if (avatarId !== undefined) updateData.avatarId = avatarId
  if (bannerType !== undefined) updateData.bannerType = bannerType
  if (bannerValue !== undefined) updateData.bannerValue = bannerValue

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  })

  // Determina a ação customizada para o feed
  let actionName = 'perfil'
  if (bannerType !== undefined || bannerValue !== undefined) {
    actionName = 'banner'
  } else if (avatarId !== undefined) {
    actionName = 'avatar'
  }

  // Registra no Event Feed
  await registerEvent('PROFILE_UPDATE', {
    name: req.user!.name,
    action: actionName,
  })

  return res.json({ success: true, message: 'Personalização do perfil atualizada com sucesso.' })
}

export async function getProfileStats(req: Request, res: Response) {
  try {
    const userId = req.user!.userId

    const booksReadCount = await prisma.readingProgress.count({
      where: { userId, isFinished: true }
    })

    const tccsAccessedCount = await prisma.log.count({
      where: { userId, action: 'TCC_ACCESSED' }
    })

    const reviewsApprovedCount = await prisma.review.count({
      where: { userId, status: 'APPROVED' }
    })

    return res.json({
      success: true,
      data: {
        booksReadCount,
        tccsAccessedCount,
        reviewsApprovedCount
      }
    })
  } catch (error) {
    console.error('Erro ao carregar estatísticas do perfil:', error)
    return res.status(500).json({ success: false, message: 'Erro ao carregar estatísticas.' })
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const userId = req.user?.userId
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      try {
        const decoded = jwt.decode(token) as any
        // Calcula tempo restante do token para TTL no cache de blacklist
        const exp = decoded?.exp ? decoded.exp * 1000 : Date.now() + 8 * 60 * 60 * 1000
        const ttl = Math.max(0, exp - Date.now())
        blacklistToken(token, ttl)
      } catch (err) {
        console.warn('Erro ao decodificar JWT no logout para blacklist:', err)
      }
    }

    if (userId) {
      await prisma.log.create({
        data: {
          userId,
          action: 'LOGOUT',
          description: 'Logout realizado com sucesso.',
          ipAddress: req.ip,
        },
      })
    }
    return res.json({ success: true, message: 'Logout registrado com sucesso.' })
  } catch (error) {
    console.error('Erro ao registrar logout:', error)
    return res.status(500).json({ success: false, message: 'Erro ao processar logout.' })
  }
}
