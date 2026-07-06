import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { RefObject } from 'react'
import type { FieldErrors, UseFormRegisterReturn } from 'react-hook-form'
import type { User } from '@supabase/supabase-js'
import Field from '../../../components/Field'

interface CommentFormValues {
  body: string
}

interface CommentFormProps {
  user: User | null
  bodyRegister: UseFormRegisterReturn<'body'>
  textareaRef: RefObject<HTMLTextAreaElement | null>
  errors: FieldErrors<CommentFormValues>
  onSubmit: (event?: React.BaseSyntheticEvent) => void
  isSubmitting: boolean
}

export default function CommentForm({
  user,
  bodyRegister,
  textareaRef,
  errors,
  onSubmit,
  isSubmitting,
}: CommentFormProps) {
  const { t } = useTranslation()

  if (!user) {
    return (
      <p className="mb-6 text-sm text-gray-500">
        <Link to="/login" className="text-teal-600 hover:underline">
          {t('common.login')}
        </Link>{' '}
        {t('comments.signInPrompt')}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mb-6">
      <Field error={errors.body?.message}>
        <textarea
          rows={3}
          placeholder={t('comments.placeholder')}
          aria-label={t('post.comments')}
          {...bodyRegister}
          ref={(el) => {
            bodyRegister.ref(el)
            textareaRef.current = el
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
        />
      </Field>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {isSubmitting ? t('common.loading') : t('comments.submit')}
        </button>
      </div>
    </form>
  )
}
