import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, AlertTriangle, AlertCircle, Info, X, RotateCcw } from 'lucide-react'
import styles from '../components/ui/Toast.module.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastItem {
  id: string
  type: ToastType
  title?: string
  message: string
  action?: ToastAction
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType, title?: string, action?: ToastAction) => void
  success: (message: string, title?: string, action?: ToastAction) => void
  error: (message: string, title?: string, action?: ToastAction) => void
  warning: (message: string, title?: string, action?: ToastAction) => void
  info: (message: string, title?: string, action?: ToastAction) => void
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string, action?: ToastAction) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, type, title, message, action }])

    setTimeout(() => {
      removeToast(id)
    }, 4500)
  }, [removeToast])

  const success = useCallback((message: string, title?: string, action?: ToastAction) => showToast(message, 'success', title, action), [showToast])
  const error = useCallback((message: string, title?: string, action?: ToastAction) => showToast(message, 'error', title, action), [showToast])
  const warning = useCallback((message: string, title?: string, action?: ToastAction) => showToast(message, 'warning', title, action), [showToast])
  const info = useCallback((message: string, title?: string, action?: ToastAction) => showToast(message, 'info', title, action), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map(t => {
          const variantClass =
            t.type === 'success'
              ? styles.toastSuccess
              : t.type === 'error'
              ? styles.toastError
              : t.type === 'warning'
              ? styles.toastWarning
              : styles.toastInfo

          return (
            <div key={t.id} className={`${styles.toast} ${variantClass}`}>
              {t.type === 'success' && <CheckCircle size={20} color="var(--success)" />}
              {t.type === 'error' && <AlertCircle size={20} color="var(--error-text)" />}
              {t.type === 'warning' && <AlertTriangle size={20} color="var(--warning-text)" />}
              {t.type === 'info' && <Info size={20} color="var(--accent)" />}

              <div className={styles.toastContent}>
                {t.title && <span className={styles.toastTitle}>{t.title}</span>}
                <p className={styles.toastMessage}>{t.message}</p>
              </div>

              {t.action && (
                <button
                  onClick={() => {
                    t.action?.onClick()
                    removeToast(t.id)
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--sp-1)',
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    padding: 'var(--sp-1) var(--sp-2)',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-semibold)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    marginRight: 'var(--sp-2)',
                  }}
                >
                  <RotateCcw size={12} /> {t.action.label}
                </button>
              )}

              <button className={styles.closeBtn} onClick={() => removeToast(t.id)} aria-label="Fechar notificação">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider')
  }
  return context
}
