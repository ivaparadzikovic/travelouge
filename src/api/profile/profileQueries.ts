import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { profileKeys } from '../queryKeys'
import type { ProfileWithBadges } from '../../models'

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, user_badges(badge_id, awarded_at, badges(name, description, icon))')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data as unknown as ProfileWithBadges
    },
    enabled: !!userId,
  })
}
