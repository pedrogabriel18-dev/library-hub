import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload, UserRole } from '../types'
import { isTokenBlacklisted } from '../utils/cache'
import { trackAccessFailure } from '../utils/logger'

// Estende o Request do Express com o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticação não fornecido.',
    })
  }

  const token = authHeader.split(' ')[1]

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      message: 'Token revogado (sessão finalizada).',
    })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = payload
    next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado.',
    })
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' })
    }

    if (!roles.includes(req.user.role)) {
      trackAccessFailure(req.ip, 'AUTHORIZATION')
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso.',
      })
    }

    next()
  }
}
