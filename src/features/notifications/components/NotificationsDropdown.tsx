import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from '../../../api/notifications'
import type { NotificationWithRelations } from '../../../models'
import { useClickOutside } from '../../../hooks/useClickOutside'
import { useEscapeKey } from '../../../hooks/useEscapeKey'
import { NotificationBell } from './NotificationBell'
import { NotificationItem } from './NotificationItem'

export default function NotificationsDropdown() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const { data: notifications = [], isLoading } = useNotifications()
  const { data: unreadCountData } = useUnreadCount()
  const unreadCount = unreadCountData ?? 0
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  useClickOutside(rootRef, () => setOpen(false), open)
  useEscapeKey(() => {
    if (open) setOpen(false)
  })

  function handleSelect(n: NotificationWithRelations) {
    if (!n.is_read) markAsRead.mutate(n.id)
    setOpen(false)
    if (n.post_id) navigate(`/post/${n.post_id}`)
  }

  function renderList() {
    if (isLoading) {
      return <div className="px-3 py-4 text-sm text-muted">{t('common.loading')}</div>
    }

    if (notifications.length === 0) {
      return (
        <div className="px-3 py-6 text-sm text-muted text-center">
          {t('notifications.empty')}
        </div>
      )
    }

    return (
      <ul className="divide-y divide-border">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onSelect={handleSelect} />
        ))}
      </ul>
    )
  }

  return (
    <div className="relative" ref={rootRef}>
      <NotificationBell open={open} unreadCount={unreadCount} onToggle={() => setOpen((v) => !v)} />

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface border border-border rounded shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <h3 className="text-sm font-semibold">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-accent hover:text-accent-hover"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {renderList()}
        </div>
      )}
    </div>
  )
}
