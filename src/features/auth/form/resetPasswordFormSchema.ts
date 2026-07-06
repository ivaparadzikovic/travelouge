import * as yup from 'yup'
import type { InferType } from 'yup'
import type { TFunction } from 'i18next'
import { passwordField, confirmPasswordField } from './fields'

export const resetPasswordFormSchema = (t: TFunction) =>
  yup.object({
    password: passwordField(t),
    confirmPassword: confirmPasswordField(t),
  })

export type ResetPasswordFormValues = InferType<
  ReturnType<typeof resetPasswordFormSchema>
>
