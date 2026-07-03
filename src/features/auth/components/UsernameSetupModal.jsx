import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslation } from 'react-i18next'
import { useUpdateProfile } from '../../../api/profile'
import Field from '../../../components/Field'
import { usernameSetupFormSchema } from '../form/usernameSetupFormSchema'

export default function UsernameSetupModal({ userId }) {
  const { t } = useTranslation()
  const updateProfile = useUpdateProfile()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(usernameSetupFormSchema(t)),
  })

  const onSubmit = (data) => {
    updateProfile.mutate({ id: userId, username: data.username, display_name: data.username })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <h2 className="mb-2 font-display text-xl font-bold tracking-tight text-ink">{t('auth.setUsernameTitle')}</h2>
        <p className="mb-4 text-sm text-muted">
          {t('auth.setUsernameSubtitle')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label={t('auth.username')} error={errors.username?.message}>
            <input
              type="text"
              autoComplete="username"
              autoFocus
              {...register('username')}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting || updateProfile.isPending}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {updateProfile.isPending ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  )
}
