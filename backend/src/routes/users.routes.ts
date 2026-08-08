import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import * as adminUsersCtrl from '../controllers/admin/users.controller'
import { createUserSchema, updateUserSchema } from '../schemas/user.schema'

const router = Router()

router.get('/admin/users', authenticate, authorize('DEVELOPER', 'ADVISOR'), adminUsersCtrl.listUsers)
router.post('/admin/users', authenticate, authorize('DEVELOPER', 'ADVISOR'), validate(createUserSchema), adminUsersCtrl.createUser)
router.put('/admin/users/:userId', authenticate, authorize('DEVELOPER', 'ADVISOR'), validate(updateUserSchema), adminUsersCtrl.updateUser)
router.delete('/admin/users/:userId', authenticate, authorize('DEVELOPER', 'ADVISOR'), adminUsersCtrl.deleteUser)
router.patch('/admin/users/:userId/toggle', authenticate, authorize('DEVELOPER', 'ADVISOR'), adminUsersCtrl.toggleUserActive)
router.post('/admin/users/:userId/reset-password', authenticate, authorize('DEVELOPER', 'ADVISOR'), adminUsersCtrl.resetUserPassword)

export default router
