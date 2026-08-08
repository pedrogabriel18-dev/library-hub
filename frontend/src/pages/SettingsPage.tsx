import { useState, useEffect } from 'react'
import { Sun, Moon, Eye, Bell, Sliders } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useToast } from '@/contexts/ToastContext'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const toast = useToast()

  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>(() => {
    return (localStorage.getItem('preferred_density') as any) || 'normal'
  })

  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications_enabled') !== 'false'
  })

  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('reduced_motion') === 'true'
  })

  const handleDensityChange = (val: 'compact' | 'normal' | 'comfortable') => {
    setDensity(val)
    localStorage.setItem('preferred_density', val)
    document.documentElement.setAttribute('data-density', val)
    toast.success(`Densidade alterada para: ${val === 'compact' ? 'Compacta' : val === 'comfortable' ? 'Confortável' : 'Padrão'}`)
  }

  const handleNotificationsToggle = () => {
    const next = !notifications
    setNotifications(next)
    localStorage.setItem('notifications_enabled', String(next))
    toast.info(`Notificações visuais ${next ? 'ativadas' : 'desativadas'}.`)
  }

  const handleMotionToggle = () => {
    const next = !reducedMotion
    setReducedMotion(next)
    localStorage.setItem('reduced_motion', String(next))
    toast.info(`Redução de movimento ${next ? 'ativada' : 'desativada'}.`)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density)
  }, [density])

  return (
    <div className={styles.container}>
      <Breadcrumb items={[{ label: 'Configurações & Preferências' }]} />

      <div className={styles.header}>
        <h1>Configurações do Sistema</h1>
        <p>Personalize a aparência, acessibilidade e notificações do seu ambiente de leitura.</p>
      </div>

      {/* Tema e Aparência */}
      <section className={styles.settingsCard}>
        <h2 className={styles.sectionTitle}>
          <Sun size={20} color="var(--primary)" /> Aparência e Cores
        </h2>

        <div className={styles.gridOptions}>
          <div
            className={`${styles.optionBox} ${theme === 'light' ? styles.selectedBox : ''}`}
            onClick={() => {
              setTheme('light')
              toast.success('Tema Claro aplicado.')
            }}
          >
            <Sun size={24} color="var(--warning-text)" />
            <span className={styles.optionBoxTitle}>Tema Claro</span>
            <span className={styles.optionBoxDesc}>Visual diurno com alto contraste suave</span>
          </div>

          <div
            className={`${styles.optionBox} ${theme === 'dark' ? styles.selectedBox : ''}`}
            onClick={() => {
              setTheme('dark')
              toast.success('Tema Escuro aplicado.')
            }}
          >
            <Moon size={24} color="var(--accent)" />
            <span className={styles.optionBoxTitle}>Tema Escuro</span>
            <span className={styles.optionBoxDesc}>Elegante e descansa a visão durante a noite</span>
          </div>

          <div
            className={`${styles.optionBox} ${theme === 'high-contrast' ? styles.selectedBox : ''}`}
            onClick={() => {
              setTheme('high-contrast')
              toast.success('Modo Alto Contraste ativado.')
            }}
          >
            <Eye size={24} color="var(--success)" />
            <span className={styles.optionBoxTitle}>Alto Contraste</span>
            <span className={styles.optionBoxDesc}>Conformidade estrita com diretrizes WCAG AA</span>
          </div>
        </div>
      </section>

      {/* Densidade da Interface */}
      <section className={styles.settingsCard}>
        <h2 className={styles.sectionTitle}>
          <Sliders size={20} color="var(--primary)" /> Densidade da Interface
        </h2>

        <div className={styles.gridOptions}>
          <div
            className={`${styles.optionBox} ${density === 'compact' ? styles.selectedBox : ''}`}
            onClick={() => handleDensityChange('compact')}
          >
            <span className={styles.optionBoxTitle}>Compacta</span>
            <span className={styles.optionBoxDesc}>Espaçamentos menores para maior densidade de informação</span>
          </div>

          <div
            className={`${styles.optionBox} ${density === 'normal' ? styles.selectedBox : ''}`}
            onClick={() => handleDensityChange('normal')}
          >
            <span className={styles.optionBoxTitle}>Padrão</span>
            <span className={styles.optionBoxDesc}>Balanço ideal entre leitura e espaço visual</span>
          </div>

          <div
            className={`${styles.optionBox} ${density === 'comfortable' ? styles.selectedBox : ''}`}
            onClick={() => handleDensityChange('comfortable')}
          >
            <span className={styles.optionBoxTitle}>Confortável</span>
            <span className={styles.optionBoxDesc}>Espaçamento amplo para leitura relaxada</span>
          </div>
        </div>
      </section>

      {/* Preferências de Notificação e Acessibilidade */}
      <section className={styles.settingsCard}>
        <h2 className={styles.sectionTitle}>
          <Bell size={20} color="var(--primary)" /> Notificações & Acessibilidade
        </h2>

        <div className={styles.toggleRow}>
          <div className={styles.toggleLabel}>
            <span className={styles.toggleTitle}>Notificações Flutuantes Toast</span>
            <span className={styles.toggleSub}>Exibir avisos visuais de ações realizadas no sistema</span>
          </div>
          <input
            type="checkbox"
            checked={notifications}
            onChange={handleNotificationsToggle}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleLabel}>
            <span className={styles.toggleTitle}>Redução de Movimento</span>
            <span className={styles.toggleSub}>Desativar transições e animações visuais complexas</span>
          </div>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={handleMotionToggle}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
          />
        </div>
      </section>
    </div>
  )
}
