import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLogin, useGoogleLogin } from '../hooks/useAuth'

export default function Login() {
  const { t } = useTranslation()
  const login = useLogin()
  const googleLogin = useGoogleLogin()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = (data) => {
    login.mutate(data)
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">{t('auth.loginTitle')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('auth.identifier')}</label>
          <input
            type="text"
            autoComplete="username"
            {...register('identifier', { required: t('auth.identifierRequired') })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          {errors.identifier && <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
          <input
            type="password"
            {...register('password', { required: t('auth.passwordRequired') })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
        <Link to="/register" className="text-blue-600 hover:underline">
          {t('common.register')}
        </Link>
      </p>
    </div>
  )
}
