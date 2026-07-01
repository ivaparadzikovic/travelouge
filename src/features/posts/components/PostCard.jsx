import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function PostCard({ post }) {
  const { t } = useTranslation()
  const score = (post.upvote_count ?? 0) - (post.downvote_count ?? 0)
  const createdAt = post.created_at
    ? new Date(post.created_at).toLocaleDateString()
    : null

  return (
    <li className="group relative flex gap-4 rounded-xl border border-border bg-surface p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_14px_30px_-16px_rgba(79,91,240,0.5)] focus-within:ring-2 focus-within:ring-accent">
      {/* Vote rail — net score (voting happens on the post page) */}
      <div className="flex w-10 flex-shrink-0 flex-col items-center gap-0.5 text-muted">
        <span aria-hidden="true" className="text-sm leading-none">↑</span>
        <span className="font-display text-[15px] font-bold tabular-nums text-ink">{score}</span>
        <span aria-hidden="true" className="text-sm leading-none">↓</span>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
          {post.categories?.slug && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
              {t(`categories.${post.categories.slug}`, { defaultValue: post.categories.name })}
            </span>
          )}
          <span>
            {t(`countries.${post.countries?.code}`, { defaultValue: post.countries?.name })}
            {createdAt && <> · {createdAt}</>}
          </span>
        </div>

        <h2 className="mb-1.5 font-display text-base font-semibold leading-snug text-ink">
          <Link
            to={`/post/${post.id}`}
            className="before:absolute before:inset-0 before:content-['']"
          >
            {post.title}
          </Link>
        </h2>

        {post.body && (
          <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-muted">{post.body}</p>
        )}

        <div className="relative flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
          <Link to={`/profile/${post.author_id}`} className="relative hover:underline">
            @{post.profiles?.username}
          </Link>
          {typeof post.comment_count === 'number' && (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.comment_count} {t('post.comments').toLowerCase()}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{post.view_count ?? 0} {t('post.views')}</span>
        </div>
      </div>

      {/* Optional thumbnail — self-contained, no reflow when absent */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt=""
          loading="lazy"
          className="h-[92px] w-[92px] flex-shrink-0 rounded-[10px] object-cover"
        />
      )}
    </li>
  )
}
