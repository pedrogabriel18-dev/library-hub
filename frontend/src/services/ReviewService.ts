import api from './api'
import { Review, ApiResponse } from '../types'

export interface SubmitReviewParams {
  bookId: string
  rating: number
  comment?: string
}

export interface ReviewFilterParams {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  bookId?: string
  studentSearch?: string
  date?: string
}

export const ReviewService = {
  async submitReview(data: SubmitReviewParams): Promise<Review> {
    const response = await api.post<ApiResponse<Review>>(`/books/${data.bookId}/reviews`, data)
    if (!response.data.data) throw new Error('Erro ao enviar avaliação')
    return response.data.data
  },

  async getPendingReviews(): Promise<Review[]> {
    const response = await api.get<ApiResponse<Review[]>>('/admin/reviews/pending')
    return response.data.data || []
  },

  async getReviewsFiltered(params: ReviewFilterParams): Promise<Review[]> {
    const response = await api.get<ApiResponse<Review[]>>('/admin/reviews', { params })
    return response.data.data || []
  },

  async moderateReview(reviewId: string, action: 'approve' | 'reject', rejectionReason?: string): Promise<void> {
    await api.patch(`/admin/reviews/${reviewId}/moderate`, { action, rejectionReason })
  },

  async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`/admin/reviews/${reviewId}`)
  },
}
