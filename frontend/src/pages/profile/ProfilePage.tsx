import { useState, useEffect } from 'react'
import { Heart, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { AuthService } from '@/services/AuthService'
import { BookService } from '@/services/BookService'
import { Book } from '@/types'
import { ProfileHeader } from '@/features/profile/components/ProfileHeader'
import { ProfileStatsCard } from '@/features/profile/components/ProfileStatsCard'
import { AvatarPickerModal } from '@/features/profile/components/AvatarPickerModal'
import { BannerPickerModal } from '@/features/profile/components/BannerPickerModal'
import { BookCard } from '@/components/common/BookCard'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import styles from './ProfilePage.module.css'

interface HistoryBook extends Book {
  accessedAt: string
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'history'>('profile')

  // Modais de customização
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)

  // Estatísticas e listas de livros
  const [stats, setStats] = useState({ booksReadCount: 0, tccsAccessedCount: 0, reviewsApprovedCount: 0 })
  const [favorites, setFavorites] = useState<Book[]>([])
  const [history, setHistory] = useState<HistoryBook[]>([])
  const [isLoadingTab, setIsLoadingTab] = useState(false)

  useEffect(() => {
    AuthService.getProfileStats().then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    if (activeTab === 'favorites') {
      setIsLoadingTab(true)
      BookService.getFavorites()
        .then(setFavorites)
        .catch(() => {})
        .finally(() => setIsLoadingTab(false))
    } else if (activeTab === 'history') {
      setIsLoadingTab(true)
      BookService.getHistory()
        .then(data => setHistory(data as HistoryBook[]))
        .catch(() => {})
        .finally(() => setIsLoadingTab(false))
    }
  }, [activeTab])

  if (!user) return null

  const handleSelectAvatar = async (avatarId: string) => {
    const updatedUser = await AuthService.updateAvatar(avatarId)
    updateUser(updatedUser)
  }

  const handleSaveBanner = async (type: string, value: string | null) => {
    const updatedUser = await AuthService.updateProfileCustomization(type, value)
    updateUser(updatedUser)
  }

  return (
    <div className={styles.page}>
      {/* Cabeçalho do Perfil */}
      <ProfileHeader
        user={user}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
        onOpenBannerModal={() => setIsBannerModalOpen(true)}
      />

      {/* Navegação por Abas */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Visão Geral
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'favorites' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <Heart size={16} /> Meus Favoritos
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={16} /> Histórico de Leitura
        </button>
      </div>

      {/* Conteúdo da Aba: Visão Geral */}
      {activeTab === 'profile' && (
        <div className={styles.tabContent}>
          <ProfileStatsCard
            booksReadCount={stats.booksReadCount}
            tccsAccessedCount={stats.tccsAccessedCount}
            reviewsApprovedCount={stats.reviewsApprovedCount}
          />
        </div>
      )}

      {/* Conteúdo da Aba: Favoritos */}
      {activeTab === 'favorites' && (
        <div className={styles.tabContent}>
          {isLoadingTab ? (
            <SkeletonGrid count={4} />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Nenhum livro favoritado ainda"
              description="Navegue pelo catálogo e clique no ícone de coração para guardar seus livros preferidos."
            />
          ) : (
            <div className={styles.grid}>
              {favorites.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo da Aba: Histórico */}
      {activeTab === 'history' && (
        <div className={styles.tabContent}>
          {isLoadingTab ? (
            <SkeletonGrid count={4} />
          ) : history.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Seu histórico está vazio"
              description="Quando você abrir e ler obras na biblioteca, elas aparecerão listadas aqui."
            />
          ) : (
            <div className={styles.grid}>
              {history.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modais de Customização */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarId={user.avatarId}
        onSelectAvatar={handleSelectAvatar}
      />

      <BannerPickerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        currentBannerType={user.bannerType || 'avatar'}
        currentBannerValue={user.bannerValue}
        onSaveBanner={handleSaveBanner}
      />
    </div>
  )
}
