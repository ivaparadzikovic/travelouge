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
    <div className="flex items-center gap-3 text-sm text-muted mb-6 flex-wrap">
      <Link to={`/profile/${post.author_id}`} className="flex items-center gap-2 hover:underline">
        <Avatar url={post.profiles?.avatar_url} name={post.profiles?.username} size="w-6 h-6" />
        <span>@{post.profiles?.username}</span>
      </Link>
      <span>·</span>
      {post.categories?.slug ? (
        <Link
          to={`/browse?category=${post.categories.slug}`}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-accent-soft text-accent hover:brightness-95"
        >
          {t(`categories.${post.categories.slug}`, { defaultValue: post.categories.name })}
        </Link>
      ) : null}
      <span>·</span>
      {post.countries?.code ? (
        <Link
          to={`/browse?country=${post.countries.code}`}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-surface-2 text-ink hover:brightness-95"
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
            className="text-muted hover:text-accent"
          >
            {t('common.edit')}
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-down hover:opacity-80 disabled:opacity-50"
          >
            {t('common.delete')}
          </button>
        </>
      )}
    </div>
  )
}
