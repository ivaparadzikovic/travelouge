import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { profileKeys } from '../queryKeys'

export function useProfile(userId) {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, user_badges(badge_id, awarded_at, badges(name, description, icon))')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}
