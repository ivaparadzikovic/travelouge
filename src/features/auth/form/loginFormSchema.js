import * as yup from 'yup'

export const loginFormSchema = (t) =>
  yup.object({
    identifier: yup.string().trim().required(t('auth.identifierRequired')),
    password: yup.string().required(t('auth.passwordRequired')),
  })
