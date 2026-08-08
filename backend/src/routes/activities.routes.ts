import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import * as activitiesCtrl from '../controllers/activities.controller'
import * as statsCtrl from '../controllers/admin/stats.controller'

const router = Router()

router.get('/activities', authenticate, activitiesCtrl.getActivities)
router.get('/stats/trending-by-turma', authenticate, statsCtrl.getTrendingByTurma)

export default router
