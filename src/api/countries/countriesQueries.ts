import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { countryKeys } from '../queryKeys'

const DEFAULT_POPULAR_DESTINATIONS_LIMIT = 5
const POPULAR_DESTINATIONS_STALE_TIME_MS = 5 * 60 * 1000

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

export function usePopularDestinations(limit = DEFAULT_POPULAR_DESTINATIONS_LIMIT) {
  return useQuery({
    queryKey: countryKeys.popular(limit),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('popular_destinations', { p_limit: limit })
      if (error) throw error
      return data
    },
    staleTime: POPULAR_DESTINATIONS_STALE_TIME_MS,
  })
}
