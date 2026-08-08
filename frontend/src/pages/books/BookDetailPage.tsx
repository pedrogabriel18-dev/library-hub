import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Download, Heart, HeartOff, Star,
  Clock, Hash,
} from 'lucide-react'
import { BookService } from '@/services/BookService'
import { ReviewService } from '@/services/ReviewService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/contexts/ToastContext'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { Book, Review } from '@/types'
import styles from './BookDetailPage.module.css'

export default function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isFavLoading, setIsFavLoading] = useState(false)

  // Avaliação
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewSent, setReviewSent] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    if (!slug) return
    setIsLoading(true)
    BookService.getBookBySlug(slug)
      .then(data => {
        setBook(data)
        setIsFavorited(!!data.isFavorited)
      })
      .catch(() => {
        toast.error('Livro não encontrado.')
        navigate('/livros')
      })
      .finally(() => setIsLoading(false))
  }, [slug, navigate, toast])

  async function handleFavorite() {
    if (!book) return
    setIsFavLoading(true)
    try {
      const res = await BookService.toggleFavorite(book.id)
      setIsFavorited(res.isFavorited)
      if (res.isFavorited) {
        toast.success('Livro adicionado aos seus favoritos!')
      } else {
        toast.info('Livro removido dos seus favoritos.')
      }
    } catch {
      toast.error('Erro ao atualizar favoritos.')
    } finally {
      setIsFavLoading(false)
    }
  }

  async function handleReview() {
    if (!book || rating === 0) return
    setReviewLoading(true)
    setReviewError('')
    try {
      await ReviewService.submitReview({ bookId: book.id, rating, comment })
      setReviewSent(true)
      toast.success('Sua avaliação foi enviada para moderação!')
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao enviar avaliação.'
      setReviewError(msg)
      toast.error(msg)
    } finally {
      setReviewLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Carregando detalhes da obra...</p>
      </div>
    )
  }

  if (!book) return null

  const authors = book.authors?.map(a => a.author.name).join(', ') || 'Autor desconhecido'

  return (
    <div className={styles.page}>
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Catálogo de Livros', to: '/livros' },
          { label: book.title },
        ]}
      />

      {/* Cabeçalho do livro */}
      <div className={styles.header}>
        {/* Capa */}
        <div className={styles.coverWrapper}>
          <img
            src={book.coverImage || '/assets/placeholders/book-placeholder-icon-flat-illus.jpeg'}
            alt={book.title}
            className={styles.cover}
          />
        </div>

        {/* Informações */}
        <div className={styles.info}>
          <div className={styles.categoryBadge}>{book.category?.name || 'Geral'}</div>
          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.authors}>Por <strong>{authors}</strong></p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <Star size={16} fill={book.avgRating > 0 ? 'var(--color-star)' : 'none'} color="var(--color-star)" />
              <span>
                <strong>{book.avgRating > 0 ? book.avgRating.toFixed(1) : 'S/N'}</strong>
                {book.ratingCount > 0 && ` (${book.ratingCount} avaliações)`}
              </span>
            </div>

            {book.publishedYear && (
              <div className={styles.stat}>
                <Clock size={16} />
                <span>{book.publishedYear}</span>
              </div>
            )}

            {book.pageCount && (
              <div className={styles.stat}>
                <Hash size={16} />
                <span>{book.pageCount} páginas</span>
              </div>
            )}
          </div>

          {/* Sinopse */}
          {book.synopsis && (
            <div className={styles.synopsisSection}>
              <h3>Sinopse</h3>
              <p className={styles.synopsis}>{book.synopsis}</p>
            </div>
          )}

          {/* Ações principais */}
          <div className={styles.actions}>
            <Link to={`/livros/${book.slug}/ler`} className={styles.readBtn}>
              <BookOpen size={16} />
              {book.progress && !book.progress.isFinished ? 'Continuar Leitura' : 'Ler Agora'}
            </Link>

            <button
              onClick={handleFavorite}
              disabled={isFavLoading}
              className={`${styles.favoriteBtn} ${isFavorited ? styles.favorited : ''}`}
              title={isFavorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            >
              {isFavorited ? <HeartOff size={16} /> : <Heart size={16} />}
              {isFavorited ? 'Favoritado' : 'Favoritar'}
            </button>

            <a
              href={`/api/books/${book.slug}/download`}
              className={styles.downloadBtn}
              download
              onClick={() => toast.info('Iniciando download do livro...')}
            >
              <Download size={16} />
              Baixar PDF
            </a>
          </div>
        </div>
      </div>

      {/* Seção de Avaliação e Resenhas */}
      <section className={styles.reviewsSection}>
        <h2>Avaliações dos Alunos</h2>

        {/* Formulário de avaliação (Apenas para Alunos) */}
        {user?.role === 'STUDENT' && (
          <div className={styles.reviewFormCard}>
            <h3>Deixe sua avaliação</h3>
            {reviewSent ? (
              <div className={styles.reviewSuccessMsg}>
                Sua avaliação foi enviada com sucesso e está em análise pela moderação!
              </div>
            ) : (
              <div className={styles.reviewForm}>
                <div className={styles.starSelect}>
                  <span>Sua nota:</span>
                  <div className={styles.starsGroup}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={styles.starBtn}
                      >
                        <Star
                          size={20}
                          fill={(hoverRating || rating) >= star ? 'var(--color-star)' : 'none'}
                          color="var(--color-star)"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  placeholder="Escreva seu comentário sobre o livro (opcional)..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className={styles.reviewTextarea}
                />

                {reviewError && <div className={styles.reviewError}>{reviewError}</div>}

                <button
                  onClick={handleReview}
                  disabled={rating === 0 || reviewLoading}
                  className={styles.submitReviewBtn}
                >
                  {reviewLoading ? 'Enviando...' : 'Enviar Avaliação'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lista de Resenhas Aprovadas */}
        <div className={styles.reviewsList}>
          {!book.reviews || book.reviews.length === 0 ? (
            <p className={styles.noReviews}>Nenhuma resenha aprovada ainda. Seja o primeiro a avaliar!</p>
          ) : (
            book.reviews.map((r: Review) => (
              <div key={r.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <strong>{r.user?.name || 'Estudante'}</strong>
                  <div className={styles.starsGroup}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < r.rating ? 'var(--color-star)' : 'none'}
                        color="var(--color-star)"
                      />
                    ))}
                  </div>
                </div>
                {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
                <small className={styles.reviewDate}>
                  {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                </small>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
