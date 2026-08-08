import { useState, useEffect, useCallback } from 'react'
import { ReviewService, ReviewFilterParams } from '../services/ReviewService'
import { Review } from '../types'

export function useReviews(initialParams?: ReviewFilterParams) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<ReviewFilterParams>(initialParams || { status: 'PENDING' })

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await ReviewService.getReviewsFiltered(params)
      setReviews(data)
    } catch {
      setError('Erro ao carregar a lista de avaliações.')
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const approveReview = async (reviewId: string) => {
    await ReviewService.moderateReview(reviewId, 'approve')
    setReviews(prev => prev.filter(r => r.id !== reviewId))
  }

  const rejectReview = async (reviewId: string, rejectionReason: string) => {
    await ReviewService.moderateReview(reviewId, 'reject', rejectionReason)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
  }

  const deleteReview = async (reviewId: string) => {
    await ReviewService.deleteReview(reviewId)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
  }

  return {
    reviews,
    isLoading,
    error,
    params,
    setParams,
    refetch: fetchReviews,
    approveReview,
    rejectReview,
    deleteReview,
  }
}
