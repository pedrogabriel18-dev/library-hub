import { Router } from 'express'
import { authenticate } from '../middlewares/auth.middleware'
import * as booksCtrl from '../controllers/books.controller'

const router = Router()

router.get('/', authenticate, booksCtrl.listBooks)
router.get('/:slug', authenticate, booksCtrl.getBook)
router.get('/:slug/download', authenticate, booksCtrl.downloadBook)
router.post('/:bookId/progress', authenticate, booksCtrl.saveProgress)
router.post('/:bookId/favorite', authenticate, booksCtrl.toggleFavorite)

export default router
