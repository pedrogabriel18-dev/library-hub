import api from './api'
import { ApiResponse } from '../types'

export interface AppNotification {
  id: string
  userId: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const NotificationService = {
  async listNotifications(): Promise<AppNotification[]> {
    const response = await api.get<ApiResponse<AppNotification[]>>('/notifications')
    return response.data.data || []
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all')
  },
}
