import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { usePosts } from '../hooks/usePosts'
import PopularDestinations from '../components/PopularDestinations'

const SORTS = [
  { key: 'newest', labelKey: 'home.newest' },
  { key: 'popular', labelKey: 'home.popular' },
  { key: 'top', labelKey: 'home.top' },
]

export default function Home() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [sort, setSort] = useState('newest')
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts(sort)
  const posts = data?.pages.flat() ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('common.home')}</h1>
        {user && (
          <Link
            to="/create"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('common.create')}
          </Link>
        )}
      </div>

      <PopularDestinations />

      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={
              s.key === sort
                ? 'pb-2 border-b-2 border-blue-600 text-blue-600 font-medium'
                : 'pb-2 text-gray-500 hover:text-gray-700'
            }
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-gray-500">{t('common.loading')}</p>}
      {isError && <p className="text-red-500">{error.message}</p>}
      {!isLoading && !isError && posts.length === 0 && (
        <p className="text-gray-500">{t('post.noResults')}</p>
      )}

      <ul className="space-y-3">
        {posts.map((post) => (
          <li
            key={post.id}
            className="border border-gray-200 dark:border-gray-700 rounded p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Link to={`/post/${post.id}`} className="block">
              <h2 className="text-lg font-semibold text-blue-600 hover:underline">{post.title}</h2>
              <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-2">
                <span>
                  {t('home.by')}{' '}
                  <Link
                    to={`/profile/${post.author_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline"
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
                <span>·</span>
                <span>{post.comment_count} {t('post.comments').toLowerCase()}</span>
                <span>·</span>
                <span>{post.view_count ?? 0} {t('post.views')}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {hasNextPage && (
        <div className="mt-6 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            {isFetchingNextPage ? t('common.loading') : t('home.loadMore')}
          </button>
        </div>
      )}
    </div>
  )
}
