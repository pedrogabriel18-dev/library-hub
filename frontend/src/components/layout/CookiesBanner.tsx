import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Modal } from '../ui/Modal'
import styles from './MainLayout.module.css'

export function CookiesBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookies_consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookies_consent', 'accepted')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <>
      <div className={styles.cookiesBanner}>
        <div className={styles.cookiesContent}>
          <p>
            Utilizamos cookies essenciais para garantir que você tenha a melhor experiência em nossa biblioteca.{' '}
            <Link to="/politica-de-cookies" className={styles.cookiesLink}>
              Política de Cookies
            </Link>
          </p>
          <div className={styles.cookiesActions}>
            <button className={styles.acceptCookiesBtn} onClick={acceptCookies}>
              Aceitar todos
            </button>
            <button className={styles.configCookiesBtn} onClick={() => setShowModal(true)}>
              Gerenciar preferências
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Preferências de Cookies e Privacidade"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
          <p>
            Em conformidade com a LGPD, o <strong>LibraryHub</strong> respeita sua privacidade.
            Os dados coletados são estritamente acadêmicos e educacionais para fins de controle de empréstimos e leituras.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <strong>Cookies Necessários</strong>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Essenciais para autenticação e navegação segura.</p>
            </div>
            <input type="checkbox" checked disabled />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              className={styles.acceptCookiesBtn}
              onClick={() => {
                acceptCookies()
                setShowModal(false)
              }}
            >
              Salvar e Continuar
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
