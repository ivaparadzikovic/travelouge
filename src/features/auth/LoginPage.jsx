import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useLogin, useGoogleLogin } from '../../api/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import { loginFormSchema } from './form/loginFormSchema'

const inputClass = 'w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

export default function Login() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.loginTitle'))
  const login = useLogin()
  const googleLogin = useGoogleLogin()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginFormSchema(t)),
  })

  const onSubmit = (data) => {
    login.mutate(data, {
      onError: (error) => {
        const invalidCredentials =
          error?.code === 'invalid_credentials' ||
          /invalid login credentials/i.test(error?.message || '')
        toast.error(
          invalidCredentials ? t('auth.wrongPassword') : error?.message || t('common.error'),
        )
      },
    })
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">{t('auth.loginTitle')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label={t('auth.identifier')} error={errors.identifier?.message}>
          <input
            type="text"
            autoComplete="username"
            {...register('identifier')}
            className={inputClass}
          />
        </Field>

        <Field label={t('auth.password')} error={errors.password?.message}>
          <input
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={inputClass}
          />
        </Field>

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-teal-600 hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {login.isPending ? t('common.loading') : t('auth.loginTitle')}
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
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-teal-600 hover:underline">
          {t('common.register')}
        </Link>
      </p>
    </div>
  )
}
