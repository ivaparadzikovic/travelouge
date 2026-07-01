import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { useAuthStore } from '../../stores/auth'
import { commentKeys } from '../queryKeys'

export function useComments(postId) {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: commentKeys.list(postId, userId),
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*, profiles:author_id(username, display_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      if (!userId || comments.length === 0) {
        return comments.map((c) => ({ ...c, liked_by_me: false }))
      }

      const { data: likes, error: likesError } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId)
        .in('comment_id', comments.map((c) => c.id))

      if (likesError) throw likesError
      const likedIds = new Set(likes.map((l) => l.comment_id))
      return comments.map((c) => ({ ...c, liked_by_me: likedIds.has(c.id) }))
    },
    enabled: !!postId,
  })
}
