import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Avatar } from '../../../components/Avatar'
import CountryFlag from '../../../components/CountryFlag'
import type { PostWithRelations } from '../../../models'

interface PostMetaProps {
  post: PostWithRelations
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}

export default function PostMeta({ post, isOwner, onEdit, onDelete, isDeleting }: PostMetaProps) {
  const { t, i18n } = useTranslation()
  const createdAt = new Date(post.created_at).toLocaleString(i18n.language)

  return (
    <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 flex-wrap">
      <Link to={`/profile/${post.author_id}`} className="flex items-center gap-2 hover:underline">
        <Avatar url={post.profiles?.avatar_url} name={post.profiles?.username} size="w-6 h-6" />
        <span>@{post.profiles?.username}</span>
      </Link>
      <span>·</span>
      {post.categories?.slug ? (
        <Link
          to={`/browse?category=${post.categories.slug}`}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60"
        >
          {t(`categories.${post.categories.slug}`, { defaultValue: post.categories.name })}
        </Link>
      ) : null}
      <span>·</span>
      {post.countries?.code ? (
        <Link
          to={`/browse?country=${post.countries.code}`}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <CountryFlag code={post.countries.code} className="h-3 w-4" />
          {t(`countries.${post.countries.code}`, { defaultValue: post.countries.name })}
        </Link>
      ) : null}
      <span>·</span>
      <span>{createdAt}</span>
      {post.is_edited && <span className="italic">({t('post.edited')})</span>}
      {isOwner && (
        <>
          <span>·</span>
          <button
            type="button"
            onClick={onEdit}
            className="text-gray-600 hover:text-teal-600 dark:text-gray-300"
          >
            {t('common.edit')}
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            {t('common.delete')}
          </button>
        </>
      )}
    </div>
  )
}
