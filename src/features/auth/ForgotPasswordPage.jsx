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

const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800'

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
      <h1 className="text-2xl font-bold mb-2">{t('auth.forgotPasswordTitle')}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {t('auth.forgotPasswordSubtitle')}
      </p>

      {sent ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">{t('auth.resetLinkSent')}</p>
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
            className="w-full py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {requestReset.isPending ? t('common.loading') : t('auth.sendResetLink')}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        <Link to="/login" className="text-teal-600 hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </div>
  )
}
