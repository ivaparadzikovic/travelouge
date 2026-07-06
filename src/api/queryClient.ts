import { QueryClient } from '@tanstack/react-query'

const DEFAULT_STALE_TIME_MS = 1000 * 60 * 5
const DEFAULT_QUERY_RETRY = 1

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME_MS,
      retry: DEFAULT_QUERY_RETRY,
    },
  },
})
