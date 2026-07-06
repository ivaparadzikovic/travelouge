import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslation } from 'react-i18next'
import { useUpdateProfile } from '../../../api/profile'
import Field from '../../../components/Field'
import { Modal } from '../../../components/Modal'
import { usernameSetupFormSchema } from '../form/usernameSetupFormSchema'
import type { UsernameSetupFormValues } from '../form/usernameSetupFormSchema'

// This modal is a forced onboarding step (no cancel affordance): it has no
// real dismiss action, so onClose is a no-op — backdrop clicks and Escape
// have no effect, matching the pre-refactor behavior where no such
// listeners existed at all.
function noop() {}

interface UsernameSetupModalProps {
  userId: string
}

export default function UsernameSetupModal({ userId }: UsernameSetupModalProps) {
  const { t } = useTranslation()
  const updateProfile = useUpdateProfile()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UsernameSetupFormValues>({
    resolver: yupResolver(usernameSetupFormSchema(t)),
  })

  const onSubmit = (data: UsernameSetupFormValues) => {
    updateProfile.mutate({ id: userId, username: data.username, display_name: data.username })
  }

  return (
    <Modal
      onClose={noop}
      className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
    >
      <>
        <h2 className="mb-2 text-xl font-bold">{t('auth.setUsernameTitle')}</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {t('auth.setUsernameSubtitle')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label={t('auth.username')} error={errors.username?.message}>
            <input
              type="text"
              autoComplete="username"
              autoFocus
              {...register('username')}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting || updateProfile.isPending}
            className="w-full rounded bg-teal-600 py-2 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {updateProfile.isPending ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </>
    </Modal>
  )
}
