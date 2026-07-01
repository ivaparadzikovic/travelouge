import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../stores/auth'
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useToggleCommentLike,
  useUpdateComment,
} from '../../../api/comments'
import Field from '../../../components/Field'

const MAX_COMMENT_LENGTH = 2000

export default function CommentsSection({ postId }) {
  const { t, i18n } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { data: comments = [], isLoading } = useComments(postId)
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()
  const updateComment = useUpdateComment()
  const toggleLike = useToggleCommentLike()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()
  const textareaRef = useRef(null)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (c) => {
    setEditingId(c.id)
    setEditValue(c.body)
  }
  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }
  const saveEdit = (c) => {
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
  const bodyRegister = register('body', {
    required: t('comments.bodyRequired'),
    maxLength: { value: MAX_COMMENT_LENGTH, message: t('comments.bodyTooLong') },
    validate: (v) => v.trim().length > 0 || t('comments.bodyRequired'),
  })

  const onSubmit = (data) => {
    createComment.mutate(
      { postId, authorId: user.id, body: data.body.trim() },
      { onSuccess: () => reset({ body: '' }) },
    )
  }

  const handleReply = (username) => {
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

  return (
    <section className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6">
      <h2 className="text-xl font-semibold mb-4">
        {t('post.comments')} ({comments.length})
      </h2>

      {user ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
          <Field error={errors.body?.message}>
            <textarea
              rows={3}
              placeholder={t('comments.placeholder')}
              aria-label={t('post.comments')}
              {...bodyRegister}
              ref={(el) => {
                bodyRegister.ref(el)
                textareaRef.current = el
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
          </Field>
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={createComment.isPending}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
            >
              {createComment.isPending ? t('common.loading') : t('comments.submit')}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-gray-500">
          <Link to="/login" className="text-teal-600 hover:underline">
            {t('common.login')}
          </Link>{' '}
          {t('comments.signInPrompt')}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">{t('common.loading')}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">{t('comments.empty')}</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => {
            const author = c.profiles
            const authorName = author?.display_name || author?.username || '?'
            const createdAt = new Date(c.created_at).toLocaleString(i18n.language)
            const isOwner = user?.id === c.author_id
            return (
              <li
                key={c.id}
                className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded"
              >
                <Link to={`/profile/${c.author_id}`} className="flex-shrink-0">
                  {author?.avatar_url ? (
                    <img
                      src={author.avatar_url}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm">
                      {authorName[0]?.toUpperCase()}
                    </span>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Link
                      to={`/profile/${c.author_id}`}
                      className="font-medium text-gray-700 dark:text-gray-200 hover:underline"
                    >
                      @{author?.username || '?'}
                    </Link>
                    <span>·</span>
                    <span>{createdAt}</span>
                    {c.is_edited && (
                      <span className="italic">({t('post.edited')})</span>
                    )}
                    {isOwner && editingId !== c.id && (
                      <>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="text-gray-600 hover:text-teal-600 dark:text-gray-300"
                        >
                          {t('common.edit')}
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(t('comments.deleteConfirm'))) {
                              deleteComment.mutate({ id: c.id, postId })
                            }
                          }}
                          disabled={deleteComment.isPending}
                          className="text-red-500 hover:text-red-700"
                        >
                          {t('common.delete')}
                        </button>
                      </>
                    )}
                  </div>
                  {editingId === c.id ? (
                    <div>
                      <textarea
                        rows={3}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        maxLength={MAX_COMMENT_LENGTH}
                        aria-label={t('common.edit')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      />
                      <div className="mt-2 flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {t('common.cancel')}
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(c)}
                          disabled={updateComment.isPending || !editValue.trim()}
                          className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                        >
                          {updateComment.isPending ? t('common.loading') : t('common.save')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                      {c.body}
                    </p>
                  )}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleReply(author?.username)}
                      disabled={!user}
                      aria-label={user ? t('comments.reply') : t('comments.signInToReply')}
                      title={!user ? t('comments.signInToReply') : undefined}
                      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 rounded px-1.5 py-0.5 transition-colors disabled:cursor-not-allowed disabled:hover:text-gray-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                        />
                      </svg>
                      <span>{t('comments.reply')}</span>
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() =>
                      toggleLike.mutate({
                        commentId: c.id,
                        postId,
                        liked: c.liked_by_me,
                      })
                    }
                    disabled={!user || toggleLike.isPending}
                    aria-pressed={c.liked_by_me}
                    aria-label={
                      user
                        ? c.liked_by_me
                          ? t('comments.unlike')
                          : t('comments.like')
                        : t('comments.signInToLike')
                    }
                    title={!user ? t('comments.signInToLike') : undefined}
                    className={`inline-flex flex-col items-center gap-0.5 text-sm rounded px-1.5 py-1 transition-colors ${
                      c.liked_by_me
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-red-500'
                    } disabled:cursor-not-allowed disabled:hover:text-gray-500`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={c.liked_by_me ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={1.8}
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                    <span className="tabular-nums text-xs">{c.like_count ?? 0}</span>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
