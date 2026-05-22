import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRegister, useGoogleLogin } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/
const PASSWORD_UPPERCASE = /[A-Z]/
const PASSWORD_NUMBER = /[0-9]/

export default function Register() {
  const { t } = useTranslation()
  const registerMutation = useRegister()
  const googleLogin = useGoogleLogin()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

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
        <div>
          <label className="block text-sm font-medium mb-1">{t('auth.username')}</label>
          <input
            type="text"
            {...register('username', {
              required: t('auth.usernameRequired'),
              minLength: { value: 3, message: t('auth.usernameTooShort') },
              maxLength: { value: 20, message: t('auth.usernameTooLong') },
              pattern: { value: USERNAME_PATTERN, message: t('auth.usernameInvalidChars') },
              validate: async (value) => {
                const { data } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('username', value)
                  .maybeSingle()
                return data ? t('auth.usernameTaken') : true
              },
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
          <input
            type="email"
            {...register('email', { required: t('auth.emailRequired') })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
          <input
            type="password"
            {...register('password', {
              required: t('auth.passwordRequired'),
              minLength: { value: 8, message: t('auth.passwordTooShort') },
              validate: {
                uppercase: (value) => PASSWORD_UPPERCASE.test(value) || t('auth.passwordNoUppercase'),
                number: (value) => PASSWORD_NUMBER.test(value) || t('auth.passwordNoNumber'),
              },
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('auth.confirmPassword')}</label>
          <input
            type="password"
            {...register('confirmPassword', {
              required: t('auth.confirmPasswordRequired'),
              validate: (value) => value === password || t('auth.passwordsDontMatch'),
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
        <Link to="/login" className="text-blue-600 hover:underline">
          {t('common.login')}
        </Link>
      </p>
    </div>
  )
}
