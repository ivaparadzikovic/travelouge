import { useTranslation } from 'react-i18next'
import type { NotificationWithRelations } from '../../../models'
import { Avatar } from '../../../components/Avatar'
import { formatTimeAgo } from '../timeAgo'

interface NotificationItemProps {
  notification: NotificationWithRelations
  onSelect: (notification: NotificationWithRelations) => void
}


export function NotificationItem({ notification: n, onSelect }: NotificationItemProps) {
  const { t, i18n } = useTranslation()
  const actor = n.profiles
  const actorName = actor?.display_name || actor?.username || '?'
  const action = t(`notifications.${n.type}`)
  const postTitle = n.posts?.title || t('notifications.deletedPost')
  const timeAgo = formatTimeAgo(n.created_at, i18n.language)

  return (
    <li className={n.is_read ? '' : 'bg-accent-soft'}>
      <button
        type="button"
        onClick={() => onSelect(n)}
        className="w-full text-left px-3 py-2 hover:bg-surface-2 flex gap-2"
      >
        <Avatar url={actor?.avatar_url} name={actorName} size="w-8 h-8" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink">
            <span className="font-medium">@{actor?.username || '?'}</span> {action}
          </p>
          <p className="text-xs text-muted truncate">{postTitle}</p>
          <p className="text-[11px] text-muted mt-0.5">{timeAgo}</p>
        </div>
        {!n.is_read && (
          <span className="w-2 h-2 mt-2 rounded-full bg-accent flex-shrink-0" />
        )}
      </button>
    </li>
  )
}
