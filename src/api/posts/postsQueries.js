import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '../supabase'
import { postKeys } from '../queryKeys'

const POSTS_PER_PAGE = 10
const POST_SELECT = '*, profiles:author_id(username, display_name, avatar_url), countries(name, code), categories(name, slug)'

export function usePosts(sort = 'newest') {
  return useInfiniteQuery({
    queryKey: postKeys.list(sort),
    queryFn: async ({ pageParam = 0 }) => {
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
      return data
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === POSTS_PER_PAGE ? allPages.length : undefined
    },
  })
}

export function usePost(id) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(POST_SELECT)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useUserPosts(userId) {
  return useQuery({
    queryKey: postKeys.user(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, countries(name, code), categories(name, slug)')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useBrowsePosts({ countryId, categoryId, q }) {
  const search = (q ?? '').trim()
  return useQuery({
    queryKey: postKeys.browse({ countryId, categoryId, q: search }),
    queryFn: async () => {
      let req = supabase.from('posts').select(POST_SELECT)

      if (countryId) req = req.eq('country_id', countryId)
      if (categoryId) req = req.eq('category_id', categoryId)
      if (search.length >= 2) {
        const safe = search.replace(/[%,]/g, '')
        req = req.or(`title.ilike.%${safe}%,body.ilike.%${safe}%`)
      }

      const { data, error } = await req.order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
