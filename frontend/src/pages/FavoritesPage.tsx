import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import api from '../services/api'
import { Book } from '../types'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { BookCard } from '../components/common/BookCard'
import styles from './FavoritesPage.module.css'

export default function FavoritesPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/me/favorites')
      .then(({ data }) => setBooks(data.data || []))
      .catch(() => setBooks([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      {/* ── Cabeçalho ─────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Heart size={22} fill="currentColor" />
        </div>
        <div>
          <h1 className={styles.title}>Meus Favoritos</h1>
          <p className={styles.subtitle}>
            {isLoading ? 'Carregando...' : `${books.length} ${books.length === 1 ? 'livro favoritado' : 'livros favoritados'}`}
          </p>
        </div>
      </div>

      {/* ── Conteúdo ──────────────────────────────────────────────── */}
      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : books.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nenhum favorito ainda"
          description="Adicione livros aos favoritos durante a leitura e eles aparecerão aqui."
          actionLabel="Explorar livros"
          onAction={() => navigate('/livros')}
        />
      ) : (
        <div className={styles.grid}>
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
