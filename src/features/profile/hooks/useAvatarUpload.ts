import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useUploadAvatar, useRemoveAvatar } from '../../../api/profile'
import { MAX_AVATAR_BYTES, ALLOWED_AVATAR_TYPES } from '../constants'


export function useAvatarUpload(id: string, avatarUrl: string | null | undefined) {
  const { t } = useTranslation()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error(t('profile.avatarInvalidType'))
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(t('profile.avatarTooLarge'))
      return
    }
    uploadAvatar.mutate(
      { id, file },
      { onSuccess: () => toast.success(t('profile.avatarUpdated')) },
    )
  }

  const handleAvatarRemove = () => {
    removeAvatar.mutate(
      { id, avatar_url: avatarUrl ?? null },
      { onSuccess: () => toast.success(t('profile.avatarRemoved')) },
    )
  }

  return {
    fileInputRef,
    handleAvatarChange,
    handleAvatarRemove,
    isUploading: uploadAvatar.isPending,
    isRemoving: removeAvatar.isPending,
  }
}
