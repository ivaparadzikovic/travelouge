import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  useUpdatePost,
  useDeletePost,
  postImageList,
  uploadPostImages,
  removePostImagesByUrl,
} from '../../../api/posts'
import type { PostWithRelations } from '../../../models'
import { useAuthStore } from '../../../stores/auth'
import { MAX_IMAGES, imageFileError } from '../constants'

interface PostEditFormValues {
  title: string
  body: string
}

/**
 * Owns the whole edit lifecycle for a post: entering/leaving edit mode, the
 * multi-image state (existing stored URLs kept + newly picked files pending
 * upload), the react-hook-form instance, and the submit/delete mutations
 * (including storage upload + cleanup). Moved verbatim out of PostDetailPage
 * — every guard/branch/side effect here matches the original inline
 * implementation, upgraded from single- to multi-image per main's spec.
 */
export function usePostEditor(post: PostWithRelations | undefined) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updatePost = useUpdatePost()
  const deletePost = useDeletePost()
  const [isEditing, setIsEditing] = useState(false)
  // Images being edited: `existingImages` are already-stored URLs the user has
  // chosen to keep; `newFiles` are freshly picked File objects to upload on save.
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostEditFormValues>()

  const newPreviews = useMemo(
    () => newFiles.map((f) => URL.createObjectURL(f)),
    [newFiles],
  )
  useEffect(() => {
    return () => { newPreviews.forEach((url) => URL.revokeObjectURL(url)) }
  }, [newPreviews])

  // usePostEditor is a hook, so it must be called unconditionally before
  // PostDetailPage's loading/error/no-post early returns — but every
  // callback below is only reachable from JSX gated on the post having
  // loaded (edit/delete buttons, the edit form), so `post` is always
  // defined by the time these actually run.
  const startEdit = () => {
    reset({ title: post!.title, body: post!.body })
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
    deletePost.mutate(post!.id, {
      onSuccess: async () => {
        await removePostImagesByUrl(postImageList(post))
        navigate('/')
      },
    })
  }
  const totalImages = existingImages.length + newFiles.length
  const addFiles = (fileList: FileList) => {
    const files = Array.from(fileList)
    if (files.length === 0) return
    const room = MAX_IMAGES - totalImages
    if (room <= 0) {
      toast.error(t('post.imageTooMany', { count: MAX_IMAGES }))
      return
    }
    const accepted: File[] = []
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
  const removeExisting = (url: string) =>
    setExistingImages((prev) => prev.filter((u) => u !== url))
  const removeNewFile = (idx: number) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== idx))

  const onSubmit = async (data: PostEditFormValues) => {
    const title = data.title.trim()
    const body = data.body.trim()
    const originalImages = postImageList(post)
    const textUnchanged = title === post!.title && body === post!.body
    const imagesUnchanged =
      newFiles.length === 0 &&
      existingImages.length === originalImages.length &&
      existingImages.every((u, i) => u === originalImages[i])

    if (textUnchanged && imagesUnchanged) {
      cancelEdit()
      return
    }

    let uploadedUrls: string[] = []
    if (newFiles.length > 0) {
      try {
        setUploading(true)
        // Editing is only reachable when isOwner is true, which requires a
        // signed-in user, so user is always non-null here.
        uploadedUrls = await uploadPostImages(newFiles, user!.id)
      } catch (err) {
        // Storage errors thrown above are always Error instances (supabase-js
        // StorageError extends Error).
        toast.error((err as Error).message)
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
        id: post!.id,
        title,
        body,
        image_urls: finalUrls.length > 0 ? finalUrls : null,
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

  return {
    isEditing,
    startEdit,
    cancelEdit,
    handleDelete,
    isDeleting: deletePost.isPending,
    existingImages,
    newFiles,
    newPreviews,
    addFiles,
    removeExisting,
    removeNewFile,
    uploading,
    submitting,
    register,
    handleSubmit,
    errors,
    onSubmit,
  }
}

export type PostEditorState = ReturnType<typeof usePostEditor>
