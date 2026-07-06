import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { categoryKeys } from '../queryKeys'

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}
