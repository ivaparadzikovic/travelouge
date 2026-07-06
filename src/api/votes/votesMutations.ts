import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '../supabase'
import { useAuthStore } from '../../stores/auth'
import { voteKeys, postKeys } from '../queryKeys'

interface VoteVariables {
  postId: string
  value: 1 | -1
}

export function useVote() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async ({ postId, value }: VoteVariables) => {
      const { data: existing } = await supabase
        .from('votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user!.id)
        .maybeSingle()

      if (existing) {
        if (existing.value === value) {
          const { error } = await supabase.from('votes').delete().eq('id', existing.id)
          if (error) throw error
          return null
        }
        const { data, error } = await supabase
          .from('votes')
          .update({ value })
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      const { data, error } = await supabase
        .from('votes')
        .insert({ post_id: postId, user_id: user!.id, value })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voteKeys.userByPost(variables.postId) })
      queryClient.invalidateQueries({ queryKey: voteKeys.voters(variables.postId) })
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.postId) })
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
