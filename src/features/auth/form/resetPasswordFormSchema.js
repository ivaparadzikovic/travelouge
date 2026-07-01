import * as yup from 'yup'

export const resetPasswordFormSchema = (t) =>
  yup.object({
    password: yup
      .string()
      .required(t('auth.passwordRequired'))
      .min(8, t('auth.passwordTooShort'))
      .matches(/[A-Z]/, t('auth.passwordNoUppercase'))
      .matches(/[0-9]/, t('auth.passwordNoNumber')),
    confirmPassword: yup
      .string()
      .required(t('auth.confirmPasswordRequired'))
      .oneOf([yup.ref('password')], t('auth.passwordsDontMatch')),
  })
