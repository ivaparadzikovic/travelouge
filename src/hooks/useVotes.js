import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export function usePostVoters(postId, enabled = true) {
  return useQuery({
    queryKey: ['voters', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('value, created_at, profiles:user_id(id, username, display_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return {
        upvoters: data.filter((v) => v.value === 1),
        downvoters: data.filter((v) => v.value === -1),
      }
    },
    enabled: !!postId && enabled,
  })
}

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
      queryClient.invalidateQueries({ queryKey: ['voters', variables.postId] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
