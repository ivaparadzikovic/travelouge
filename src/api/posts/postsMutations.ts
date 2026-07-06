import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '../supabase'
import { postKeys } from '../queryKeys'
import type { TablesInsert, TablesUpdate } from '../../models'

type UpdatePostVariables = { id: string } & Omit<TablesUpdate<'posts'>, 'id'>

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (postData: TablesInsert<'posts'>) => {
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
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
    mutationFn: async ({ id, ...updates }: UpdatePostVariables) => {
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
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      queryClient.invalidateQueries({ queryKey: postKeys.detail(data.id) })
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      toast.success('Post deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
