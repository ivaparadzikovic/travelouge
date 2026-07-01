import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { countryKeys } from '../queryKeys'

export function useCountries() {
  return useQuery({
    queryKey: countryKeys.all,
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
    queryKey: countryKeys.popular(limit),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('popular_destinations', { p_limit: limit })
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
