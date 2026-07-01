import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from '../../../api/notifications'

function timeAgo(iso, locale) {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (minutes < 1) return rtf.format(0, 'minute')
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.round(hours / 24)
  return rtf.format(-days, 'day')
}

export default function NotificationsDropdown() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const { data: notifications = [], isLoading } = useNotifications()
  const { data: unreadCount = 0 } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  useEffect(() => {
    if (!open) return
    function onClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function handleClick(n) {
    if (!n.is_read) markAsRead.mutate(n.id)
    setOpen(false)
    if (n.post_id) navigate(`/post/${n.post_id}`)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label={t('notifications.open')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
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
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-teal-600 hover:text-teal-800"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="px-3 py-4 text-sm text-gray-500">{t('common.loading')}</div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-6 text-sm text-gray-500 text-center">
              {t('notifications.empty')}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.map((n) => {
                const actor = n.profiles
                const actorName = actor?.display_name || actor?.username || '?'
                const action = t(`notifications.${n.type}`)
                const postTitle = n.posts?.title || t('notifications.deletedPost')
                return (
                  <li
                    key={n.id}
                    className={`${
                      n.is_read ? '' : 'bg-teal-50 dark:bg-teal-950/30'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex gap-2"
                    >
                      {actor?.avatar_url ? (
                        <img
                          src={actor.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs flex-shrink-0">
                          {actorName[0]?.toUpperCase()}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          <span className="font-medium">@{actor?.username || '?'}</span>{' '}
                          {action}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{postTitle}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {timeAgo(n.created_at, i18n.language)}
                        </p>
                      </div>
                      {!n.is_read && (
                        <span className="w-2 h-2 mt-2 rounded-full bg-teal-500 flex-shrink-0" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
