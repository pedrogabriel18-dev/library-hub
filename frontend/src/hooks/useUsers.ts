import { useState, useEffect, useCallback } from 'react'
import { UserService, ListUsersParams } from '../services/UserService'
import { User } from '../types'

export function useUsers(initialParams?: ListUsersParams) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<ListUsersParams>(initialParams || { limit: 1000 })

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await UserService.listUsers(params)
      setUsers(data)
    } catch {
      setError('Erro ao carregar a lista de usuários.')
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const toggleActive = async (userId: string, currentActive: boolean) => {
    try {
      await UserService.toggleUserActive(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentActive } : u))
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao alterar status do usuário.')
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await UserService.deleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao excluir usuário.')
    }
  }

  return {
    users,
    isLoading,
    error,
    params,
    setParams,
    refetch: fetchUsers,
    toggleActive,
    deleteUser,
  }
}
