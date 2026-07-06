import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useUpdatePassword } from '../../api/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import { resetPasswordFormSchema } from './form/resetPasswordFormSchema'
import type { ResetPasswordFormValues } from './form/resetPasswordFormSchema'

const inputClass = 'w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

export default function ResetPassword() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.resetPasswordTitle'))
  const navigate = useNavigate()
  const updatePassword = useUpdatePassword()
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordFormSchema(t)),
  })

  const onSubmit = (data: ResetPasswordFormValues) => {
    updatePassword.mutate(data.password, {
      onSuccess: () => {
        toast.success(t('auth.passwordUpdated'))
        navigate('/')
      },
      onError: (error) => toast.error(error?.message || t('common.error')),
    })
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight text-ink">{t('auth.resetPasswordTitle')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label={t('auth.newPassword')} error={errors.password?.message}>
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
          disabled={updatePassword.isPending}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {updatePassword.isPending ? t('common.loading') : t('common.save')}
        </button>
      </form>
    </div>
  )
}
