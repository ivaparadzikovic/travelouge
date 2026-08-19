import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { MAX_IMAGES, imageFileError } from '../constants'


export function useImagePicker(existingCount = 0) {
  const { t } = useTranslation()
  const [files, setFiles] = useState<File[]>([])

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => {
    return () => { previews.forEach((url) => URL.revokeObjectURL(url)) }
  }, [previews])

  const addFiles = (fileList: FileList) => {
    const list = Array.from(fileList)
    if (list.length === 0) return
    const room = MAX_IMAGES - existingCount - files.length
    if (room <= 0) {
      toast.error(t('post.imageTooMany', { count: MAX_IMAGES }))
      return
    }
    const accepted: File[] = []
    for (const f of list) {
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
    setFiles((prev) => [...prev, ...accepted.slice(0, room)])
  }
  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx))

  return { files, setFiles, previews, addFiles, removeFile }
}
