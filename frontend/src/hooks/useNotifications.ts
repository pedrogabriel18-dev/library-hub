import { useState, useEffect, useCallback } from 'react'
import { NotificationService, AppNotification } from '../services/NotificationService'

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await NotificationService.listNotifications()
      setNotifications(data)
    } catch {
      // Falha silenciosa para não quebrar a navegação
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {
      // Ignora erro
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      // Ignora erro
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
