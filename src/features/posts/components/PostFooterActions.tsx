import { useTranslation } from 'react-i18next'
import VoteControls from './VoteControls'
import ShareButton from './ShareButton'
import type { PostWithRelations } from '../../../models'

interface PostFooterActionsProps {
  post: PostWithRelations
  onCommentsClick?: () => void
}

export default function PostFooterActions({ post, onCommentsClick }: PostFooterActionsProps) {
  const { t } = useTranslation()

  return (
    <div className="mt-8 flex items-center gap-4 rounded-xl border border-accent bg-surface-2 px-4 py-3 text-sm text-muted dark:border-border">
      <VoteControls
        postId={post.id}
        authorId={post.author_id}
        upvoteCount={post.upvote_count}
        downvoteCount={post.downvote_count}
      />
      <span>·</span>
      <button
        type="button"
        onClick={onCommentsClick}
        className="rounded transition-colors hover:text-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {post.comment_count} {t('post.comments').toLowerCase()}
      </button>
      <span>·</span>
      <ShareButton
        url={`${window.location.origin}/post/${post.id}`}
        shareUrl={
          import.meta.env.VITE_SHARE_URL_BASE
            ? `${import.meta.env.VITE_SHARE_URL_BASE}?id=${post.id}`
            : undefined
        }
        title={post.title}
      />
      <span>·</span>
      <span aria-label={t('post.views')} className="inline-flex items-center gap-1">
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
            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <span className="tabular-nums">{post.view_count ?? 0}</span>{' '}
        {t(post.view_count === 1 ? 'post.view' : 'post.views')}
      </span>
    </div>
  )
}
