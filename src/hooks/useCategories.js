import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
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

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
    staleTime: Infinity,
  })
}

export function usePopularDestinations(limit = 5) {
  return useQuery({
    queryKey: ['popular-destinations', limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('popular_destinations', { p_limit: limit })
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
