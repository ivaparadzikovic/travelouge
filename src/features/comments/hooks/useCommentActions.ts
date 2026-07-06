import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../stores/auth'
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useToggleCommentLike,
  useUpdateComment,
} from '../../../api/comments'
import type { CommentWithLikeStatus } from '../../../models'

export function useCommentActions(postId: string) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { data: comments = [], isLoading } = useComments(postId)
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()
  const updateComment = useUpdateComment()
  const toggleLike = useToggleCommentLike()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (c: CommentWithLikeStatus) => {
    setEditingId(c.id)
    setEditValue(c.body)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveEdit = (c: CommentWithLikeStatus) => {
    const next = editValue.trim()
    if (!next) return
    if (next === c.body) {
      cancelEdit()
      return
    }
    updateComment.mutate(
      { id: c.id, postId, body: next },
      { onSuccess: () => cancelEdit() },
    )
  }

  const handleDelete = (c: CommentWithLikeStatus) => {
    if (confirm(t('comments.deleteConfirm'))) {
      deleteComment.mutate({ id: c.id, postId })
    }
  }

  const handleToggleLike = (c: CommentWithLikeStatus) => {
    toggleLike.mutate({ commentId: c.id, postId, liked: c.liked_by_me })
  }

  const submitComment = (body: string, onSuccess: () => void) => {
    // Callers only submit via the compose form, which CommentsSection renders
    // only when `user` is truthy (see CommentForm's sign-in-prompt branch),
    // so this only ever runs with a signed-in user.
    createComment.mutate(
      { postId, authorId: user!.id, body },
      { onSuccess },
    )
  }

  return {
    user,
    comments,
    isLoading,
    editingId,
    editValue,
    setEditValue,
    startEdit,
    cancelEdit,
    saveEdit,
    handleDelete,
    handleToggleLike,
    submitComment,
    createComment,
    deleteComment,
    updateComment,
    toggleLike,
  }
}
