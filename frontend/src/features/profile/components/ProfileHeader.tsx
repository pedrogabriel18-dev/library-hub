import { Camera, Layout } from 'lucide-react'
import UserAvatar from '../../../components/UserAvatar'
import { User } from '../../../types'
import { ROLE_LABELS, ROLE_COLORS } from '../../../constants/roles'
import styles from '../../../pages/profile/ProfilePage.module.css'

export interface ProfileHeaderProps {
  user: User
  onOpenAvatarModal: () => void
  onOpenBannerModal: () => void
}

export function ProfileHeader({ user, onOpenAvatarModal, onOpenBannerModal }: ProfileHeaderProps) {
  const isCustomBanner = user.bannerType && user.bannerType !== 'avatar' && user.bannerValue

  return (
    <div className={styles.headerContainer}>
      <div
        className={styles.banner}
        style={isCustomBanner ? { backgroundImage: `url(${user.bannerValue})` } : undefined}
      >
        <button
          className={styles.bannerEditBtn}
          onClick={onOpenBannerModal}
          title="Personalizar Banner"
        >
          <Layout size={14} /> Editar Banner
        </button>
      </div>

      <div className={styles.profileInfo}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <UserAvatar avatarId={user.avatarId} size={110} />
            <button
              className={styles.avatarChangeBtn}
              onClick={onOpenAvatarModal}
              title="Alterar Avatar"
            >
              <Camera size={16} />
            </button>
          </div>
        </div>

        <div className={styles.userInfo}>
          <h1 className={styles.userName}>{user.name}</h1>
          <div className={styles.userBadges}>
            <span
              className={styles.roleBadge}
              style={{ background: ROLE_COLORS[user.role] || 'var(--accent)' }}
            >
              {ROLE_LABELS[user.role] || user.role}
            </span>
            {user.turma && <span className={styles.turmaBadge}>{user.turma}</span>}
            {user.curso && <span className={styles.cursoBadge}>{user.curso}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
