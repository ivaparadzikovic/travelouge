import { useTranslation } from 'react-i18next'
import type { NotificationWithRelations } from '../../../models'
import { Avatar } from '../../../components/Avatar'
import { useTimeAgo } from '../hooks/useTimeAgo'

interface NotificationItemProps {
  notification: NotificationWithRelations
  onSelect: (notification: NotificationWithRelations) => void
}

// A single notification row: actor avatar, actor name + action text,
// post title, relative time, and the unread dot.
export function NotificationItem({ notification: n, onSelect }: NotificationItemProps) {
  const { t, i18n } = useTranslation()
  const actor = n.profiles
  const actorName = actor?.display_name || actor?.username || '?'
  const action = t(`notifications.${n.type}`)
  const postTitle = n.posts?.title || t('notifications.deletedPost')
  const timeAgo = useTimeAgo(n.created_at, i18n.language)

  return (
    <li className={n.is_read ? '' : 'bg-teal-50 dark:bg-teal-950/30'}>
      <button
        type="button"
        onClick={() => onSelect(n)}
        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex gap-2"
      >
        <Avatar url={actor?.avatar_url} name={actorName} size="w-8 h-8" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            <span className="font-medium">@{actor?.username || '?'}</span> {action}
          </p>
          <p className="text-xs text-gray-500 truncate">{postTitle}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo}</p>
        </div>
        {!n.is_read && (
          <span className="w-2 h-2 mt-2 rounded-full bg-teal-500 flex-shrink-0" />
        )}
      </button>
    </li>
  )
}
