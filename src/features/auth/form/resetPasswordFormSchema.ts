import * as yup from 'yup'
import type { InferType } from 'yup'
import type { TFunction } from 'i18next'
import { PASSWORD_MIN_LENGTH } from './constants'

export const resetPasswordFormSchema = (t: TFunction) =>
  yup.object({
    password: yup
      .string()
      .required(t('auth.passwordRequired'))
      .min(PASSWORD_MIN_LENGTH, t('auth.passwordTooShort'))
      .matches(/[A-Z]/, t('auth.passwordNoUppercase'))
      .matches(/[0-9]/, t('auth.passwordNoNumber')),
    confirmPassword: yup
      .string()
      .required(t('auth.confirmPasswordRequired'))
      .oneOf([yup.ref('password')], t('auth.passwordsDontMatch')),
  })

export type ResetPasswordFormValues = InferType<
  ReturnType<typeof resetPasswordFormSchema>
>
