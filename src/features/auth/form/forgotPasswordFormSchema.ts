import * as yup from 'yup'
import type { InferType } from 'yup'
import type { TFunction } from 'i18next'

export const forgotPasswordFormSchema = (t: TFunction) =>
  yup.object({
    email: yup
      .string()
      .required(t('auth.emailRequired'))
      .email(t('auth.emailRequired')),
  })

export type ForgotPasswordFormValues = InferType<
  ReturnType<typeof forgotPasswordFormSchema>
>
