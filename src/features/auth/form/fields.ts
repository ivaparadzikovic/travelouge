import * as yup from 'yup'
import type { TFunction } from 'i18next'
import { supabase } from '../../../api/supabase'
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
  PASSWORD_MIN_LENGTH,
} from './constants'

export const usernameField = (t: TFunction) =>
  yup
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
    })

export const passwordField = (t: TFunction) =>
  yup
    .string()
    .required(t('auth.passwordRequired'))
    .min(PASSWORD_MIN_LENGTH, t('auth.passwordTooShort'))
    .matches(/[A-Z]/, t('auth.passwordNoUppercase'))
    .matches(/[0-9]/, t('auth.passwordNoNumber'))

export const confirmPasswordField = (t: TFunction) =>
  yup
    .string()
    .required(t('auth.confirmPasswordRequired'))
    .oneOf([yup.ref('password')], t('auth.passwordsDontMatch'))
