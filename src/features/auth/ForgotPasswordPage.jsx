import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useRequestPasswordReset } from '../../api/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import { forgotPasswordFormSchema } from './form/forgotPasswordFormSchema'

const inputClass = 'w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

export default function ForgotPassword() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.forgotPasswordTitle'))
  const requestReset = useRequestPasswordReset()
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(forgotPasswordFormSchema(t)),
  })

  const onSubmit = (data) => {
    requestReset.mutate(data.email, {
      onSuccess: () => {
        setSent(true)
        toast.success(t('auth.resetLinkSent'))
      },
      onError: (error) => toast.error(error?.message || t('common.error')),
    })
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-ink">{t('auth.forgotPasswordTitle')}</h1>
      <p className="mb-6 text-sm text-muted">
        {t('auth.forgotPasswordSubtitle')}
      </p>

      {sent ? (
        <p className="text-sm text-ink">{t('auth.resetLinkSent')}</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label={t('auth.email')} error={errors.email?.message}>
            <input
              type="email"
              autoComplete="email"
              {...register('email')}
              className={inputClass}
            />
          </Field>

          <button
            type="submit"
            disabled={requestReset.isPending}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {requestReset.isPending ? t('common.loading') : t('auth.sendResetLink')}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-muted">
        <Link to="/login" className="font-semibold text-accent hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  )
}
