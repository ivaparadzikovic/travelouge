import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useUpdateProfile } from '../hooks/useProfile'

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

export default function UsernameSetupModal({ userId }) {
  const { t } = useTranslation()
  const updateProfile = useUpdateProfile()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = (data) => {
    updateProfile.mutate({ id: userId, username: data.username, display_name: data.username })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-2 text-xl font-bold">{t('auth.setUsernameTitle')}</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {t('auth.setUsernameSubtitle')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('auth.username')}</label>
            <input
              type="text"
              autoFocus
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
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || updateProfile.isPending}
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updateProfile.isPending ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  )
}
