import { useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'
import styles from './ShortcutsModal.module.css'

interface ShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortcuts = [
    { keys: ['Ctrl', 'K'], label: 'Abrir Paleta de Comandos & Busca Rápida' },
    { keys: ['/'], label: 'Focar na busca global' },
    { keys: ['Ctrl', 'Shift', 'L'], label: 'Alternar Tema (Claro / Escuro)' },
    { keys: ['?'], label: 'Abrir este guia de atalhos' },
    { keys: ['ESC'], label: 'Fechar modais e caixas de diálogo' },
  ]

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            <Keyboard size={20} color="var(--accent)" /> Atalhos de Teclado
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.shortcutsGrid}>
          {shortcuts.map((sc, index) => (
            <div key={index} className={styles.shortcutRow}>
              <span>{sc.label}</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {sc.keys.map((k, kIdx) => (
                  <kbd key={kIdx} className={styles.keyBadge}>
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
