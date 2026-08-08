import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.errorCode}>
        404
      </div>
      <h1 className={styles.title}>
        Página não encontrada
      </h1>
      <p className={styles.description}>
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        to="/"
        className={styles.backBtn}
      >
        <BookOpen size={16} />
        Voltar ao início
      </Link>
    </div>
  )
}
