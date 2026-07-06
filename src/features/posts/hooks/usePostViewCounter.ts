import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../api/supabase'
import { postKeys } from '../../../api/queryKeys'

/**
 * Fires `increment_post_view` exactly once per post id (guarded by a ref, so
 * StrictMode double-invokes and re-renders don't double-count), then
 * invalidates the post/list queries so the new view count shows up.
 */
export function usePostViewCounter(id: string | undefined) {
  const queryClient = useQueryClient()
  const countedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!id || countedFor.current === id) return
    countedFor.current = id
    supabase.rpc('increment_post_view', { p_post_id: id }).then(({ error }) => {
      if (error) return
      // postKeys.all prefix-covers the detail + list queries that render view_count.
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    })
  }, [id, queryClient])
}
