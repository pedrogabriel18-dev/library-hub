import { BookOpen, FileText, Star } from 'lucide-react'
import styles from '../../../pages/profile/ProfilePage.module.css'

export interface ProfileStatsCardProps {
  booksReadCount: number
  tccsAccessedCount: number
  reviewsApprovedCount: number
}

export function ProfileStatsCard({
  booksReadCount,
  tccsAccessedCount,
  reviewsApprovedCount,
}: ProfileStatsCardProps) {
  return (
    <div className={styles.statsCard}>
      <h2 className={styles.statsTitle}>Suas Estatísticas</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div style={{ color: 'var(--primary)' }}>
            <BookOpen size={28} />
          </div>
          <span className={styles.statValue}>{booksReadCount}</span>
          <span className={styles.statLabel}>Livros Lidos</span>
        </div>

        <div className={styles.statItem}>
          <div style={{ color: 'var(--accent)' }}>
            <FileText size={28} />
          </div>
          <span className={styles.statValue}>{tccsAccessedCount}</span>
          <span className={styles.statLabel}>TCCs Consultados</span>
        </div>

        <div className={styles.statItem}>
          <div style={{ color: 'var(--warning-text)' }}>
            <Star size={28} />
          </div>
          <span className={styles.statValue}>{reviewsApprovedCount}</span>
          <span className={styles.statLabel}>Resenhas Aprovadas</span>
        </div>
      </div>
    </div>
  )
}
