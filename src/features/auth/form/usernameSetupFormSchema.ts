import * as yup from 'yup'
import type { InferType } from 'yup'
import type { TFunction } from 'i18next'
import { usernameField } from './fields'

export const usernameSetupFormSchema = (t: TFunction) =>
  yup.object({
    username: usernameField(t),
  })

export type UsernameSetupFormValues = InferType<
  ReturnType<typeof usernameSetupFormSchema>
>
