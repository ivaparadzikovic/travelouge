import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePost, postImageList } from '../../api/posts'
import { useAuthStore } from '../../stores/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import CommentsSection from '../comments/components/CommentsSection'
import { usePostViewCounter } from './hooks/usePostViewCounter'
import { usePostEditor } from './hooks/usePostEditor'
import PostHeader from './components/PostHeader'
import PostEditForm from './components/PostEditForm'
import PostFooterActions from './components/PostFooterActions'
import PostGallery from './components/PostGallery'

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { data: post, isLoading, isError, error } = usePost(id)
  useDocumentTitle(post?.title)
  usePostViewCounter(id)
  const editor = usePostEditor(post)

  if (isLoading) return <div className="text-muted">{t('common.loading')}</div>
  if (isError) return <div className="text-down">{error?.message}</div>
  if (!post) return <div>{t('post.noResults')}</div>

  const isOwner = user?.id === post.author_id

  return (
    <article className="max-w-3xl mx-auto">
      {editor.isEditing ? (
        <PostEditForm editor={editor} />
      ) : (
        <>
          <PostHeader
            post={post}
            isOwner={isOwner}
            onEdit={editor.startEdit}
            onDelete={editor.handleDelete}
            isDeleting={editor.isDeleting}
          />

          <PostGallery images={postImageList(post)} alt={post.title} />

          <div className="prose dark:prose-invert whitespace-pre-wrap text-ink">
            {post.body}
          </div>
        </>
      )}

      <PostFooterActions post={post} />

      <CommentsSection postId={post.id} />
    </article>
  )
}
