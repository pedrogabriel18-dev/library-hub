import api from './api'
import { TCC, PaginatedApiResponse, ApiResponse } from '../types'

export interface ListTccsParams {
  page?: number
  limit?: number
  search?: string
  course?: string
  year?: number
  sort?: string
}

export const TccService = {
  async listTccs(params?: ListTccsParams): Promise<PaginatedApiResponse<TCC[]>> {
    const response = await api.get<PaginatedApiResponse<TCC[]>>('/tccs', { params })
    return response.data
  },

  async getTccBySlug(slug: string): Promise<TCC> {
    const response = await api.get<ApiResponse<TCC>>(`/tccs/${slug}`)
    if (!response.data.data) throw new Error('TCC não encontrado')
    return response.data.data
  },

  async createTcc(data: Partial<TCC>): Promise<TCC> {
    const response = await api.post<ApiResponse<TCC>>('/admin/tccs', data)
    if (!response.data.data) throw new Error('Erro ao criar TCC')
    return response.data.data
  },

  async updateTcc(id: string, data: Partial<TCC>): Promise<TCC> {
    const response = await api.put<ApiResponse<TCC>>(`/admin/tccs/${id}`, data)
    if (!response.data.data) throw new Error('Erro ao atualizar TCC')
    return response.data.data
  },

  async deleteTcc(id: string): Promise<void> {
    await api.delete(`/admin/tccs/${id}`)
  },
}
