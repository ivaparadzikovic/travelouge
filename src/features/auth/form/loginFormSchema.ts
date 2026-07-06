import * as yup from 'yup'
import type { InferType } from 'yup'
import type { TFunction } from 'i18next'

export const loginFormSchema = (t: TFunction) =>
  yup.object({
    identifier: yup.string().trim().required(t('auth.identifierRequired')),
    password: yup.string().required(t('auth.passwordRequired')),
  })

export type LoginFormValues = InferType<ReturnType<typeof loginFormSchema>>
