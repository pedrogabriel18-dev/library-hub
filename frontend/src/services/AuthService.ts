import api from './api'
import { User, ApiResponse } from '../types'

export interface LoginParams {
  login: string
  password: string
  role: string
}

export interface LoginResult {
  token: string
  user: User
  mustChangePassword: boolean
}

export interface ProfileStatsResponse {
  booksReadCount: number
  tccsAccessedCount: number
  reviewsApprovedCount: number
}

export const AuthService = {
  async login(credentials: LoginParams): Promise<LoginResult> {
    const response = await api.post<ApiResponse<LoginResult>>('/auth/login', credentials)
    if (!response.data.data) {
      throw new Error(response.data.message || 'Falha na autenticação')
    }
    return response.data.data
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me')
    if (!response.data.data) {
      throw new Error(response.data.message || 'Sessão inválida')
    }
    return response.data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout').catch(() => {})
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/password', { currentPassword, newPassword })
  },

  async updateAvatar(avatarId: string | null): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/avatar', { avatarId })
    if (!response.data.data) throw new Error('Erro ao atualizar avatar')
    return response.data.data
  },

  async updateProfileCustomization(bannerType: string, bannerValue: string | null): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/profile-customization', { bannerType, bannerValue })
    if (!response.data.data) throw new Error('Erro ao atualizar perfil')
    return response.data.data
  },

  async getProfileStats(): Promise<ProfileStatsResponse> {
    const response = await api.get<ApiResponse<ProfileStatsResponse>>('/me/profile-stats')
    return response.data.data || { booksReadCount: 0, tccsAccessedCount: 0, reviewsApprovedCount: 0 }
  },
}
