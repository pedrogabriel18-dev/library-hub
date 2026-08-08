import api from './api'
import { ApiResponse } from '../types'

export interface ActivityEvent {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
}

export const ActivityService = {
  async getActivities(): Promise<ActivityEvent[]> {
    const response = await api.get<ApiResponse<ActivityEvent[]>>('/activities')
    return response.data.data || []
  },
}
