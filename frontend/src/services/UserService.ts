import api from './api'
import { User, ApiResponse } from '../types'

export interface ListUsersParams {
  search?: string
  limit?: number
  role?: string
  turma?: string
}

export interface CreateUserData {
  name: string
  login: string
  role: string
  password?: string
  turma?: string
  curso?: string
}

export const UserService = {
  async listUsers(params?: ListUsersParams): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/admin/users', { params })
    return response.data.data || []
  },

  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/admin/users', data)
    if (!response.data.data) throw new Error('Erro ao criar usuário')
    return response.data.data
  },

  async updateUser(userId: string, data: Partial<CreateUserData>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}`, data)
    if (!response.data.data) throw new Error('Erro ao atualizar usuário')
    return response.data.data
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`)
  },

  async toggleUserActive(userId: string): Promise<void> {
    await api.patch(`/admin/users/${userId}/toggle`)
  },

  async resetUserPassword(userId: string, password?: string): Promise<void> {
    await api.post(`/admin/users/${userId}/reset-password`, { password })
  },
}
