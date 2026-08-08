import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import styles from './Breadcrumb.module.css'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Navegação hierárquica" className={styles.breadcrumb}>
      <Link to="/" className={styles.item} title="Início">
        <Home size={14} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronRight size={14} className={styles.separator} />
            {isLast || !item.to ? (
              <span className={styles.current} title={item.label}>
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className={styles.item}>
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
