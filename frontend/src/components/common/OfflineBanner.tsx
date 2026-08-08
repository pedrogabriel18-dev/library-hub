import { useEffect, useRef } from 'react'
import { WifiOff } from 'lucide-react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useToast } from '@/contexts/ToastContext'

export function OfflineBanner() {
  const isOnline = useNetworkStatus()
  const toast = useToast()
  const wasOffline = useRef(false)

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true
    } else if (wasOffline.current) {
      toast.success('Sua conexão com a internet foi restabelecida!')
      wasOffline.current = false
    }
  }, [isOnline, toast])

  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'var(--danger, #ef4444)',
        color: '#ffffff',
        padding: '0.6rem 1.25rem',
        borderRadius: 'var(--radius-full, 9999px)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <WifiOff size={18} />
      <span>Você está desconectado. Verifique sua conexão com a internet.</span>
    </div>
  )
}
