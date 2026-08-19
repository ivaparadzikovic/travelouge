import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRegister, useGoogleLogin } from '../../api/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import GoogleButton from './components/GoogleButton'
import { registerFormSchema } from './form/registerFormSchema'
import type { RegisterFormValues } from './form/registerFormSchema'
import { inputClass, submitButtonClass } from '../../components/formStyles'

export default function Register() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.registerTitle'))
  const registerMutation = useRegister()
  const googleLogin = useGoogleLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerFormSchema(t)),
  })

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      username: data.username,
    })
  }

  return (
    <div className="mx-auto mt-6 w-full"
        style={{ maxWidth: '520px', marginLeft: 'auto',  marginRight: 'auto', }}>
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-[0_10px_30px_-18px_rgba(20,24,44,0.35)]"   style={{ padding: '32px' }}>
        <div className="mb-1 text-center font-display text-[22px] font-bold text-accent"  style={{ fontSize: '22px', textAlign: 'center', width: '100%' }}>
          {t('common.appName')}
        </div>
        <h1 className="mb-5 text-center font-display text-xl font-bold text-ink"   style={{ textAlign: 'center', width: '100%' }}>
          {t('auth.registerTitle')}
        </h1>

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
            className={submitButtonClass}
          >
            {registerMutation.isPending ? t('common.loading') : t('auth.registerTitle')}
          </button>
        </form>

        <GoogleButton onClick={() => googleLogin.mutate()} disabled={googleLogin.isPending} />

        <p className="mt-4 text-center text-sm text-muted">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            {t('common.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
