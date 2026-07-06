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
      <p className="mb-6 text-sm text-muted">
        <Link to="/login" className="text-accent hover:underline">
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
          className="w-full px-3 py-2 border border-border rounded bg-surface"
        />
      </Field>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-accent text-accent-ink rounded hover:bg-accent-hover disabled:opacity-50"
        >
          {isSubmitting ? t('common.loading') : t('comments.submit')}
        </button>
      </div>
    </form>
  )
}
