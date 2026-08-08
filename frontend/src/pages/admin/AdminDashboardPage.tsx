/**
 * AdminDashboardPage — Painel Administrativo do LibraryHub.
 *
 * Refatorado: a lógica de cada aba foi extraída para sub-componentes dedicados
 * em ./components/ para facilitar manutenção e reduzir o tamanho deste arquivo.
 */
import { useEffect, useState } from 'react'
import api from '../../services/api'
import { DashboardStats } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { DashboardOverview } from './components/DashboardOverview'
import { BookManager } from './components/BookManager'
import { TccManager } from './components/TccManager'
import { SkeletonTable } from '../../components/ui/Skeleton'
import styles from './AdminDashboardPage.module.css'

type ActiveTab = 'overview' | 'book' | 'tcc'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const canManageBooks = user?.role === 'DEVELOPER' || user?.role === 'LIBRARIAN'
  const canManageTccs = user?.role === 'DEVELOPER' || user?.role === 'LIBRARIAN' || user?.role === 'ADVISOR'

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  useEffect(() => {
    fetchStats()
  }, [])

  function fetchStats() {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.data))
      .finally(() => setIsLoading(false))
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <SkeletonTable rows={6} />
      </div>
    )
  }
  
  if (!stats) return null

  return (
    <div className={styles.page}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h1 className={styles.title}>Painel Administrativo</h1>
        <p className={styles.subtitle}>
          Visão geral e gestão integrada do sistema LibraryHub
        </p>
      </div>

      {/* Navegação por abas */}
      <div className={styles.tabsNav}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`}
        >
          Visão Geral
        </button>
        {canManageBooks && (
          <button
            onClick={() => setActiveTab('book')}
            className={`${styles.tabBtn} ${activeTab === 'book' ? styles.activeTab : ''}`}
          >
            Gerenciamento de Livros
          </button>
        )}
        {canManageTccs && (
          <button
            onClick={() => setActiveTab('tcc')}
            className={`${styles.tabBtn} ${activeTab === 'tcc' ? styles.activeTab : ''}`}
          >
            Gerenciamento de TCCs
          </button>
        )}
      </div>

      {/* Conteúdo da aba ativa */}
      {activeTab === 'overview' && (
        <DashboardOverview stats={stats} />
      )}

      {activeTab === 'book' && canManageBooks && (
        <BookManager onStatsRefresh={fetchStats} />
      )}

      {activeTab === 'tcc' && canManageTccs && (
        <TccManager onStatsRefresh={fetchStats} />
      )}
    </div>
  )
}
