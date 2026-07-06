import type { PostWithRelations } from '../../../models'
import PostCard from '../../posts/components/PostCard'

interface ProfilePostListProps {
  posts: PostWithRelations[] | undefined
  isEmpty: boolean
  emptyMessage: string
}

export function ProfilePostList({ posts, isEmpty, emptyMessage }: ProfilePostListProps) {
  return (
    <>
      {isEmpty && <p className="text-muted">{emptyMessage}</p>}
      <ul className="space-y-2.5">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} showAuthor={false} />
        ))}
      </ul>
    </>
  )
}
