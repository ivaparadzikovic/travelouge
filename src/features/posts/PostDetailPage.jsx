import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { usePost, useUpdatePost, useDeletePost } from '../../api/posts'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../api/supabase'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import VoteControls from './components/VoteControls'
import ShareButton from './components/ShareButton'
import BookmarkButton from './components/BookmarkButton'
import CommentsSection from '../comments/components/CommentsSection'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function PostDetail() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const { data: post, isLoading, isError, error } = usePost(id)
  useDocumentTitle(post?.title)
  const updatePost = useUpdatePost()
  const deletePost = useDeletePost()
  const countedFor = useRef(null)
  const fileInputRef = useRef(null)
  const [isEditing, setIsEditing] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const previewUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : null),
    [imageFile],
  )
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  useEffect(() => {
    if (!id || countedFor.current === id) return
    countedFor.current = id
    supabase.rpc('increment_post_view', { p_post_id: id }).then(({ error }) => {
      if (error) return
      queryClient.invalidateQueries({ queryKey: ['post', id] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    })
  }, [id, queryClient])

  if (isLoading) return <div className="text-gray-500">{t('common.loading')}</div>
  if (isError) return <div className="text-red-500">{error.message}</div>
  if (!post) return <div>{t('post.noResults')}</div>

  const createdAt = new Date(post.created_at).toLocaleString(i18n.language)
  const isOwner = user?.id === post.author_id

  const startEdit = () => {
    reset({ title: post.title, body: post.body })
    setImageFile(null)
    setRemoveImage(false)
    setIsEditing(true)
  }
  const cancelEdit = () => {
    setImageFile(null)
    setRemoveImage(false)
    setIsEditing(false)
  }
  const handleDelete = () => {
    if (!confirm(t('post.deleteConfirm'))) return
    deletePost.mutate(post.id, {
      onSuccess: async () => {
        if (post.image_url) {
          const path = post.image_url.split('/post-images/')[1]
          if (path) {
            await supabase.storage.from('post-images').remove([path]).catch(() => {})
          }
        }
        navigate('/')
      },
    })
  }
  const pickImage = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      toast.error(t('post.imageInvalidType'))
      return
    }
    if (f.size > MAX_IMAGE_BYTES) {
      toast.error(t('post.imageTooLarge'))
      return
    }
    setImageFile(f)
    setRemoveImage(false)
  }

  const onSubmit = async (data) => {
    const title = data.title.trim()
    const body = data.body.trim()
    const replacing = !!imageFile
    const removing = !replacing && removeImage
    const textUnchanged = title === post.title && body === post.body

    if (textUnchanged && !replacing && !removing) {
      cancelEdit()
      return
    }

    let nextImageUrl = post.image_url
    if (replacing) {
      try {
        setUploading(true)
        const ext = imageFile.name.split('.').pop().toLowerCase()
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(path, imageFile, { contentType: imageFile.type })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(path)
        nextImageUrl = urlData.publicUrl
      } catch (err) {
        toast.error(err.message)
        setUploading(false)
        return
      }
      setUploading(false)
    } else if (removing) {
      nextImageUrl = null
    }

    if ((replacing || removing) && post.image_url) {
      const oldPath = post.image_url.split('/post-images/')[1]
      if (oldPath) {
        // Best-effort cleanup; ignore failure so the post still saves.
        await supabase.storage.from('post-images').remove([oldPath]).catch(() => {})
      }
    }

    updatePost.mutate(
      { id: post.id, title, body, image_url: nextImageUrl },
      {
        onSuccess: () => {
          setImageFile(null)
          setRemoveImage(false)
          setIsEditing(false)
        },
      },
    )
  }

  const submitting = uploading || updatePost.isPending

  return (
    <article className="max-w-3xl mx-auto">
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          <Field label={t('post.titleLabel')} error={errors.title?.message}>
            <input
              type="text"
              {...register('title', {
                required: t('post.titleRequired'),
                minLength: { value: 5, message: t('post.titleTooShort') },
                maxLength: { value: 200, message: t('post.titleTooLong') },
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
          </Field>
          <Field label={t('post.bodyLabel')} error={errors.body?.message}>
            <textarea
              rows={10}
              {...register('body', {
                required: t('post.bodyRequired'),
                minLength: { value: 10, message: t('post.bodyTooShort') },
                maxLength: { value: 10000, message: t('post.bodyTooLong') },
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
          </Field>

          <div>
            <Field label={t('post.imageLabel')}>
              <input
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                ref={fileInputRef}
                onChange={pickImage}
                className="sr-only"
              />
            </Field>
            {imageFile ? (
              <div className="space-y-2">
                <img
                  src={previewUrl}
                  alt=""
                  className="max-h-64 rounded border border-gray-200 dark:border-gray-700 object-cover"
                />
                <div className="flex items-center gap-3 flex-wrap text-sm">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {t('post.chooseImage')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="text-gray-600 dark:text-gray-300 hover:underline"
                  >
                    {t('common.cancel')}
                  </button>
                  <span className="text-gray-500 truncate">{imageFile.name}</span>
                </div>
              </div>
            ) : removeImage ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="italic text-gray-500">{t('post.imageWillBeRemoved')}</span>
                <button
                  type="button"
                  onClick={() => setRemoveImage(false)}
                  className="text-teal-600 hover:underline"
                >
                  {t('post.undo')}
                </button>
              </div>
            ) : post.image_url ? (
              <div className="space-y-2">
                <img
                  src={post.image_url}
                  alt=""
                  className="max-h-64 rounded border border-gray-200 dark:border-gray-700 object-cover"
                />
                <div className="flex items-center gap-3 flex-wrap text-sm">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {t('post.replaceImage')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoveImage(true)}
                    className="text-red-600 hover:underline"
                  >
                    {t('post.removeImage')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {t('post.addImage')}
              </button>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
            >
              {uploading ? t('post.uploading') : submitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>

          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 flex-wrap">
            <Link to={`/profile/${post.author_id}`} className="flex items-center gap-2 hover:underline">
              {post.profiles?.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs">
                  {post.profiles?.username?.[0]?.toUpperCase() || '?'}
                </span>
              )}
              <span>@{post.profiles?.username}</span>
            </Link>
            <span>·</span>
            {post.categories?.slug ? (
              <Link
                to={`/browse?category=${post.categories.slug}`}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60"
              >
                {t(`categories.${post.categories.slug}`, { defaultValue: post.categories.name })}
              </Link>
            ) : null}
            <span>·</span>
            {post.countries?.code ? (
              <Link
                to={`/browse?country=${post.countries.code}`}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <img
                  src={`https://flagcdn.com/w20/${post.countries.code.toLowerCase()}.png`}
                  alt=""
                  width="16"
                  height="12"
                  loading="lazy"
                  className="h-3 w-4 rounded-sm object-cover"
                />
                {t(`countries.${post.countries.code}`, { defaultValue: post.countries.name })}
              </Link>
            ) : null}
            <span>·</span>
            <span>{createdAt}</span>
            {post.is_edited && <span className="italic">({t('post.edited')})</span>}
            {isOwner && (
              <>
                <span>·</span>
                <button
                  type="button"
                  onClick={startEdit}
                  className="text-gray-600 hover:text-teal-600 dark:text-gray-300"
                >
                  {t('common.edit')}
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  {t('common.delete')}
                </button>
              </>
            )}
          </div>

          {post.image_url && (
            <img
              src={post.image_url}
              alt=""
              className="w-full max-h-96 object-cover rounded mb-6"
            />
          )}

          <div className="prose dark:prose-invert whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {post.body}
          </div>
        </>
      )}

      <div className="mt-8 flex items-center gap-4 text-sm text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-4">
        <VoteControls
          postId={post.id}
          authorId={post.author_id}
          upvoteCount={post.upvote_count}
          downvoteCount={post.downvote_count}
        />
        <span>·</span>
        <span>{post.comment_count} {t('post.comments').toLowerCase()}</span>
        <span>·</span>
        <ShareButton
          url={`${window.location.origin}/post/${post.id}`}
          shareUrl={
            import.meta.env.VITE_SHARE_URL_BASE
              ? `${import.meta.env.VITE_SHARE_URL_BASE}?id=${post.id}`
              : undefined
          }
          title={post.title}
        />
        <span>·</span>
        <BookmarkButton postId={post.id} />
        <span>·</span>
        <span aria-label={t('post.views')} className="inline-flex items-center gap-1">
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
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span className="tabular-nums">{post.view_count ?? 0}</span>{' '}
          {t(post.view_count === 1 ? 'post.view' : 'post.views')}
        </span>
      </div>

      <CommentsSection postId={post.id} />
    </article>
  )
}
