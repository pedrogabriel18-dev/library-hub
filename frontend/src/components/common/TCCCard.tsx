import { Link } from 'react-router-dom'
import { FileText, Eye, User, Calendar } from 'lucide-react'
import { TCC } from '../../types'
import styles from './TCCCard.module.css'

export interface TCCCardProps {
  tcc: TCC
  index?: number
}

export function TCCCard({ tcc, index = 0 }: TCCCardProps) {
  return (
    <Link
      to={`/tccs/${tcc.slug}`}
      className={styles.tccCard}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className={styles.tccThumbnail}>
        {tcc.coverImage ? (
          <img src={tcc.coverImage} alt={tcc.title} loading="lazy" />
        ) : (
          <FileText size={28} color="var(--accent)" />
        )}
      </div>

      <div className={styles.tccInfo}>
        <span className={styles.tccBadge}>{tcc.course || 'TCC Acadêmico'}</span>
        <h3 className={styles.tccTitle} title={tcc.title}>
          {tcc.title}
        </h3>

        <div className={styles.tccMeta}>
          <span className={styles.tccMetaItem}>
            <User size={12} /> {tcc.author?.name || 'Autor Desconhecido'}
          </span>
          <span className={styles.tccMetaItem}>
            <Calendar size={12} /> {tcc.year}
          </span>
          <span className={styles.tccMetaItem}>
            <Eye size={12} /> {tcc.viewCount || 0}
          </span>
        </div>
      </div>
    </Link>
  )
}
