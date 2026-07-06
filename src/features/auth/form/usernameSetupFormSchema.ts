import * as yup from 'yup'
import type { InferType } from 'yup'
import type { TFunction } from 'i18next'
import { supabase } from '../../../api/supabase'
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_PATTERN } from './constants'

export const usernameSetupFormSchema = (t: TFunction) =>
  yup.object({
    username: yup
      .string()
      .required(t('auth.usernameRequired'))
      .min(USERNAME_MIN_LENGTH, t('auth.usernameTooShort'))
      .max(USERNAME_MAX_LENGTH, t('auth.usernameTooLong'))
      .matches(USERNAME_PATTERN, t('auth.usernameInvalidChars'))
      .test('unique', t('auth.usernameTaken'), async (value) => {
        if (!value) return true
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', value)
          .maybeSingle()
        return !data
      }),
  })

export type UsernameSetupFormValues = InferType<
  ReturnType<typeof usernameSetupFormSchema>
>
