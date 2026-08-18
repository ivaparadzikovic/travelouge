import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { useAuthStore } from '../../stores/auth'
import { notificationKeys } from '../queryKeys'
import type { NotificationWithRelations } from '../../models'

const NOTIFICATIONS_POLL_INTERVAL_MS = 30000

const NOTIFICATIONS_LIST_LIMIT = 20

export function useNotifications() {
  const user = useAuthStore((state) => state.user)
  return useQuery({
    queryKey: notificationKeys.list(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*, profiles:actor_id(username, display_name, avatar_url), posts:post_id(title)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(NOTIFICATIONS_LIST_LIMIT)
      if (error) throw error
      return data as unknown as NotificationWithRelations[]
    },
    enabled: !!user,
    refetchInterval: NOTIFICATIONS_POLL_INTERVAL_MS,
  })
}

export function useUnreadCount() {
  const user = useAuthStore((state) => state.user)
  return useQuery({
    queryKey: notificationKeys.unreadCount(user?.id),
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_read', false)
      if (error) throw error
      return count
    },
    enabled: !!user,
    refetchInterval: NOTIFICATIONS_POLL_INTERVAL_MS,
  })
}
