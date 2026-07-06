import * as yup from 'yup'
import type { InferType } from 'yup'
import type { TFunction } from 'i18next'
import { usernameField, passwordField, confirmPasswordField } from './fields'

export const registerFormSchema = (t: TFunction) =>
  yup.object({
    username: usernameField(t),
    email: yup
      .string()
      .required(t('auth.emailRequired'))
      .email(t('auth.emailInvalid')),
    password: passwordField(t),
    confirmPassword: confirmPasswordField(t),
  })

export type RegisterFormValues = InferType<ReturnType<typeof registerFormSchema>>
