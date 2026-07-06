import * as yup from 'yup'
import type { InferType } from 'yup'
import type { TFunction } from 'i18next'
import { TITLE_MIN, TITLE_MAX, BODY_MIN, BODY_MAX } from '../constants'

// Post images are managed as local component state (see CreatePostPage /
// usePostEditor) rather than through this schema — validated per-file via
// `imageFileError` as they're picked, not on submit.
export const postFormSchema = (t: TFunction) =>
  yup.object({
    title: yup
      .string()
      .trim()
      .required(t('post.titleRequired'))
      .min(TITLE_MIN, t('post.titleTooShort'))
      .max(TITLE_MAX, t('post.titleTooLong')),
    body: yup
      .string()
      .trim()
      .required(t('post.bodyRequired'))
      .min(BODY_MIN, t('post.bodyTooShort'))
      .max(BODY_MAX, t('post.bodyTooLong')),
    country_id: yup
      .number()
      .typeError(t('post.countryRequired'))
      .required(t('post.countryRequired')),
    category_id: yup
      .number()
      .typeError(t('post.categoryRequired'))
      .required(t('post.categoryRequired')),
  })

export type PostFormValues = InferType<ReturnType<typeof postFormSchema>>
