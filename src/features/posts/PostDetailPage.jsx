import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  usePost,
  useUpdatePost,
  useDeletePost,
  postImageList,
  uploadPostImages,
  removePostImagesByUrl,
} from '../../api/posts'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../api/supabase'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import CountryFlag from '../../components/CountryFlag'
import VoteControls from './components/VoteControls'
import ShareButton from './components/ShareButton'
import PostGallery from './components/PostGallery'
import ImagePicker from './components/ImagePicker'
import CommentsSection from '../comments/components/CommentsSection'
import { MAX_IMAGES, imageFileError } from './form/postFormSchema'

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
  const [isEditing, setIsEditing] = useState(false)
  // Images being edited: `existingImages` are already-stored URLs the user has
  // chosen to keep; `newFiles` are freshly picked File objects to upload on save.
  const [existingImages, setExistingImages] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const newPreviews = useMemo(
    () => newFiles.map((f) => URL.createObjectURL(f)),
    [newFiles],
  )
  useEffect(() => {
    return () => { newPreviews.forEach((url) => URL.revokeObjectURL(url)) }
  }, [newPreviews])

  useEffect(() => {
    if (!id || countedFor.current === id) return
    countedFor.current = id
    supabase.rpc('increment_post_view', { p_post_id: id }).then(({ error }) => {
      if (error) return
      queryClient.invalidateQueries({ queryKey: ['post', id] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    })
  }, [id, queryClient])

  if (isLoading) return <div className="text-muted">{t('common.loading')}</div>
  if (isError) return <div className="text-down">{error.message}</div>
  if (!post) return <div>{t('post.noResults')}</div>

  const createdAt = new Date(post.created_at).toLocaleString(i18n.language)
  const isOwner = user?.id === post.author_id
  const originalImages = postImageList(post)
  const totalImages = existingImages.length + newFiles.length

  const startEdit = () => {
    reset({ title: post.title, body: post.body })
    setExistingImages(postImageList(post))
    setNewFiles([])
    setIsEditing(true)
  }
  const cancelEdit = () => {
    setNewFiles([])
    setIsEditing(false)
  }
  const handleDelete = () => {
    if (!confirm(t('post.deleteConfirm'))) return
    deletePost.mutate(post.id, {
      onSuccess: async () => {
        await removePostImagesByUrl(postImageList(post))
        navigate('/')
      },
    })
  }
  const addFiles = (fileList) => {
    const files = Array.from(fileList ?? [])
    if (files.length === 0) return
    const room = MAX_IMAGES - totalImages
    if (room <= 0) {
      toast.error(t('post.imageTooMany', { count: MAX_IMAGES }))
      return
    }
    const accepted = []
    for (const f of files) {
      const err = imageFileError(f, t)
      if (err) {
        toast.error(err)
        continue
      }
      accepted.push(f)
    }
    if (accepted.length > room) {
      toast.error(t('post.imageTooMany', { count: MAX_IMAGES }))
    }
    setNewFiles((prev) => [...prev, ...accepted.slice(0, room)])
  }
  const removeExisting = (url) =>
    setExistingImages((prev) => prev.filter((u) => u !== url))
  const removeNewFile = (idx) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== idx))

  const onSubmit = async (data) => {
    const title = data.title.trim()
    const body = data.body.trim()
    const textUnchanged = title === post.title && body === post.body
    const imagesUnchanged =
      newFiles.length === 0 &&
      existingImages.length === originalImages.length &&
      existingImages.every((u, i) => u === originalImages[i])

    if (textUnchanged && imagesUnchanged) {
      cancelEdit()
      return
    }

    let uploadedUrls = []
    if (newFiles.length > 0) {
      try {
        setUploading(true)
        uploadedUrls = await uploadPostImages(newFiles, user.id)
      } catch (err) {
        toast.error(err.message)
        setUploading(false)
        return
      }
      setUploading(false)
    }

    const finalUrls = [...existingImages, ...uploadedUrls]
    const removedUrls = originalImages.filter((u) => !existingImages.includes(u))
    if (removedUrls.length > 0) {
      await removePostImagesByUrl(removedUrls)
    }

    updatePost.mutate(
      {
        id: post.id,
        title,
        body,
        image_urls: finalUrls.length > 0 ? finalUrls : null,
        image_url: finalUrls[0] ?? null,
      },
      {
        onSuccess: () => {
          setNewFiles([])
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
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
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
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Field>

          <div>
            <div className="mb-1.5 text-sm font-medium text-ink">{t('post.photosLabel')}</div>
            <ImagePicker
              images={[
                ...existingImages.map((url) => ({
                  key: url,
                  src: url,
                  onRemove: () => removeExisting(url),
                })),
                ...newFiles.map((file, i) => ({
                  key: `new-${i}-${file.name}`,
                  src: newPreviews[i],
                  onRemove: () => removeNewFile(i),
                })),
              ]}
              onAdd={addFiles}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={submitting}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2 transition-colors disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {uploading ? t('post.uploading') : submitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      ) : (
        <>
          <Link
            to="/"
            className="mb-4 inline-block text-xs text-muted hover:text-ink transition-colors"
          >
            ← {t('common.home')}
          </Link>

          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            {post.categories?.slug && (
              <Link
                to={`/browse?category=${post.categories.slug}`}
                className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent hover:brightness-95"
              >
                {t(`categories.${post.categories.slug}`, { defaultValue: post.categories.name })}
              </Link>
            )}
            {post.countries?.code && (
              <Link
                to={`/browse?country=${post.countries.code}`}
                className="inline-flex items-center gap-1.5 hover:text-ink transition-colors"
              >
                <CountryFlag code={post.countries.code} />
                {t(`countries.${post.countries.code}`, { defaultValue: post.countries.name })}
              </Link>
            )}
            <span aria-hidden="true">·</span>
            <span>{createdAt}</span>
            {post.is_edited && <span className="italic">({t('post.edited')})</span>}
            {isOwner && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={startEdit}
                  className="text-muted hover:text-accent transition-colors"
                >
                  {t('common.edit')}
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                  className="text-down hover:underline disabled:opacity-50"
                >
                  {t('common.delete')}
                </button>
              </>
            )}
          </div>

          <h1 className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink">
            {post.title}
          </h1>

          <Link
            to={`/profile/${post.author_id}`}
            className="mb-6 inline-flex items-center gap-2.5 hover:opacity-90"
          >
            {post.profiles?.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-bold uppercase text-accent-ink">
                {post.profiles?.username?.[0]?.toUpperCase() || '?'}
              </span>
            )}
            <span className="text-sm leading-tight">
              <span className="block font-semibold text-ink">@{post.profiles?.username}</span>
              <span className="block text-xs text-muted">
                {post.comment_count} {t('post.comments').toLowerCase()} · {post.view_count ?? 0}{' '}
                {t('post.views')}
              </span>
            </span>
          </Link>

          <PostGallery images={postImageList(post)} alt={post.title} />

          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink/90">
            {post.body}
          </div>
        </>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-muted">
        <VoteControls
          postId={post.id}
          authorId={post.author_id}
          upvoteCount={post.upvote_count}
          downvoteCount={post.downvote_count}
        />
        <span>·</span>
        <span aria-label={t('post.comments')} className="inline-flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m8.25.75c0 4.142-3.694 7.5-8.25 7.5a9.06 9.06 0 0 1-2.348-.306 4.5 4.5 0 0 1-3.328.734l.115-.06a3.75 3.75 0 0 0 1.42-2.856A7.207 7.207 0 0 1 3.75 12c0-4.142 3.694-7.5 8.25-7.5s8.25 3.358 8.25 7.5Z"
            />
          </svg>
          <span className="tabular-nums">{post.comment_count}</span>{' '}
          {t('post.comments').toLowerCase()}
        </span>
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
