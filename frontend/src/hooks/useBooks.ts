import { useState, useEffect, useCallback } from 'react'
import { BookService, ListBooksParams } from '../services/BookService'
import { Book, Pagination } from '../types'

export function useBooks(initialParams?: ListBooksParams) {
  const [books, setBooks] = useState<Book[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<ListBooksParams>(initialParams || {})

  const fetchBooks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await BookService.listBooks(params)
      setBooks(response.data || [])
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch {
      setError('Erro ao carregar lista de livros.')
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  return {
    books,
    pagination,
    isLoading,
    error,
    params,
    setParams,
    refetch: fetchBooks,
  }
}
