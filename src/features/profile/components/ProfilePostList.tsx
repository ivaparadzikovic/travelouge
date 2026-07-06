import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Tables } from '../../../models'

export interface ProfilePostListItem {
  id: string
  title: string
  upvote_count: number
  downvote_count: number
  categories: Pick<Tables<'categories'>, 'name' | 'slug'> | null
  countries: Pick<Tables<'countries'>, 'name' | 'code'> | null
}

interface ProfilePostListProps {
  posts: ProfilePostListItem[] | undefined
  isEmpty: boolean
  emptyMessage: string
}

export function ProfilePostList({ posts, isEmpty, emptyMessage }: ProfilePostListProps) {
  const { t } = useTranslation()

  return (
    <>
      {isEmpty && <p className="text-muted">{emptyMessage}</p>}
      {posts?.map((post) => (
        <div key={post.id} className="border-b border-border py-3">
          <Link to={`/post/${post.id}`} className="text-accent hover:underline font-medium">
            {post.title}
          </Link>
          <div className="text-sm text-muted mt-1">
            {t(`categories.${post.categories?.slug}`, { defaultValue: post.categories?.name })} ·{' '}
            {t(`countries.${post.countries?.code}`, { defaultValue: post.countries?.name })} ·{' '}
            <span className="text-up">↑ {post.upvote_count}</span>{' '}
            <span className="text-down">↓ {post.downvote_count}</span>
          </div>
        </div>
      ))}
    </>
  )
}
