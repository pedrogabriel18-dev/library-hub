import { Link } from 'react-router-dom'
import { BookOpen, Star, TrendingUp } from 'lucide-react'
import { Book } from '../../types'
import styles from './BookCard.module.css'

export interface BookCardProps {
  book: Book
  index?: number
  showTrendBadge?: boolean
}

export function BookCard({ book, index = 0, showTrendBadge = false }: BookCardProps) {
  const authorsStr = book.authors?.map(a => a.author.name).join(', ') || 'Autor desconhecido'

  return (
    <Link
      to={`/livros/${book.slug}`}
      className={styles.bookCard}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className={styles.bookCover}>
        <img
          src={book.coverImage || '/assets/placeholders/book-placeholder-icon-flat-illus.jpeg'}
          alt={book.title}
          loading="lazy"
        />
        <div className={styles.bookOverlay}>
          <span>
            <BookOpen size={14} /> Ler agora
          </span>
        </div>

        {showTrendBadge && (
          <div className={styles.trendBadge}>
            <TrendingUp size={12} /> #EmAlta
          </div>
        )}
      </div>

      <div className={styles.bookInfo}>
        <span className={styles.categoryTag}>{book.category?.name || 'Geral'}</span>
        <h3 className={styles.bookTitle} title={book.title}>
          {book.title}
        </h3>
        <p className={styles.bookAuthor} title={authorsStr}>
          {authorsStr}
        </p>

        <div className={styles.bookMeta}>
          <div className={styles.rating}>
            <Star size={13} fill={book.avgRating > 0 ? '#f59e0b' : 'none'} color="#f59e0b" />
            <span>{book.avgRating > 0 ? book.avgRating.toFixed(1) : 'S/N'}</span>
          </div>
          <span>{book.viewCount || 0} visualizações</span>
        </div>
      </div>
    </Link>
  )
}
