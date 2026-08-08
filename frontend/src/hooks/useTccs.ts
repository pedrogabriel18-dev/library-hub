import { useState, useEffect, useCallback } from 'react'
import { TccService, ListTccsParams } from '../services/TccService'
import { TCC, Pagination } from '../types'

export function useTccs(initialParams?: ListTccsParams) {
  const [tccs, setTccs] = useState<TCC[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<ListTccsParams>(initialParams || {})

  const fetchTccs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await TccService.listTccs(params)
      setTccs(response.data || [])
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch {
      setError('Erro ao carregar lista de TCCs.')
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchTccs()
  }, [fetchTccs])

  return {
    tccs,
    pagination,
    isLoading,
    error,
    params,
    setParams,
    refetch: fetchTccs,
  }
}
