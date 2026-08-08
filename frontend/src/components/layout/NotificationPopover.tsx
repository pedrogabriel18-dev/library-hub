import { Bell, Check } from 'lucide-react'
import { AppNotification } from '@/services/NotificationService'
import styles from './MainLayout.module.css'

export interface NotificationPopoverProps {
  notifications: AppNotification[]
  isOpen: boolean
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationPopover({
  notifications,
  isOpen,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPopoverProps) {
  if (!isOpen) return null

  return (
    <div className={styles.bellPopover} onClick={e => e.stopPropagation()}>
      <div className={styles.popoverHeader}>
        <span className={styles.popoverTitle}>Notificações</span>
        {notifications.some(n => !n.read) && (
          <button className={styles.markAllBtn} onClick={onMarkAllAsRead}>
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className={styles.popoverList}>
        {notifications.length === 0 ? (
          <div className={styles.emptyNotifications}>
            <Bell size={24} color="var(--text-muted)" />
            <p>Nenhuma notificação no momento</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`${styles.popoverItem} ${!n.read ? styles.unreadItem : ''}`}
              onClick={() => !n.read && onMarkAsRead(n.id)}
            >
              <div className={styles.popoverItemContent}>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <small>{new Date(n.createdAt).toLocaleDateString('pt-BR')}</small>
              </div>
              {!n.read && (
                <button
                  className={styles.readCheckBtn}
                  onClick={e => {
                    e.stopPropagation()
                    onMarkAsRead(n.id)
                  }}
                  title="Marcar como lida"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
