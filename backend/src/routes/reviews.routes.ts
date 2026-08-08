import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import * as reviewsCtrl from '../controllers/reviews.controller'

const router = Router()

router.post('/books/:bookId/reviews', authenticate, authorize('STUDENT'), reviewsCtrl.submitReview)
router.get('/admin/reviews/pending', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), reviewsCtrl.getPendingReviews)
router.get('/admin/reviews', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), reviewsCtrl.getReviewsFiltered)
router.patch('/admin/reviews/:reviewId/moderate', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), reviewsCtrl.moderateReview)
router.delete('/admin/reviews/:reviewId', authenticate, authorize('LIBRARIAN', 'DEVELOPER', 'ADVISOR'), reviewsCtrl.deleteReview)

export default router
