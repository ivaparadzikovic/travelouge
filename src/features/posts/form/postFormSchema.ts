import * as yup from 'yup'
import type { InferType } from 'yup'
import type { TFunction } from 'i18next'
import { TITLE_MIN, TITLE_MAX, BODY_MIN, BODY_MAX } from '../constants'


const titleField = (t: TFunction) =>
  yup
    .string()
    .trim()
    .required(t('post.titleRequired'))
    .min(TITLE_MIN, t('post.titleTooShort'))
    .max(TITLE_MAX, t('post.titleTooLong'))

const bodyField = (t: TFunction) =>
  yup
    .string()
    .trim()
    .required(t('post.bodyRequired'))
    .min(BODY_MIN, t('post.bodyTooShort'))
    .max(BODY_MAX, t('post.bodyTooLong'))


export const postTextSchema = (t: TFunction) =>
  yup.object({
    title: titleField(t),
    body: bodyField(t),
  })

export const postFormSchema = (t: TFunction) =>
  yup.object({
    title: titleField(t),
    body: bodyField(t),
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
export type PostTextValues = InferType<ReturnType<typeof postTextSchema>>
