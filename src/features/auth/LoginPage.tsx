import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import type { AuthError } from '@supabase/supabase-js'
import { useLogin, useGoogleLogin } from '../../api/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import GoogleButton from './components/GoogleButton'
import { loginFormSchema } from './form/loginFormSchema'
import type { LoginFormValues } from './form/loginFormSchema'
import { inputClass, submitButtonClass } from '../../components/formStyles'

export default function Login() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.loginTitle'))
  const login = useLogin()
  const googleLogin = useGoogleLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: yupResolver(loginFormSchema(t)),
  })

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data, {
      onError: (error) => {
        // useLogin's mutationFn throws whatever supabase-js rejects with,
        // which for signInWithPassword/the RPC lookup is always an
        // AuthError (with an optional `.code`), not the generic `Error`
        // useMutation's TError defaults to.
        const authError = error as AuthError
        const invalidCredentials =
          authError?.code === 'invalid_credentials' ||
          /invalid login credentials/i.test(authError?.message || '')
        toast.error(
          invalidCredentials ? t('auth.wrongPassword') : authError?.message || t('common.error'),
        )
      },
    })
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0_10px_30px_-18px_rgba(20,24,44,0.35)]">
        <div className="mb-1 text-center font-display text-base font-bold text-accent">
          {t('common.appName')}
        </div>
        <h1 className="mb-5 text-center font-display text-xl font-bold text-ink">
          {t('auth.loginTitle')}
        </h1>

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
            <Link to="/forgot-password" className="text-sm text-accent hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className={submitButtonClass}
          >
            {login.isPending ? t('common.loading') : t('auth.loginTitle')}
          </button>
        </form>

        <GoogleButton onClick={() => googleLogin.mutate()} disabled={googleLogin.isPending} />

        <p className="mt-4 text-center text-sm text-muted">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            {t('common.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
