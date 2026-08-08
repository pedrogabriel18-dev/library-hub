import { useState } from 'react'
import { PREDEFINED_REJECTION_REASONS } from '../../../constants/rejectionReasons'
import { Modal } from '../../../components/ui/Modal'

export interface ReviewRejectModalProps {
  isOpen: boolean
  onClose: () => void
  bookTitle: string
  onConfirmReject: (reason: string) => Promise<void>
}

export function ReviewRejectModal({
  isOpen,
  onClose,
  bookTitle,
  onConfirmReject,
}: ReviewRejectModalProps) {
  const [selectedReason, setSelectedReason] = useState(PREDEFINED_REJECTION_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const finalReason = selectedReason === 'Outro' ? customReason : selectedReason
      await onConfirmReject(finalReason || 'Conteúdo em desacordo com as diretrizes.')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Rejeitar Avaliação — ${bookTitle}`}
      footer={
        <>
          <button
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: '#dc2626',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Rejeitando...' : 'Confirmar Rejeição'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Selecione o motivo pelo qual a avaliação não atende às diretrizes de publicação:
        </p>

        <select
          value={selectedReason}
          onChange={e => setSelectedReason(e.target.value)}
          style={{
            padding: '0.6rem 0.8rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
          }}
        >
          {PREDEFINED_REJECTION_REASONS.map(r => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {selectedReason === 'Outro' && (
          <textarea
            placeholder="Descreva o motivo da rejeição..."
            value={customReason}
            onChange={e => setCustomReason(e.target.value)}
            rows={3}
            style={{
              padding: '0.6rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          />
        )}
      </div>
    </Modal>
  )
}
