import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '../supabase'
import { useAuthStore } from '../../stores/auth'
import { commentKeys, postKeys } from '../queryKeys'

interface ToggleCommentLikeVariables {
  commentId: string
  liked: boolean
  postId: string
}

interface CreateCommentVariables {
  postId: string
  authorId: string
  body: string
}

interface UpdateCommentVariables {
  id: string
  body: string
  postId: string
}

interface DeleteCommentVariables {
  id: string
  postId: string
}

export function useToggleCommentLike() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)
  return useMutation({
    mutationFn: async ({ commentId, liked }: ToggleCommentLikeVariables) => {
      if (liked) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId!)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: userId! })
        if (error) throw error
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId, authorId, body }: CreateCommentVariables) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, author_id: authorId, body })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) })
      // postKeys.all subsumes detail + feed lists, so the comment_count shown
      // on feed cards refreshes too (matches useVote).
      queryClient.invalidateQueries({ queryKey: postKeys.all })
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
    mutationFn: async ({ id, body }: UpdateCommentVariables) => {
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
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: DeleteCommentVariables) => {
      const { error } = await supabase.from('comments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.byPost(variables.postId) })
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      toast.success('Comment deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
