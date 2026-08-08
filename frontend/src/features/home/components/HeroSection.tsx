
import { User } from '../../../types'
import styles from '../../../pages/HomePage.module.css'

export interface HeroSectionProps {
  user: User | null
  stats: { books: number; tccs: number }
}

export function HeroSection({ user, stats }: HeroSectionProps) {
  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const firstName = user?.name?.split(' ')[0] || 'Leitor'

  return (
    <section className={styles.hero}>
      <p className={styles.heroGreeting}>
        {getGreeting()}, <strong>{firstName}</strong>! 👋
      </p>
      
      <h1 className={styles.heroTitle}>
        Gestão Inteligente para Bibliotecas Escolares.
      </h1>
      
      <p className={styles.heroSubtitle}>
        Acesse milhares de livros do acervo e consulte trabalhos de conclusão desenvolvidos pelos alunos, tudo em um só lugar.
      </p>

      <div className={styles.heroStats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.books > 0 ? `${stats.books}` : '0'}</span>
          <span className={styles.statLabel}>Livros catalogados</span>
        </div>
        <div className={styles.statDivider} aria-hidden />
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.tccs > 0 ? `${stats.tccs}` : '0'}</span>
          <span className={styles.statLabel}>TCCs históricos</span>
        </div>
        <div className={styles.statDivider} aria-hidden />
        <div className={styles.statItem}>
          <span className={styles.statValue}>24/7</span>
          <span className={styles.statLabel}>Acesso irrestrito</span>
        </div>
      </div>
    </section>
  )
}
