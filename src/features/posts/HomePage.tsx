import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import { usePosts } from '../../api/posts'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import PopularDestinations from './components/PopularDestinations'
import PostCard from './components/PostCard'
import PostCardSkeleton from './components/PostCardSkeleton'
import { SKELETON_PLACEHOLDER_COUNT } from './constants'

interface Sort {
  key: string
  labelKey: string
}

const SORTS: Sort[] = [
  { key: 'newest', labelKey: 'home.newest' },
  { key: 'popular', labelKey: 'home.popular' },
  { key: 'top', labelKey: 'home.top' },
]

export default function Home() {
  const { t } = useTranslation()
  useDocumentTitle(t('common.home'))
  const user = useAuthStore((state) => state.user)
  const [sort, setSort] = useState<string>('newest')
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts(sort)
  const posts = data?.pages.flat() ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('common.home')}</h1>
        {user && (
          <Link
            to="/create"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-hover transition-colors"
          >
            {t('common.create')}
          </Link>
        )}
      </div>

      <PopularDestinations />

      <div className="flex gap-5 mb-4 border-b border-border">
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={
              s.key === sort
                ? 'pb-2.5 border-b-2 border-accent text-accent text-sm font-semibold'
                : 'pb-2.5 border-b-2 border-transparent text-sm text-muted hover:text-ink transition-colors'
            }
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>

      {isError && <p className="text-down">{error?.message}</p>}
      {!isLoading && !isError && posts.length === 0 && (
        <p className="text-muted">{t('post.noResults')}</p>
      )}

      <ul className="space-y-2.5">
        {isLoading
          ? Array.from({ length: SKELETON_PLACEHOLDER_COUNT }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.map((post) => <PostCard key={post.id} post={post} />)}
      </ul>

      {hasNextPage && (
        <div className="mt-6 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2 disabled:opacity-50 transition-colors"
          >
            {isFetchingNextPage ? t('common.loading') : t('home.loadMore')}
          </button>
        </div>
      )}
    </div>
  )
}
