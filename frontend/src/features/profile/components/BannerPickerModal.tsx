import { useState } from 'react'
import { Check } from 'lucide-react'
import { BANNER_COLORS, BANNER_GRADIENTS } from '../../../constants/banners'
import { Modal } from '../../../components/ui/Modal'
import styles from '../../../pages/profile/ProfilePage.module.css'

export interface BannerPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentBannerType: string
  currentBannerValue: string | null
  onSaveBanner: (type: string, value: string | null) => Promise<void>
}

export function BannerPickerModal({
  isOpen,
  onClose,
  currentBannerType,
  currentBannerValue,
  onSaveBanner,
}: BannerPickerModalProps) {
  const [tempType, setTempType] = useState(currentBannerType)
  const [tempValue, setTempValue] = useState(currentBannerValue)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSaveBanner(tempType, tempValue)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const footer = (
    <div style={{ display: 'flex', gap: 'var(--sp-2)', width: '100%', justifyContent: 'flex-end' }}>
      <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
      <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Salvando...' : 'Salvar Personalização'}
      </button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizar Banner"
      maxWidth="520px"
      footer={footer}
    >
      <div
        className={styles.bannerPreview}
        style={tempType !== 'avatar' && tempValue ? { backgroundImage: `url(${tempValue})`, background: tempValue } : undefined}
      >
        <span>Pré-visualização do Banner</span>
      </div>

      <div className={styles.bannerOptions}>
        <div className={styles.bannerSectionTitle}>Cores Sólidas</div>
        <div className={styles.colorGrid}>
          {BANNER_COLORS.map(c => (
            <button
              key={c.name}
              type="button"
              className={`${styles.colorChip} ${tempValue === c.value ? styles.selectedColor : ''}`}
              style={{ background: c.value }}
              onClick={() => {
                setTempType('color')
                setTempValue(c.value)
              }}
              title={c.name}
            >
              {tempValue === c.value && <Check size={14} color="#fff" />}
            </button>
          ))}
        </div>

        <div className={styles.bannerSectionTitle} style={{ marginTop: 'var(--sp-4)' }}>Gradientes</div>
        <div className={styles.colorGrid}>
          {BANNER_GRADIENTS.map(g => (
            <button
              key={g.name}
              type="button"
              className={`${styles.colorChip} ${tempValue === g.value ? styles.selectedColor : ''}`}
              style={{ background: g.value }}
              onClick={() => {
                setTempType('gradient')
                setTempValue(g.value)
              }}
              title={g.name}
            >
              {tempValue === g.value && <Check size={14} color="#fff" />}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}
