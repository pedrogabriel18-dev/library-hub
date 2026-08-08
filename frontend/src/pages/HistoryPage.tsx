import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle } from 'lucide-react'
import api from '../services/api'
import { Book } from '../types'
import { EmptyState } from '../components/ui/EmptyState'
import styles from './HistoryPage.module.css'

interface HistoryBook extends Book {
  accessedAt: string
}

export default function HistoryPage() {
  const [books, setBooks] = useState<HistoryBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/me/history')
      .then(({ data }) => setBooks(data.data || []))
      .catch(() => setBooks([]))
      .finally(() => setIsLoading(false))
  }, [])

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 7) return `${diffDays} dias atrás`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem. atrás`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  // Agrupa por data relativa
  const grouped = books.reduce<Record<string, HistoryBook[]>>((acc, book) => {
    const label = formatDate(book.accessedAt)
    if (!acc[label]) acc[label] = []
    acc[label].push(book)
    return acc
  }, {})

  return (
    <div className={styles.page}>
      {/* ── Cabeçalho ─────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Clock size={22} />
        </div>
        <div>
          <h1 className={styles.title}>Histórico de Leitura</h1>
          <p className={styles.subtitle}>Seus livros acessados recentemente</p>
        </div>
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────── */}
      {isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonItem} style={{ animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Histórico vazio"
          description="Os livros que você acessar aparecerão aqui automaticamente."
          actionLabel="Começar a explorar"
          onAction={() => navigate('/livros')}
        />
      ) : (
        <div className={styles.timeline}>
          {Object.entries(grouped).map(([dateLabel, dayBooks], groupIndex) => (
            <div key={dateLabel} className={styles.timelineGroup} style={{ animationDelay: `${groupIndex * 0.05}s` }}>
              <div className={styles.groupLabel}>
                <span className={styles.groupDot} aria-hidden />
                <span className={styles.groupText}>{dateLabel}</span>
                <span className={styles.groupLine} aria-hidden />
              </div>

              <div className={styles.groupItems}>
                {dayBooks.map((book, i) => (
                  <HistoryItem key={`${book.id}-${book.accessedAt}`} book={book} index={i} formatTime={formatTime} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HistoryItem({
  book, index, formatTime
}: {
  book: HistoryBook; index: number; formatTime: (d: string) => string
}) {
  const authors = book.authors?.map(a => a.author.name).join(', ') || 'Desconhecido'
  const progress = book.progress
  const progressPct = progress && progress.totalPages
    ? Math.round((progress.currentPage / progress.totalPages) * 100)
    : null

  return (
    <Link
      to={`/livros/${book.slug}`}
      className={styles.historyItem}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <img
        src={book.coverImage || '/assets/placeholders/book-placeholder-icon-flat-illus.jpeg'}
        alt={book.title}
        className={styles.itemCover}
        loading="lazy"
      />

      <div className={styles.itemInfo}>
        <h3 className={styles.itemTitle}>{book.title}</h3>
        <p className={styles.itemAuthor}>{authors}</p>

        {/* Barra de progresso */}
        {progressPct !== null && (
          <div className={styles.progressWrapper}>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${progressPct === 100 ? styles.progressComplete : ''}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={styles.progressLabel}>
              {progressPct === 100
                ? <><CheckCircle size={11} /> Concluído</>
                : `${progressPct}% — pág. ${progress?.currentPage}`
              }
            </span>
          </div>
        )}
      </div>

      <div className={styles.itemMeta}>
        <span className={styles.itemTime}>{formatTime(book.accessedAt)}</span>
        <svg className={styles.itemArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  )
}
