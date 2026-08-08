import { Router } from 'express'
import authRoutes from './auth.routes'
import booksRoutes from './books.routes'
import tccsRoutes from './tccs.routes'
import reviewsRoutes from './reviews.routes'
import usersRoutes from './users.routes'
import notificationsRoutes from './notifications.routes'
import activitiesRoutes from './activities.routes'
import adminRoutes from './admin.routes'
import * as authCtrl from '../controllers/auth.controller'
import * as booksCtrl from '../controllers/books.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Favoritos e histórico do próprio usuário
router.get('/me/favorites', authenticate, booksCtrl.getFavorites)
router.get('/me/history', authenticate, booksCtrl.getHistory)
router.get('/me/profile-stats', authenticate, authCtrl.getProfileStats)

// Sub-roteadores desacoplados por módulo
router.use('/auth', authRoutes)
router.use('/books', booksRoutes)
router.use('/tccs', tccsRoutes)
router.use('/', reviewsRoutes)
router.use('/', usersRoutes)
router.use('/', notificationsRoutes)
router.use('/', activitiesRoutes)
router.use('/', adminRoutes)

export default router
