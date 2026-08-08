import { useEffect, useState } from 'react'
import { Check, X, Star, Clock, Trash2 } from 'lucide-react'
import { useReviews } from '@/hooks/useReviews'
import { BookService } from '@/services/BookService'
import { ReviewRejectModal } from '@/features/moderation/components/ReviewRejectModal'
import { Book } from '@/types'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import styles from './AdminModerationPage.module.css'

export default function AdminModerationPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [selectedBookId, setSelectedBookId] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [dateFilter] = useState('')

  const { reviews, isLoading, setParams, approveReview, rejectReview, deleteReview } = useReviews({
    status: statusFilter,
  })

  // Modal State
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingReviewId, setRejectingReviewId] = useState<string | null>(null)
  const [rejectingBookTitle, setRejectingBookTitle] = useState('')

  useEffect(() => {
    BookService.listBooks({ limit: 100 }).then(res => setBooks(res.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setParams({
      status: statusFilter,
      bookId: selectedBookId || undefined,
      studentSearch: studentSearch || undefined,
      date: dateFilter || undefined,
    })
  }, [statusFilter, selectedBookId, studentSearch, dateFilter, setParams])

  const handleOpenReject = (id: string, title: string) => {
    setRejectingReviewId(id)
    setRejectingBookTitle(title)
    setShowRejectModal(true)
  }

  const handleConfirmReject = async (reason: string) => {
    if (rejectingReviewId) {
      await rejectReview(rejectingReviewId, reason)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Moderação de Resenhas</h1>
        <p>Analise, aprove ou rejeite avaliações enviadas pelos estudantes antes de serem publicadas.</p>
      </div>

      {/* Barra de Filtros */}
      <div className={styles.filterBar}>
        <div className={styles.tabFilters}>
          <button
            className={`${styles.tabBtn} ${statusFilter === 'PENDING' ? styles.activeTab : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            <Clock size={16} /> Pendentes
          </button>
          <button
            className={`${styles.tabBtn} ${statusFilter === 'APPROVED' ? styles.activeTab : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            <Check size={16} /> Aprovadas
          </button>
          <button
            className={`${styles.tabBtn} ${statusFilter === 'REJECTED' ? styles.activeTab : ''}`}
            onClick={() => setStatusFilter('REJECTED')}
          >
            <X size={16} /> Rejeitadas
          </button>
        </div>

        <div className={styles.inputsGroup}>
          <select value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)}>
            <option value="">Todos os livros</option>
            {books.map(b => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Buscar por estudante..."
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Avaliações */}
      {isLoading ? (
        <SkeletonGrid count={4} />
      ) : reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <Clock size={40} />
          <p>Nenhuma avaliação encontrada nesta categoria.</p>
        </div>
      ) : (
        <div className={styles.reviewGrid}>
          {reviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div>
                  <strong className={styles.studentName}>{review.user?.name || 'Estudante'}</strong>
                  <span className={styles.bookTitle}>em {review.book?.title}</span>
                </div>
                <div className={styles.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? 'var(--color-star)' : 'none'}
                      color="var(--color-star)"
                    />
                  ))}
                </div>
              </div>

              <p className={styles.commentText}>{review.comment || 'Sem comentário por escrito.'}</p>

              {review.rejectionReason && (
                <div className={styles.rejectionAlert}>
                  <strong>Motivo da Rejeição:</strong> {review.rejectionReason}
                </div>
              )}

              <div className={styles.reviewFooter}>
                <span className={styles.dateText}>
                  {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                </span>

                <div className={styles.actionsGroup}>
                  {statusFilter === 'PENDING' && (
                    <>
                      <button
                        className={styles.approveBtn}
                        onClick={() => approveReview(review.id)}
                      >
                        <Check size={14} /> Aprovar
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleOpenReject(review.id, review.book?.title || 'Livro')}
                      >
                        <X size={14} /> Rejeitar
                      </button>
                    </>
                  )}
                  <button
                    className={styles.deleteIconBtn}
                    onClick={() => deleteReview(review.id)}
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReviewRejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        bookTitle={rejectingBookTitle}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  )
}
