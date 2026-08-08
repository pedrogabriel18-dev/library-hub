import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, AlertCircle, Check, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import styles from './ChangePasswordPage.module.css'

export default function ChangePasswordPage() {
  const { updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Critérios de segurança da senha
  const hasMinLength = next.length >= 8
  const hasUppercase = /[A-Z]/.test(next)
  const hasLowercase = /[a-z]/.test(next)
  const hasNumber = /[0-9]/.test(next)
  const hasSpecial = /[^A-Za-z0-9]/.test(next)
  
  const passwordsMatch = next === confirm && confirm.length > 0
  const allRulesMet = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial
  const canSubmit = allRulesMet && passwordsMatch

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!allRulesMet) {
      setError('A nova senha não atende a todos os requisitos de segurança.')
      return
    }

    if (next !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setIsLoading(true)

    try {
      await api.put('/auth/password', { newPassword: next })
      updateUser({ mustChangePassword: false })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar senha.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <Lock size={28} />
        </div>

        <h1>Primeiro acesso</h1>
        <p className={styles.desc}>
          Por motivos de segurança, é necessário alterar sua senha antes de continuar utilizando a plataforma. Essa etapa é obrigatória e será realizada apenas uma vez.
        </p>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="new-password">Nova senha</label>
            <input
              id="new-password"
              type="password"
              placeholder="Digite sua nova senha"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirm-password">Confirmar nova senha</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Confirme sua nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <div className={styles.requirements}>
            <h3>Regras da nova senha:</h3>
            <ul>
              <li className={hasMinLength ? styles.met : styles.unmet}>
                {hasMinLength ? <Check size={14} className={styles.checkIcon} /> : <X size={14} className={styles.xIcon} />}
                Mínimo de 8 caracteres
              </li>
              <li className={hasUppercase ? styles.met : styles.unmet}>
                {hasUppercase ? <Check size={14} className={styles.checkIcon} /> : <X size={14} className={styles.xIcon} />}
                Pelo menos uma letra maiúscula
              </li>
              <li className={hasLowercase ? styles.met : styles.unmet}>
                {hasLowercase ? <Check size={14} className={styles.checkIcon} /> : <X size={14} className={styles.xIcon} />}
                Pelo menos uma letra minúscula
              </li>
              <li className={hasNumber ? styles.met : styles.unmet}>
                {hasNumber ? <Check size={14} className={styles.checkIcon} /> : <X size={14} className={styles.xIcon} />}
                Pelo menos um número
              </li>
              <li className={hasSpecial ? styles.met : styles.unmet}>
                {hasSpecial ? <Check size={14} className={styles.checkIcon} /> : <X size={14} className={styles.xIcon} />}
                Pelo menos um caractere especial (ex: @, #, $, %)
              </li>
            </ul>
          </div>

          {confirm.length > 0 && (
            <div className={passwordsMatch ? styles.matchSuccess : styles.matchError}>
              {passwordsMatch ? <Check size={14} className={styles.checkIcon} /> : <X size={14} className={styles.xIcon} />}
              {passwordsMatch ? 'As senhas coincidem!' : 'As senhas não coincidem.'}
            </div>
          )}

          <button type="submit" className={styles.btn} disabled={!canSubmit || isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>

        <button className={styles.logoutLink} onClick={() => { logout(); navigate('/login') }}>
          Voltar ao login
        </button>
      </div>
    </div>
  )
}
