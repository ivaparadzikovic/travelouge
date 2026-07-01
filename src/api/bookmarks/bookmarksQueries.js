import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { useAuthStore } from '../../stores/auth'
import { bookmarkKeys } from '../queryKeys'

const POST_SELECT =
  'created_at, posts(*, profiles:author_id(username, display_name, avatar_url), countries(name, code), categories(name, slug))'

export function useBookmarks(userId) {
  return useQuery({
    queryKey: bookmarkKeys.list(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(POST_SELECT)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => row.posts).filter(Boolean)
    },
    enabled: !!userId,
  })
}

export function useIsBookmarked(postId) {
  const user = useAuthStore((state) => state.user)
  return useQuery({
    queryKey: bookmarkKeys.byPost(postId, user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (error) throw error
      return !!data
    },
    enabled: !!user && !!postId,
  })
}
