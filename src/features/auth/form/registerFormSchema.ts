import * as yup from 'yup'
import type { InferType } from 'yup'
import type { TFunction } from 'i18next'
import { supabase } from '../../../api/supabase'
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_PATTERN, PASSWORD_MIN_LENGTH } from './constants'

export const registerFormSchema = (t: TFunction) =>
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
    email: yup
      .string()
      .required(t('auth.emailRequired'))
      .email(t('auth.emailRequired')),
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

export type RegisterFormValues = InferType<ReturnType<typeof registerFormSchema>>
