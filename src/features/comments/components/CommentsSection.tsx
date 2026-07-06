import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { MAX_COMMENT_LENGTH } from '../constants'
import { useCommentActions } from '../hooks/useCommentActions'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'

interface CommentsSectionProps {
  postId: string
}

interface CommentFormValues {
  body: string
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { t } = useTranslation()
  const {
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
  } = useCommentActions(postId)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CommentFormValues>()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const bodyRegister = register('body', {
    required: t('comments.bodyRequired'),
    maxLength: { value: MAX_COMMENT_LENGTH, message: t('comments.bodyTooLong') },
    validate: (v) => v.trim().length > 0 || t('comments.bodyRequired'),
  })

  const onSubmit = (data: CommentFormValues) => {
    submitComment(data.body.trim(), () => reset({ body: '' }))
  }

  const handleReply = (username?: string | null) => {
    if (!username) return
    setValue('body', `@${username} `, { shouldDirty: true, shouldValidate: false })
    const el = textareaRef.current
    if (el) {
      el.focus()
      const end = el.value.length
      el.setSelectionRange(end, end)
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const renderCommentsList = () => {
    if (isLoading) {
      return <p className="text-sm text-muted">{t('common.loading')}</p>
    }
    if (comments.length === 0) {
      return <p className="text-sm text-muted">{t('comments.empty')}</p>
    }
    return (
      <ul className="space-y-4">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            currentUserId={user?.id}
            isEditing={editingId === c.id}
            editValue={editValue}
            onEditValueChange={setEditValue}
            onStartEdit={() => startEdit(c)}
            onCancelEdit={cancelEdit}
            onSaveEdit={() => saveEdit(c)}
            isSaving={updateComment.isPending}
            onDelete={() => handleDelete(c)}
            isDeleting={deleteComment.isPending}
            onToggleLike={() => handleToggleLike(c)}
            isTogglingLike={toggleLike.isPending}
            canInteract={!!user}
            onReply={handleReply}
          />
        ))}
      </ul>
    )
  }

  return (
    <section className="mt-10 border-t border-border pt-6">
      <h2 className="text-xl font-semibold mb-4">
        {t('post.comments')} ({comments.length})
      </h2>

      <CommentForm
        user={user}
        bodyRegister={bodyRegister}
        textareaRef={textareaRef}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={createComment.isPending}
      />

      {renderCommentsList()}
    </section>
  )
}
