import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Command, BookOpen, GraduationCap, Home,
  User, Settings, Moon, Sun, Keyboard, X
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import styles from './CommandPalette.module.css'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onOpenShortcuts?: () => void
}

export function CommandPalette({ isOpen, onClose, onOpenShortcuts }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setSearch('')
      setActiveIndex(0)
    }
  }, [isOpen])

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

  const actions = [
    { id: 'home', label: 'Ir para o Início', icon: Home, group: 'Navegação', run: () => navigate('/') },
    { id: 'books', label: 'Ver Catálogo de Livros', icon: BookOpen, group: 'Navegação', run: () => navigate('/livros') },
    { id: 'tccs', label: 'Ver Trabalhos Acadêmicos (TCCs)', icon: GraduationCap, group: 'Navegação', run: () => navigate('/tccs') },
    { id: 'profile', label: 'Meu Perfil', icon: User, group: 'Navegação', run: () => navigate('/perfil') },
    { id: 'settings', label: 'Configurações & Preferências', icon: Settings, group: 'Navegação', run: () => navigate('/configuracoes') },
    {
      id: 'theme',
      label: `Alternar Tema (Atual: ${theme === 'dark' ? 'Escuro' : theme === 'high-contrast' ? 'Alto Contraste' : 'Claro'})`,
      icon: theme === 'dark' ? Sun : Moon,
      group: 'Ações Rápidas',
      run: () => toggleTheme(),
    },
    {
      id: 'shortcuts',
      label: 'Ver Atalhos de Teclado (?)',
      icon: Keyboard,
      group: 'Ações Rápidas',
      run: () => {
        onClose()
        onOpenShortcuts?.()
      },
    },
  ]

  const filtered = actions.filter(a =>
    a.label.toLowerCase().includes(search.toLowerCase()) ||
    a.group.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (run: () => void) => {
    run()
    onClose()
  }

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.palette} onClick={e => e.stopPropagation()}>
        <div className={styles.inputWrapper}>
          <Command size={20} className={styles.inputIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput || styles.input}
            placeholder="Digite um comando ou pesquise no sistema..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className={styles.badge}>ESC</span>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.list}>
          {filtered.length === 0 ? (
            <div style={{ padding: 'var(--sp-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              Nenhum comando encontrado para "{search}"
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon
              const isActive = index === activeIndex
              return (
                <div
                  key={item.id}
                  className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
                  onClick={() => handleSelect(item.run)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className={styles.itemLeft}>
                    <Icon size={18} color="var(--accent)" />
                    <span>{item.label}</span>
                  </div>
                  <span className={styles.badge}>{item.group}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
