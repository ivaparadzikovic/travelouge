import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../api/supabase'
import { postKeys } from '../../../api/queryKeys'


export function usePostViewCounter(id: string | undefined) {
  const queryClient = useQueryClient()
  const countedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!id || countedFor.current === id) return
    countedFor.current = id
    supabase.rpc('increment_post_view', { p_post_id: id }).then(({ error }) => {
      if (error) return
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    })
  }, [id, queryClient])
}
