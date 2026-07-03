import * as yup from 'yup'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGES = 6

// Validates a single picked file. Returns a translated error message, or null
// when the file is acceptable. Shared by the create and edit image pickers,
// which manage their selections in local state rather than through the schema.
export function imageFileError(file, t) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return t('post.imageInvalidType')
  if (file.size > MAX_IMAGE_BYTES) return t('post.imageTooLarge')
  return null
}

export const postFormSchema = (t) =>
  yup.object({
    title: yup
      .string()
      .trim()
      .required(t('post.titleRequired'))
      .min(5, t('post.titleTooShort'))
      .max(200, t('post.titleTooLong')),
    body: yup
      .string()
      .trim()
      .required(t('post.bodyRequired'))
      .min(10, t('post.bodyTooShort'))
      .max(10000, t('post.bodyTooLong')),
    country_id: yup
      .number()
      .typeError(t('post.countryRequired'))
      .required(t('post.countryRequired')),
    category_id: yup
      .number()
      .typeError(t('post.categoryRequired'))
      .required(t('post.categoryRequired')),
  })
