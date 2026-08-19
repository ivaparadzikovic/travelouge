import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { PostWithRelations } from '../../../models'
import { postImageList } from '../../../api/posts'
import CountryFlag from '../../../components/CountryFlag'
import { compactTimeAgo } from '../../../utils/relativeTime'

interface PostCardProps {
  post: PostWithRelations
  showAuthor?: boolean
}

export default function PostCard({ post, showAuthor = true }: PostCardProps) {
  const { t, i18n } = useTranslation()
  const when = compactTimeAgo(post.created_at, i18n.language)
  const images = postImageList(post)

  return (
    <li className="group relative flex gap-3.5 rounded-xl border border-accent/60 bg-surface p-4 transition-[transform,box-shadow,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft/50 hover:shadow-[0_14px_30px_-16px_rgba(106,56,209,0.5)] focus-within:ring-2 focus-within:ring-accent dark:border-border dark:hover:bg-surface">
      <div className="min-w-0 flex-1">
        {}
        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
          {post.categories?.slug && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
              {t(`categories.${post.categories.slug}`, { defaultValue: post.categories.name })}
            </span>
          )}
          {post.countries?.code && (
            <span className="inline-flex items-center gap-1.5">
              <CountryFlag code={post.countries.code} />
              {t(`countries.${post.countries.code}`, { defaultValue: post.countries.name })}
              {when && <> · {when}</>}
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-bold tabular-nums">
            <span aria-hidden="true" className="text-up">↑</span>
            <span className="text-ink">{post.upvote_count ?? 0}</span>
            <span aria-hidden="true" className="ml-1 text-down">↓</span>
            <span className="font-medium text-muted">{post.downvote_count ?? 0}</span>
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
          {showAuthor && post.profiles?.username && (
            <>
              <Link to={`/profile/${post.author_id}`} className="relative hover:underline">
                @{post.profiles.username}
              </Link>
              <span aria-hidden="true">·</span>
            </>
          )}
          {typeof post.comment_count === 'number' && (
            <>
              <span>{post.comment_count} {t('post.comments').toLowerCase()}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{post.view_count ?? 0} {t('post.views')}</span>
        </div>
      </div>

      {}
      {images.length > 0 && (
        <div className="relative h-[88px] w-[88px] flex-shrink-0 self-center">
          <img
            src={images[0]}
            alt=""
            loading="lazy"
            className="h-full w-full rounded-[10px] object-cover"
          />
          {images.length > 1 && (
            <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="14" height="14" rx="2" />
                <path d="M7 21h12a2 2 0 0 0 2-2V9" />
              </svg>
              {images.length}
            </span>
          )}
        </div>
      )}
    </li>
  )
}
