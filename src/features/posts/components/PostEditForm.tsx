import { useTranslation } from 'react-i18next'
import Field from '../../../components/Field'
import type { PostEditorState } from '../hooks/usePostEditor'
import { TITLE_MIN, TITLE_MAX, BODY_MIN, BODY_MAX } from '../constants'
import PostImageEditor from './PostImageEditor'

interface PostEditFormProps {
  editor: PostEditorState
}

const inputClass = 'w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30'

export default function PostEditForm({ editor }: PostEditFormProps) {
  const { t } = useTranslation()
  const {
    handleSubmit,
    onSubmit,
    register,
    errors,
    existingImages,
    newFiles,
    newPreviews,
    addFiles,
    removeExisting,
    removeNewFile,
    cancelEdit,
    submitting,
    uploading,
  } = editor

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
      <Field label={t('post.titleLabel')} error={errors.title?.message}>
        <input
          type="text"
          {...register('title', {
            required: t('post.titleRequired'),
            minLength: { value: TITLE_MIN, message: t('post.titleTooShort') },
            maxLength: { value: TITLE_MAX, message: t('post.titleTooLong') },
          })}
          className={inputClass}
        />
      </Field>
      <Field label={t('post.bodyLabel')} error={errors.body?.message}>
        <textarea
          rows={10}
          {...register('body', {
            required: t('post.bodyRequired'),
            minLength: { value: BODY_MIN, message: t('post.bodyTooShort') },
            maxLength: { value: BODY_MAX, message: t('post.bodyTooLong') },
          })}
          className={inputClass}
        />
      </Field>

      <PostImageEditor
        existingImages={existingImages}
        newFiles={newFiles}
        newPreviews={newPreviews}
        addFiles={addFiles}
        removeExisting={removeExisting}
        removeNewFile={removeNewFile}
      />

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={cancelEdit}
          disabled={submitting}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2 transition-colors disabled:opacity-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {uploading ? t('post.uploading') : submitting ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  )
}
