import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, GraduationCap, ArrowRight, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { BookService } from '@/services/BookService'
import { TccService } from '@/services/TccService'
import { Book, TCC } from '@/types'
import styles from './SearchModal.module.css'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} style={{ background: 'var(--accent-subtle)', color: 'var(--text-primary)', borderRadius: '2px', padding: '0 2px' }}>
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [books, setBooks] = useState<Book[]>([])
  const [tccs, setTccs] = useState<TCC[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setBooks([])
      setTccs([])
    }
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setBooks([])
      setTccs([])
      return
    }

    setIsLoading(true)
    Promise.all([
      BookService.listBooks({ search: debouncedQuery, limit: 4 }).catch(() => ({ data: [] })),
      TccService.listTccs({ search: debouncedQuery, limit: 4 }).catch(() => ({ data: [] })),
    ])
      .then(([booksRes, tccsRes]) => {
        setBooks(booksRes.data || [])
        setTccs(tccsRes.data || [])
      })
      .finally(() => setIsLoading(false))
  }, [debouncedQuery])

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.searchHeader}>
          <Search size={20} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Pesquisar por livros, autores, TCCs ou temas..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className={styles.shortcutBadge}>ESC</span>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.resultsList}>
          {isLoading && <div className={styles.emptyText}>Pesquisando no acervo...</div>}

          {!isLoading && query && books.length === 0 && tccs.length === 0 && (
            <div className={styles.emptyText}>Nenhum resultado encontrado para "{query}"</div>
          )}

          {!isLoading && books.map(book => (
            <Link
              key={book.id}
              to={`/livros/${book.slug}`}
              className={styles.resultItem}
              onClick={onClose}
            >
              <div className={styles.itemIcon}>
                <BookOpen size={18} />
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemTitle}>{highlightMatch(book.title, query)}</div>
                <div className={styles.itemSub}>{book.category?.name || 'Livro Digital'}</div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </Link>
          ))}

          {!isLoading && tccs.map(tcc => (
            <Link
              key={tcc.id}
              to={`/tccs/${tcc.slug}`}
              className={styles.resultItem}
              onClick={onClose}
            >
              <div className={styles.itemIcon} style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <GraduationCap size={18} />
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemTitle}>{highlightMatch(tcc.title, query)}</div>
                <div className={styles.itemSub}>{tcc.course || 'Trabalho Acadêmico'} • {tcc.year}</div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
