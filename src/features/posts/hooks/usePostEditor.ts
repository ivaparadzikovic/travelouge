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

export function usePostEditor(post: PostWithRelations | undefined) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updatePost = useUpdatePost()
  const deletePost = useDeletePost()
  const [isEditing, setIsEditing] = useState(false)

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
      
        uploadedUrls = await uploadPostImages(newFiles, user!.id)
      } catch (err) {

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
