import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import { usePosts } from '../../api/posts'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import PopularDestinations from './components/PopularDestinations'
import PostCard from './components/PostCard'
import PostCardSkeleton from './components/PostCardSkeleton'

const SORTS = [
  { key: 'newest', labelKey: 'home.newest' },
  { key: 'popular', labelKey: 'home.popular' },
  { key: 'top', labelKey: 'home.top' },
]

export default function Home() {
  const { t } = useTranslation()
  useDocumentTitle(t('common.home'))
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
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
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
                ? 'pb-2 border-b-2 border-teal-600 text-teal-600 font-medium'
                : 'pb-2 text-gray-500 hover:text-gray-700'
            }
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>

      {isError && <p className="text-red-500">{error.message}</p>}
      {!isLoading && !isError && posts.length === 0 && (
        <p className="text-gray-500">{t('post.noResults')}</p>
      )}

      <ul className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.map((post) => <PostCard key={post.id} post={post} />)}
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
