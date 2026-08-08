import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import * as tccsCtrl from '../controllers/tccs.controller'

const router = Router()

router.get('/', authenticate, tccsCtrl.listTCCs)
router.get('/:slug', authenticate, tccsCtrl.getTCC)

export default router
