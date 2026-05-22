import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'

export function useComments(postId) {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: ['comments', postId, userId ?? null],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*, profiles:author_id(username, display_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      if (!userId || comments.length === 0) {
        return comments.map((c) => ({ ...c, liked_by_me: false }))
      }

      const { data: likes, error: likesError } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId)
        .in('comment_id', comments.map((c) => c.id))

      if (likesError) throw likesError
      const likedIds = new Set(likes.map((l) => l.comment_id))
      return comments.map((c) => ({ ...c, liked_by_me: likedIds.has(c.id) }))
    },
    enabled: !!postId,
  })
}

export function useToggleCommentLike() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)
  return useMutation({
    mutationFn: async ({ commentId, liked }) => {
      if (liked) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: userId })
        if (error) throw error
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId, authorId, body }) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, author_id: authorId, body })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] })
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
      toast.success('Comment added')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }) => {
      const { data, error } = await supabase
        .from('comments')
        .update({ body, is_edited: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, postId }) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] })
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] })
      toast.success('Comment deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
