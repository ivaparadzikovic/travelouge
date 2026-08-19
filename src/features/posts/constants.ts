import type { TFunction } from 'i18next'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGES = 6

export function imageFileError(file: File, t: TFunction): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return t('post.imageInvalidType')
  if (file.size > MAX_IMAGE_BYTES) return t('post.imageTooLarge')
  return null
}

export const TITLE_MIN = 5
export const TITLE_MAX = 200
export const BODY_MIN = 10
export const BODY_MAX = 10000

export const SKELETON_PLACEHOLDER_COUNT = 4

export const POPULAR_DESTINATIONS_LIMIT = 5
