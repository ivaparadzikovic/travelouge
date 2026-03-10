import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export function useUserVote(postId) {
  const user = useAuthStore((state) => state.user)
  return useQuery({
    queryKey: ['vote', postId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!user && !!postId,
  })
}

export function useVote() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async ({ postId, value }) => {
      // Check if user already voted
      const { data: existing } = await supabase
        .from('votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        if (existing.value === value) {
          // Remove vote (toggle off)
          const { error } = await supabase
            .from('votes')
            .delete()
            .eq('id', existing.id)
          if (error) throw error
          return null
        } else {
          // Change vote
          const { data, error } = await supabase
            .from('votes')
            .update({ value })
            .eq('id', existing.id)
            .select()
            .single()
          if (error) throw error
          return data
        }
      } else {
        // New vote
        const { data, error } = await supabase
          .from('votes')
          .insert({ post_id: postId, user_id: user.id, value })
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vote', variables.postId] })
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
