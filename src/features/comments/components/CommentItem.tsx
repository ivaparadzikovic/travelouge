import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../../../components/Avatar'
import { MAX_COMMENT_LENGTH } from '../constants'
import type { CommentWithLikeStatus } from '../../../models'

interface CommentItemProps {
  comment: CommentWithLikeStatus
  currentUserId?: string
  isEditing: boolean
  editValue: string
  onEditValueChange: (value: string) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  isSaving: boolean
  onDelete: () => void
  isDeleting: boolean
  onToggleLike: () => void
  isTogglingLike: boolean
  canInteract: boolean
  onReply: (username?: string | null) => void
}

export default function CommentItem({
  comment: c,
  currentUserId,
  isEditing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  isSaving,
  onDelete,
  isDeleting,
  onToggleLike,
  isTogglingLike,
  canInteract,
  onReply,
}: CommentItemProps) {
  const { t, i18n } = useTranslation()
  const author = c.profiles
  const authorName = author?.display_name || author?.username || '?'
  const createdAt = new Date(c.created_at).toLocaleString(i18n.language)
  const isOwner = currentUserId === c.author_id

  return (
    <li className="flex gap-3 p-3 bg-surface-2 rounded">
      <Link to={`/profile/${c.author_id}`} className="flex-shrink-0">
        <Avatar url={author?.avatar_url} name={authorName} size="w-9 h-9" initialsClassName="text-sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm text-muted mb-1">
          <Link
            to={`/profile/${c.author_id}`}
            className="font-medium text-ink hover:underline"
          >
            @{author?.username || '?'}
          </Link>
          <span>·</span>
          <span>{createdAt}</span>
          {c.is_edited && <span className="italic">({t('post.edited')})</span>}
          {isOwner && !isEditing && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={onStartEdit}
                className="text-muted hover:text-accent"
              >
                {t('common.edit')}
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className="text-down hover:opacity-80"
              >
                {t('common.delete')}
              </button>
            </>
          )}
        </div>
        {isEditing ? (
          <div>
            <textarea
              rows={3}
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              maxLength={MAX_COMMENT_LENGTH}
              aria-label={t('common.edit')}
              className="w-full px-3 py-2 border border-border rounded bg-surface"
            />
            <div className="mt-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3 py-1 text-sm border border-border rounded hover:bg-surface-2"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={onSaveEdit}
                disabled={isSaving || !editValue.trim()}
                className="px-3 py-1 text-sm bg-accent text-accent-ink rounded hover:bg-accent-hover disabled:opacity-50"
              >
                {isSaving ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-ink whitespace-pre-wrap break-words">
            {c.body}
          </p>
        )}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => onReply(author?.username)}
            disabled={!canInteract}
            aria-label={canInteract ? t('comments.reply') : t('comments.signInToReply')}
            title={!canInteract ? t('comments.signInToReply') : undefined}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent rounded px-1.5 py-0.5 transition-colors disabled:cursor-not-allowed disabled:hover:text-muted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
            <span>{t('comments.reply')}</span>
          </button>
        </div>
      </div>
      <div className="flex-shrink-0 self-start">
        <button
          type="button"
          onClick={onToggleLike}
          disabled={!canInteract || isTogglingLike}
          aria-pressed={c.liked_by_me}
          aria-label={
            canInteract
              ? c.liked_by_me
                ? t('comments.unlike')
                : t('comments.like')
              : t('comments.signInToLike')
          }
          title={!canInteract ? t('comments.signInToLike') : undefined}
          className={`inline-flex flex-col items-center gap-0.5 text-sm rounded px-1.5 py-1 transition-colors ${
            c.liked_by_me ? 'text-down' : 'text-muted hover:text-down'
          } disabled:cursor-not-allowed disabled:hover:text-muted`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={c.liked_by_me ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.8}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
          <span className="tabular-nums text-xs">{c.like_count ?? 0}</span>
        </button>
      </div>
    </li>
  )
}
