import PostMeta from './PostMeta'
import type { PostWithRelations } from '../../../models'

interface PostHeaderProps {
  post: PostWithRelations
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}

export default function PostHeader({ post, isOwner, onEdit, onDelete, isDeleting }: PostHeaderProps) {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <PostMeta post={post} isOwner={isOwner} onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
    </>
  )
}
