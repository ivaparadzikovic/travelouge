import * as yup from 'yup'
import { supabase } from '../../../api/supabase'

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

export const usernameSetupFormSchema = (t) =>
  yup.object({
    username: yup
      .string()
      .required(t('auth.usernameRequired'))
      .min(3, t('auth.usernameTooShort'))
      .max(20, t('auth.usernameTooLong'))
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
