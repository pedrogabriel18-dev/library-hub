import { useState } from 'react'
import { Search, Check } from 'lucide-react'
import { AVATAR_CATEGORIES, AVATARS_WITH_CATEGORIES } from '../../../constants/avatars'
import UserAvatar from '../../../components/UserAvatar'
import { Modal } from '../../../components/ui/Modal'
import styles from '../../../pages/profile/ProfilePage.module.css'

export interface AvatarPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatarId: string | null
  onSelectAvatar: (avatarId: string) => Promise<void>
}

export function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatarId,
  onSelectAvatar,
}: AvatarPickerModalProps) {
  const [avatarSearch, setAvatarSearch] = useState('')
  const [avatarCat, setAvatarCat] = useState('all')
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const filteredAvatars = AVATARS_WITH_CATEGORIES.filter(av => {
    const matchesCat = avatarCat === 'all' || av.category === avatarCat
    const matchesSearch = av.name.toLowerCase().includes(avatarSearch.toLowerCase())
    return matchesCat && matchesSearch
  })

  const handleSelect = async (avatarId: string) => {
    setIsSaving(true)
    try {
      await onSelectAvatar(avatarId)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Escolha seu Avatar Pixel Art"
      maxWidth="680px"
    >
      <div className={styles.avatarFilters}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar avatar por nome..."
            value={avatarSearch}
            onChange={e => setAvatarSearch(e.target.value)}
          />
        </div>

        <div className={styles.catChips}>
          {AVATAR_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.catChip} ${avatarCat === cat.id ? styles.activeCatChip : ''}`}
              onClick={() => setAvatarCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.avatarGrid}>
        {filteredAvatars.map(av => {
          const isSelected = currentAvatarId === av.id
          return (
            <div
              key={av.id}
              className={`${styles.avatarOption} ${isSelected ? styles.selectedAvatar : ''}`}
              onClick={() => !isSaving && handleSelect(av.id)}
              title={av.name}
            >
              <UserAvatar avatarId={av.id} size={64} />
              <span className={styles.avatarName}>{av.name}</span>
              {isSelected && (
                <div className={styles.avatarCheck}>
                  <Check size={12} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
