import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function PostCard({ post }) {
  const { t } = useTranslation()
  return (
    <li className="relative border border-gray-200 dark:border-gray-700 rounded p-4 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-sm focus-within:ring-2 focus-within:ring-teal-500 transition">
      <h2 className="text-lg font-semibold mb-1">
        <Link
          to={`/post/${post.id}`}
          className="text-teal-600 hover:underline before:absolute before:inset-0 before:content-['']"
        >
          {post.title}
        </Link>
      </h2>
      <div className="relative text-sm text-gray-500 flex flex-wrap gap-x-2">
        <span>
          {t('home.by')}{' '}
          <Link
            to={`/profile/${post.author_id}`}
            className="relative hover:underline"
          >
            @{post.profiles?.username}
          </Link>
        </span>
        <span>·</span>
        <span>{t(`categories.${post.categories?.slug}`, { defaultValue: post.categories?.name })}</span>
        <span>·</span>
        <span>{t(`countries.${post.countries?.code}`, { defaultValue: post.countries?.name })}</span>
        <span>·</span>
        <span className="text-green-700 dark:text-green-400">↑ {post.upvote_count}</span>
        <span className="text-red-700 dark:text-red-400">↓ {post.downvote_count}</span>
        {typeof post.comment_count === 'number' && (
          <>
            <span>·</span>
            <span>{post.comment_count} {t('post.comments').toLowerCase()}</span>
          </>
        )}
        <span>·</span>
        <span>{post.view_count ?? 0} {t('post.views')}</span>
      </div>
    </li>
  )
}
