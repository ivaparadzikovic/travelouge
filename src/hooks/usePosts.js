import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const POSTS_PER_PAGE = 10

export function usePosts(sort = 'newest') {
  const orderColumn = sort === 'popular' ? 'vote_count' : sort === 'top' ? 'vote_count' : 'created_at'
  const ascending = false

  return useInfiniteQuery({
    queryKey: ['posts', sort],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1

      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles:author_id(username, display_name, avatar_url), countries(name, code), categories(name, slug)')
        .order(orderColumn, { ascending })
        .range(from, to)

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
    queryKey: ['post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles:author_id(username, display_name, avatar_url), countries(name, code), categories(name, slug)')
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
    queryKey: ['posts', 'user', userId],
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

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (postData) => {
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post created!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('posts')
        .update({ ...updates, is_edited: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', data.id] })
      toast.success('Post updated!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useSearchPosts(query) {
  return useQuery({
    queryKey: ['posts', 'search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles:author_id(username, display_name, avatar_url), countries(name, code), categories(name, slug)')
        .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!query && query.length >= 2,
  })
}

export function useBrowsePosts({ countryId, categoryId }) {
  return useQuery({
    queryKey: ['posts', 'browse', countryId, categoryId],
    queryFn: async () => {
      let q = supabase
        .from('posts')
        .select('*, profiles:author_id(username, display_name, avatar_url), countries(name, code), categories(name, slug)')

      if (countryId) q = q.eq('country_id', countryId)
      if (categoryId) q = q.eq('category_id', categoryId)

      const { data, error } = await q.order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
