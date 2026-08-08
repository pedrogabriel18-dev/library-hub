import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import * as authCtrl from '../controllers/auth.controller'

const router = Router()

router.post('/login', authCtrl.login)
router.post('/logout', authenticate, authCtrl.logout)
router.get('/me', authenticate, authCtrl.me)
router.put('/password', authenticate, authCtrl.changePassword)
router.put('/avatar', authenticate, authCtrl.updateAvatar)
router.put('/profile-customization', authenticate, authCtrl.updateProfileCustomization)

export default router
