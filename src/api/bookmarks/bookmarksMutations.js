import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '../supabase'
import { useAuthStore } from '../../stores/auth'
import { bookmarkKeys } from '../queryKeys'

export function useToggleBookmark() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async ({ postId, bookmarked }) => {
      if (bookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
        if (error) throw error
        return false
      }
      const { error } = await supabase
        .from('bookmarks')
        .insert({ post_id: postId, user_id: user.id })
      if (error) throw error
      return true
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.byPost(variables.postId, user?.id) })
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.list(user?.id) })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
