import { useEffect, useState } from 'react'
import { Search, BookOpen, X } from 'lucide-react'
import api from '../../services/api'
import { Book } from '../../types'
import styles from './BooksPage.module.css'
import { BookCard } from '../../components/common/BookCard'
import { SkeletonGrid } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)

  // Controle de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => fetchBooks(), search ? 350 : 0)
    return () => clearTimeout(timer)
  }, [search, currentPage])

  async function fetchBooks() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('page', String(currentPage))
      params.set('limit', '100')
      const { data } = await api.get(`/books?${params}`)
      setBooks(data.data || [])
      setTotalItems(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch {
      setBooks([])
      setTotalItems(0)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerBadge}>
          <BookOpen size={16} /> Catálogo Digital
        </div>
        <h1 className={styles.headerTitle}>Livros</h1>
        <p className={styles.headerSubtitle}>
          Explore nosso acervo de livros digitais.
        </p>
      </header>

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            id="books-search"
            placeholder="Pesquisar por título, autor ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
            autoComplete="off"
          />
          {search && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearch('')}
              aria-label="Limpar pesquisa"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {!isLoading && (
          <span className={styles.resultsCount}>
            {totalItems} {totalItems === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
      </div>

      {/* ── Grid de livros ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum livro encontrado"
          description={
            search
              ? `Não encontramos resultados para "${search}". Tente buscar por outro termo.`
              : 'O catálogo de livros está vazio no momento.'
          }
          actionLabel={search ? 'Limpar pesquisa' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <>
          {search ? (
            // Com busca ativa: grid simples
            <div className={styles.grid}>
              {books.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          ) : (
            // Sem busca: agrupado por categoria
            <div>
              {Object.entries(
                books.reduce<Record<string, Book[]>>((acc, book) => {
                  const cat = book.category?.name || 'Geral'
                  if (!acc[cat]) acc[cat] = []
                  acc[cat].push(book)
                  return acc
                }, {})
              )
                .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
                .map(([category, catBooks]) => (
                  <section key={category} className={styles.categorySection}>
                    <div className={styles.categoryHeader}>
                      <h2 className={styles.categoryTitle}>{category}</h2>
                      <span className={styles.categoryCount}>{catBooks.length}</span>
                      <div className={styles.categoryDivider} />
                    </div>
                    <div className={styles.grid}>
                      {catBooks.map((book, i) => (
                        <BookCard key={book.id} book={book} index={i} />
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className={styles.pageInfo}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
