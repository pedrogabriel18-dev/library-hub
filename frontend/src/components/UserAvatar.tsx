import styles from './UserAvatar.module.css'

interface UserAvatarProps {
  avatarId?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | number
  showStatus?: boolean
  onClick?: () => void
  editable?: boolean
}

export default function UserAvatar({
  avatarId,
  name,
  size = 'md',
  showStatus = true,
  onClick,
  editable = false,
}: UserAvatarProps) {
  const avatarSrc = avatarId
    ? `/assets/avatars/${avatarId}.jpeg`
    : '/assets/placeholders/book-placeholder-icon-flat-illus.jpeg'


  // Define dimension variables based on sizing input
  let width = 40
  let borderSize = 2
  let statusSize = 10
  let statusBorder = 2
  let statusOffset = 0

  if (size === 'sm') {
    width = 32
    borderSize = 1.5
    statusSize = 8.5
    statusBorder = 2
    statusOffset = -1
  } else if (size === 'md') {
    width = 40
    borderSize = 2
    statusSize = 10.5
    statusBorder = 2.2
    statusOffset = -1
  } else if (size === 'lg') {
    width = 140
    borderSize = 5
    statusSize = 24
    statusBorder = 4
    statusOffset = 2
  } else if (typeof size === 'number') {
    width = size
    borderSize = Math.max(1.5, size * 0.035)
    statusSize = Math.max(8, size * 0.16)
    statusBorder = Math.max(1.5, size * 0.028)
    statusOffset = size > 80 ? 2 : -1
  }

  const containerStyle = {
    width,
    height: width,
  }

  const imageContainerStyle = {
    borderWidth: borderSize,
    borderColor: 'var(--bg-surface)',
  }

  const statusDotStyle = {
    width: statusSize,
    height: statusSize,
    borderWidth: statusBorder,
    bottom: statusOffset,
    right: statusOffset,
    backgroundColor: 'var(--success)', /* Verde Online */
    borderColor: 'var(--bg-surface)', /* Borda com a cor do tema atual */
  }

  return (
    <div 
      className={`${styles.avatarWrapper} ${onClick ? styles.clickable : ''}`} 
      style={containerStyle}
      onClick={onClick}
    >
      <div className={styles.avatarContainer} style={imageContainerStyle}>
        <img
          src={avatarSrc}
          alt={name || 'Avatar'}
          className={styles.avatarImage}
          onError={e => {
            (e.target as HTMLImageElement).src = '/assets/placeholders/book-placeholder-icon-flat-illus.jpeg'
          }}
        />
        {editable && (
          <div className={styles.avatarHoverOverlay}>
            <span className={styles.cameraIcon}>📸</span>
          </div>
        )}
      </div>
      {showStatus && (
        <div 
          className={styles.statusDot} 
          style={statusDotStyle}
          title="Online"
        />
      )}
    </div>
  )
}
