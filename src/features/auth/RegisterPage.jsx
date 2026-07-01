import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRegister, useGoogleLogin } from '../../api/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import { registerFormSchema } from './form/registerFormSchema'

const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800'

export default function Register() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.registerTitle'))
  const registerMutation = useRegister()
  const googleLogin = useGoogleLogin()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerFormSchema(t)),
  })

  const onSubmit = (data) => {
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      username: data.username,
    })
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">{t('auth.registerTitle')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label={t('auth.username')} error={errors.username?.message}>
          <input
            type="text"
            autoComplete="username"
            {...register('username')}
            className={inputClass}
          />
        </Field>

        <Field label={t('auth.email')} error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputClass}
          />
        </Field>

        <Field label={t('auth.password')} error={errors.password?.message}>
          <input
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className={inputClass}
          />
        </Field>

        <Field label={t('auth.confirmPassword')} error={errors.confirmPassword?.message}>
          <input
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={inputClass}
          />
        </Field>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {registerMutation.isPending ? t('common.loading') : t('auth.registerTitle')}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={() => googleLogin.mutate()}
          className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {t('auth.googleLogin')}
        </button>
      </div>

      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-teal-600 hover:underline">
          {t('common.login')}
        </Link>
      </p>
    </div>
  )
}
