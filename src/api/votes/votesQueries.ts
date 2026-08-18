import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { useAuthStore } from '../../stores/auth'
import { voteKeys } from '../queryKeys'
import type { VoterWithProfile } from '../../models'

export function usePostVoters(postId: string, enabled = true) {
  return useQuery({
    queryKey: voteKeys.voters(postId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('value, created_at, profiles:user_id(id, username, display_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })
      if (error) throw error
      const voters = data as unknown as VoterWithProfile[]
      return {
        upvoters: voters.filter((v) => v.value === 1),
        downvoters: voters.filter((v) => v.value === -1),
      }
    },
    enabled: !!postId && enabled,
  })
}

export function useUserVote(postId: string) {
  const user = useAuthStore((state) => state.user)
  return useQuery({
    queryKey: voteKeys.user(postId, user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user && !!postId,
  })
}
