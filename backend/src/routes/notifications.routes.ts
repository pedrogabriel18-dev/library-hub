import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import * as notificationsCtrl from '../controllers/notifications.controller'

const router = Router()

router.get('/notifications', authenticate, notificationsCtrl.listNotifications)
router.patch('/notifications/:notificationId/read', authenticate, notificationsCtrl.markAsRead)
router.patch('/notifications/read-all', authenticate, notificationsCtrl.markAllAsRead)

export default router
