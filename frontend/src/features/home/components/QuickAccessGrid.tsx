import { Link } from 'react-router-dom'
import { BookOpen, FileText, Star } from 'lucide-react'
import styles from '../../../pages/HomePage.module.css'

export function QuickAccessGrid() {
  return (
    <section className={styles.quickAccess}>
      <Link to="/livros" className={styles.quickCard}>
        <div className={styles.quickIcon} style={{ background: 'var(--color-blue-600)' }}>
          <BookOpen size={20} />
        </div>
        <div className={styles.quickContent}>
          <h3 className={styles.quickTitle}>Catálogo de Livros</h3>
          <p className={styles.quickDesc}>Navegue pelo acervo completo</p>
        </div>
      </Link>

      <Link to="/tccs" className={styles.quickCard}>
        <div className={styles.quickIcon} style={{ background: 'var(--color-red-600)' }}>
          <FileText size={20} />
        </div>
        <div className={styles.quickContent}>
          <h3 className={styles.quickTitle}>Trabalhos de Conclusão</h3>
          <p className={styles.quickDesc}>TCCs dos alunos da escola</p>
        </div>
      </Link>

      <Link to="/perfil" className={styles.quickCard}>
        <div className={styles.quickIcon} style={{ background: 'var(--color-amber-600)' }}>
          <Star size={20} />
        </div>
        <div className={styles.quickContent}>
          <h3 className={styles.quickTitle}>Meus Favoritos</h3>
          <p className={styles.quickDesc}>Livros salvos por você</p>
        </div>
      </Link>
    </section>
  )
}
