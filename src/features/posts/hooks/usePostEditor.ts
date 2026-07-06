import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
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
import { useImagePicker } from './useImagePicker'
import { postTextSchema } from '../form/postFormSchema'
import type { PostTextValues } from '../form/postFormSchema'

/**
 * Owns the whole edit lifecycle for a post: entering/leaving edit mode, the
 * multi-image state (existing stored URLs kept + newly picked files pending
 * upload, via the shared useImagePicker hook), the react-hook-form instance
 * (validated by the same title/body schema the create form uses), and the
 * submit/delete mutations (including storage upload + cleanup).
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
  const {
    files: newFiles,
    setFiles: setNewFiles,
    previews: newPreviews,
    addFiles,
    removeFile: removeNewFile,
  } = useImagePicker(existingImages.length)
  const [uploading, setUploading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostTextValues>({
    resolver: yupResolver(postTextSchema(t)),
  })

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
  const removeExisting = (url: string) =>
    setExistingImages((prev) => prev.filter((u) => u !== url))

  const onSubmit = async (data: PostTextValues) => {
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
