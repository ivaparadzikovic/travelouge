import * as yup from 'yup'

export const forgotPasswordFormSchema = (t) =>
  yup.object({
    email: yup
      .string()
      .required(t('auth.emailRequired'))
      .email(t('auth.emailRequired')),
  })
