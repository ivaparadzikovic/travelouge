import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../stores/auth'
import { useIsBookmarked, useToggleBookmark } from '../../../api/bookmarks'

export default function BookmarkButton({ postId }) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { data: bookmarked = false } = useIsBookmarked(postId)
  const toggle = useToggleBookmark()

  const handleClick = () => {
    if (!user || toggle.isPending) return
    toggle.mutate({ postId, bookmarked })
  }

  const disabled = !user || toggle.isPending
  const label = bookmarked ? t('post.unsave') : t('post.save')

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={!user ? t('post.signInToSave') : label}
      aria-pressed={bookmarked}
      aria-label={label}
      className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5.25A2.25 2.25 0 0 1 7.25 3h9.5A2.25 2.25 0 0 1 19 5.25V21l-7-4.5L5 21V5.25Z" />
      </svg>
      <span>{label}</span>
    </button>
  )
}
