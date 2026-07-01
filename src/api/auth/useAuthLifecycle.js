import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { useAuthStore } from '../../stores/auth'

export function useAuthLifecycle() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  const setSession = useAuthStore((s) => s.setSession)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const previousUser = useAuthStore.getState().user
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        if (previousUser && !session?.user) {
          queryClient.clear()
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [queryClient, setUser, setSession, setLoading])
}
