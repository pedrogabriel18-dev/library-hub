import api from './api'
import { Book, PaginatedApiResponse, ApiResponse } from '../types'

export interface ListBooksParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  sort?: string
}

export const BookService = {
  async listBooks(params?: ListBooksParams): Promise<PaginatedApiResponse<Book[]>> {
    const response = await api.get<PaginatedApiResponse<Book[]>>('/books', { params })
    return response.data
  },

  async getBookBySlug(slug: string): Promise<Book> {
    const response = await api.get<ApiResponse<Book>>(`/books/${slug}`)
    if (!response.data.data) throw new Error('Livro não encontrado')
    return response.data.data
  },

  async saveProgress(bookId: string, currentPage: number, totalPages?: number): Promise<void> {
    await api.post(`/books/${bookId}/progress`, { currentPage, totalPages })
  },

  async toggleFavorite(bookId: string): Promise<{ isFavorited: boolean }> {
    const response = await api.post<ApiResponse<{ isFavorited: boolean }>>(`/books/${bookId}/favorite`)
    return response.data.data || { isFavorited: false }
  },

  async getFavorites(): Promise<Book[]> {
    const response = await api.get<ApiResponse<Book[]>>('/me/favorites')
    return response.data.data || []
  },

  async getHistory(): Promise<(Book & { accessedAt: string })[]> {
    const response = await api.get<ApiResponse<(Book & { accessedAt: string })[]>>('/me/history')
    return response.data.data || []
  },

  async createBook(data: Partial<Book>): Promise<Book> {
    const response = await api.post<ApiResponse<Book>>('/admin/books', data)
    if (!response.data.data) throw new Error('Erro ao criar livro')
    return response.data.data
  },

  async updateBook(id: string, data: Partial<Book>): Promise<Book> {
    const response = await api.put<ApiResponse<Book>>(`/admin/books/${id}`, data)
    if (!response.data.data) throw new Error('Erro ao atualizar livro')
    return response.data.data
  },

  async deleteBook(id: string): Promise<void> {
    await api.delete(`/admin/books/${id}`)
  },
}
