import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useUpdatePassword } from '../../api/auth'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import { resetPasswordFormSchema } from './form/resetPasswordFormSchema'

const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800'

export default function ResetPassword() {
  const { t } = useTranslation()
  useDocumentTitle(t('auth.resetPasswordTitle'))
  const navigate = useNavigate()
  const updatePassword = useUpdatePassword()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordFormSchema(t)),
  })

  const onSubmit = (data) => {
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
      <h1 className="text-2xl font-bold mb-6">{t('auth.resetPasswordTitle')}</h1>

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
          className="w-full py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {updatePassword.isPending ? t('common.loading') : t('common.save')}
        </button>
      </form>
    </div>
  )
}
