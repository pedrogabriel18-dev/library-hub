import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import {
  Home, BookOpen, FileText,
  User, LogOut, Sun, Moon,
  Shield, BookMarked, Info,
  Bell, Search, Contrast
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { useNotifications } from '@/hooks/useNotifications'
import UserAvatar from '../UserAvatar'
import { CommandPalette } from '../ui/CommandPalette'
import { SearchModal } from '../ui/SearchModal'
import { ShortcutsModal } from '../ui/ShortcutsModal'
import { OfflineBanner } from '../common/OfflineBanner'
import { Modal } from '../ui/Modal'
import { NotificationPopover } from './NotificationPopover'
import { CookiesBanner } from './CookiesBanner'
import { ROLE_LABELS } from '@/constants/roles'
import { UserRole } from '@/types'
import { useSearch } from '@/hooks/useSearch'
import styles from './MainLayout.module.css'

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: Home, exact: true },
  { to: '/livros', label: 'Livros', icon: BookOpen, exact: false },
  { to: '/tccs', label: 'TCCs', icon: FileText, exact: false },
  { to: '/sobre', label: 'Sobre', icon: Info, exact: false },
]

const ADMIN_NAV = [
  { to: '/admin', label: 'Painel', icon: Shield, exact: true },
  { to: '/admin/moderacao', label: 'Moderação', icon: BookMarked, exact: false },
  { to: '/admin/usuarios', label: 'Usuários', icon: User, exact: false },
]

export default function MainLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, isHighContrast, toggleHighContrast } = useTheme()
  const { isOpen: searchOpen, closeSearch } = useSearch()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const isAdmin = user?.role === 'LIBRARIAN' || user?.role === 'DEVELOPER' || user?.role === 'ADVISOR'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        setShortcutsOpen(prev => !prev)
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        toggleTheme()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleTheme])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.layout}>
      <OfflineBanner />
      <CookiesBanner />

      {/* Navbar */}
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navContainer}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <BookOpen size={18} color="#ffffff" />
            </div>
            <span className={styles.logoText}>Library<strong>Hub</strong></span>
          </Link>

          {/* Navigation Links */}
          <nav className={styles.navLinks}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}

            {isAdmin && (
              <div className={styles.adminGroup}>
                <span className={styles.adminDivider} />
                {ADMIN_NAV.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      className={({ isActive }) => `${styles.navLink} ${styles.adminLink} ${isActive ? styles.active : ''}`}
                    >
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            )}
          </nav>

          {/* Search Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className={styles.searchTrigger}
            title="Buscar (Ctrl+K)"
          >
            <Search size={15} />
            <span className={styles.searchText}>Buscar...</span>
            <kbd className={styles.searchKbd}>⌘K</kbd>
          </button>

          {/* Action Buttons */}
          <div className={styles.navActions}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={styles.iconBtn}
              title={`Alternar tema (Ctrl+Shift+L)`}
              aria-label="Alternar tema de cores"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* High Contrast */}
            <button
              onClick={toggleHighContrast}
              className={`${styles.iconBtn} ${isHighContrast ? styles.activeIcon : ''}`}
              title="Alto Contraste"
              aria-label="Modo Alto Contraste"
            >
              <Contrast size={17} />
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setBellOpen(!bellOpen)}
                className={`${styles.iconBtn} ${unreadCount > 0 ? styles.hasNotifications : ''}`}
                title="Notificações"
                aria-label="Notificações"
              >
                <Bell size={17} />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
              </button>

              <NotificationPopover
                isOpen={bellOpen}
                onClose={() => setBellOpen(false)}
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
            </div>

            {/* User Profile */}
            {user && (
              <div className={styles.userMenu}>
                <Link to="/perfil" className={styles.userProfileLink}>
                  <UserAvatar avatarId={user.avatarId} name={user.name} size="sm" />
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name}</span>
                    <span className={styles.userRole}>
                      {ROLE_LABELS[user.role as UserRole] || user.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className={styles.logoutBtn}
                  title="Sair da conta"
                  aria-label="Sair da conta"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerInfo}>
            <div className={styles.footerLogo}>
              <BookOpen size={14} />
              <span>Library<strong>Hub</strong></span>
            </div>
            <p>Plataforma open source de gestão de biblioteca escolar.</p>
          </div>

          <div className={styles.footerLinks}>
            <Link to="/livros">Livros</Link>
            <Link to="/tccs">TCCs</Link>
            <Link to="/sobre">Sobre</Link>
            <Link to="/politica-de-privacidade">Privacidade</Link>
            <Link to="/termos-de-uso">Termos</Link>
          </div>

          <div className={styles.footerRight}>
            <button onClick={() => setShortcutsOpen(true)} className={styles.footerShortcutBtn}>
              Atalhos de teclado
            </button>
            <span className={styles.footerCopyright}>
              © {new Date().getFullYear()} LibraryHub
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <SearchModal isOpen={searchOpen} onClose={closeSearch} />
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onOpenShortcuts={() => setShortcutsOpen(true)} />
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirmar Saída"
      >
        <div className={styles.logoutModalContent}>
          <p>Tem certeza de que deseja encerrar sua sessão?</p>
          <div className={styles.modalActions}>
            <button
              onClick={() => setShowLogoutModal(false)}
              className={styles.cancelBtn}
            >
              Cancelar
            </button>
            <button
              onClick={handleLogout}
              className={styles.confirmLogoutBtn}
            >
              Sim, sair
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
