import { Request, Response } from 'express'
import { prisma } from '../utils/prisma'
import { asyncHandler } from '../utils/asyncHandler'

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return res.json({ success: true, data: notifications })
})

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { notificationId } = req.params
  const userId = req.user!.userId

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notification || notification.userId !== userId) {
    return res.status(404).json({ success: false, message: 'Notificação não encontrada.' })
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })

  return res.json({ success: true, message: 'Notificação marcada como lida.' })
})

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  })

  return res.json({ success: true, message: 'Todas as notificações foram marcadas como lidas.' })
})
