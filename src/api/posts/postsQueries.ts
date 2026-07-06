import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { postKeys, type BrowsePostsFilters } from '../queryKeys'
import type { PostWithRelations } from '../../models'

const POSTS_PER_PAGE = 10
const POST_SELECT = '*, profiles:author_id(username, display_name, avatar_url), countries(name, code), categories(name, slug)'

// Shortest search query useBrowsePosts will actually filter on; shorter
// input returns the unfiltered list instead of running an ilike search.
export const MIN_SEARCH_LENGTH = 2

export function usePosts(sort = 'newest') {
  return useInfiniteQuery({
    queryKey: postKeys.list(sort),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const from = pageParam * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      let query = supabase.from('posts').select(POST_SELECT)

      if (sort === 'popular') {
        query = query.order('view_count', { ascending: false })
      } else if (sort === 'top') {
        query = query
          .order('vote_ratio', { ascending: false })
          .order('upvote_count', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query.range(from, to)
      if (error) throw error
      // Embedded-select inference limitation: PostgREST joined select strings
      // (aliased FKs) are not fully inferred by supabase-js under strict TS.
      return (data ?? []) as PostWithRelations[]
    },
    // Required by TanStack Query v5's useInfiniteQuery types; value matches
    // the `pageParam = 0` default the original JS relied on implicitly.
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === POSTS_PER_PAGE ? allPages.length : undefined
    },
  })
}

export function usePost(id?: string) {
  return useQuery({
    queryKey: postKeys.detail(id!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .eq('id', id!)
        .single()
      if (error) throw error
      // Embedded-select inference limitation: see usePosts above.
      return data as unknown as PostWithRelations
    },
    enabled: !!id,
  })
}

export function useUserPosts(userId?: string) {
  return useQuery({
    queryKey: postKeys.user(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .eq('author_id', userId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      // Embedded-select inference limitation: see usePosts above.
      return (data ?? []) as unknown as PostWithRelations[]
    },
    enabled: !!userId,
  })
}

export function useBrowsePosts({ countryId, categoryId, q }: BrowsePostsFilters) {
  const search = (q ?? '').trim()
  return useQuery({
    queryKey: postKeys.browse({ countryId, categoryId, q: search }),
    queryFn: async () => {
      let req = supabase.from('posts').select(POST_SELECT)

      if (countryId) req = req.eq('country_id', countryId)
      if (categoryId) req = req.eq('category_id', categoryId)
      if (search.length >= MIN_SEARCH_LENGTH) {
        // Strip PostgREST or() grammar chars: % and , (list/wildcard) plus
        // ( ) group delimiters and \ escape, so a query like "europe (2024)"
        // can't close the or-group early and 400 the request.
        const safe = search.replace(/[%,()\\]/g, '')
        req = req.or(`title.ilike.%${safe}%,body.ilike.%${safe}%`)
      }

      const { data, error } = await req.order('created_at', { ascending: false })
      if (error) throw error
      // Embedded-select inference limitation: see usePosts above.
      return (data ?? []) as PostWithRelations[]
    },
  })
}
