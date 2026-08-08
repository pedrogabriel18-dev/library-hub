import { useState, useCallback, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, AlertCircle, Moon, Sun, GraduationCap, UserCheck, Terminal } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import styles from './LoginPage.module.css'

type RoleId = 'STUDENT' | 'LIBRARIAN' | 'ADVISOR' | 'DEVELOPER'

const ROLES = [
  { id: 'STUDENT'   as RoleId, label: 'Aluno' },
  { id: 'LIBRARIAN' as RoleId, label: 'Bibliotecária' },
  { id: 'ADVISOR'   as RoleId, label: 'Orientador' },
  { id: 'DEVELOPER' as RoleId, label: 'Desenvolvedor' },
] as const

const VALID_ROLES = new Set<string>(['STUDENT', 'LIBRARIAN', 'ADVISOR', 'DEVELOPER'])

function getSavedRole(): RoleId {
  const saved = localStorage.getItem('lastSelectedRole')
  return (saved && VALID_ROLES.has(saved) ? saved : 'STUDENT') as RoleId
}

const RoleIcon: Record<RoleId, JSX.Element> = {
  STUDENT:   <GraduationCap size={14} aria-hidden />,
  LIBRARIAN: <BookOpen      size={14} aria-hidden />,
  ADVISOR:   <UserCheck     size={14} aria-hidden />,
  DEVELOPER: <Terminal      size={14} aria-hidden />,
}

export default function LoginPage() {
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState<RoleId>(getSavedRole)
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleChange = useCallback((role: RoleId) => {
    setSelectedRole(role)
    localStorage.setItem('lastSelectedRole', role)
  }, [])

  const togglePwd = useCallback(() => setShowPassword(v => !v), [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isLoading) return
    setError('')
    setIsLoading(true)
    try {
      const { mustChangePassword } = await login(loginValue, password, selectedRole)
      navigate(mustChangePassword ? '/alterar-senha' : '/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Subtle background */}
      <div className={styles.pageBg} aria-hidden />

      {/* Theme toggle */}
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {/* Login Card */}
      <div className={styles.card}>
        {/* Header */}
        <header className={styles.cardHeader}>
          <div className={styles.logoMark} aria-hidden>
            <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <h1 className={styles.title}>LibraryHub</h1>
          <p className={styles.subtitle}>
            Plataforma de Gestão de Biblioteca Escolar
          </p>
        </header>

        <div className={styles.divider} aria-hidden />

        {/* Role Selector — 2×2 Grid */}
        <div className={styles.roleTabsContainer}>
          <span className={styles.roleTabsLabel} id="role-label">Perfil de acesso</span>
          <div
            className={styles.roleGrid2x2}
            role="group"
            aria-labelledby="role-label"
          >
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleChange(r.id)}
                className={`${styles.roleCell} ${selectedRole === r.id ? styles.roleCellActive : ''}`}
                aria-pressed={selectedRole === r.id}
              >
                <span className={styles.roleCellIcon}>{RoleIcon[r.id]}</span>
                <span className={styles.roleCellLabel}>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={styles.errorAlert} role="alert" aria-live="assertive">
            <AlertCircle size={15} aria-hidden />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="login-input" className={styles.label}>
              Login
            </label>
            <input
              id="login-input"
              type="text"
              placeholder="Ex: admin@libraryhub.dev"
              value={loginValue}
              onChange={e => setLoginValue(e.target.value)}
              className={styles.input}
              required
              autoFocus
              autoComplete="username"
              disabled={isLoading}
              aria-required="true"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password-input" className={styles.label}>
              Senha
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="current-password"
                disabled={isLoading}
                aria-required="true"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={togglePwd}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading || !loginValue || !password}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} aria-hidden />
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <p className={styles.hint}>
          Demo: <strong>admin@libraryhub.dev</strong> · <strong>student@libraryhub.dev</strong>
        </p>
      </div>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} LibraryHub</span>
        <span aria-hidden>·</span>
        <span>Licença MIT</span>
      </footer>
    </div>
  )
}
