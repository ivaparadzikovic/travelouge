import { useTranslation } from 'react-i18next'
import { MAX_BADGE_COUNT } from '../constants'

interface NotificationBellProps {
  open: boolean
  unreadCount: number
  onToggle: () => void
}

// Trigger button + unread badge for the notifications dropdown.
export function NotificationBell({ open, unreadCount, onToggle }: NotificationBellProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      aria-label={t('notifications.open')}
      aria-expanded={open}
      onClick={onToggle}
      className={`relative rounded p-1.5 transition-colors hover:bg-surface-2 ${
        unreadCount > 0 ? 'text-accent' : 'text-muted'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-down text-white text-[10px] leading-none min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
          {unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unreadCount}
        </span>
      )}
    </button>
  )
}
