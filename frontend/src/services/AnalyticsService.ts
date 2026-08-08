import api from './api'
import { DashboardStats, ApiResponse, Book, TCC } from '../types'

export interface TrendingByTurmaResponse {
  turma: string
  books: Book[]
  tccs: TCC[]
}

export const AnalyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/stats')
    if (!response.data.data) throw new Error('Erro ao carregar estatísticas do painel')
    return response.data.data
  },

  async getTrendingByTurma(turma: string): Promise<TrendingByTurmaResponse> {
    const response = await api.get<ApiResponse<TrendingByTurmaResponse>>(`/stats/trending-by-turma?turma=${encodeURIComponent(turma)}`)
    return response.data.data || { turma, books: [], tccs: [] }
  },
}
