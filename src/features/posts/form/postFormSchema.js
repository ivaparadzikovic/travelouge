import * as yup from 'yup'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

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
    image: yup
      .mixed()
      .test('type', t('post.imageInvalidType'), (fileList) => {
        const f = fileList?.[0]
        if (!f) return true
        return ALLOWED_IMAGE_TYPES.includes(f.type)
      })
      .test('size', t('post.imageTooLarge'), (fileList) => {
        const f = fileList?.[0]
        if (!f) return true
        return f.size <= MAX_IMAGE_BYTES
      }),
  })
