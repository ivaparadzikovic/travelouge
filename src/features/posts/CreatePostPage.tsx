import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/auth'
import { useCountries } from '../../api/countries'
import { useCategories } from '../../api/categories'
import { useCreatePost, uploadPostImages } from '../../api/posts'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import ImagePicker from './components/ImagePicker'
import SelectMenu from './components/SelectMenu'
import { useImagePicker } from './hooks/useImagePicker'
import { useLocalizedOptions } from './hooks/useLocalizedOptions'
import { postFormSchema } from './form/postFormSchema'
import type { PostFormValues } from './form/postFormSchema'
import { inputClass } from '../../components/formStyles'

export default function CreatePost() {
  const { t } = useTranslation()
  useDocumentTitle(t('post.createTitle'))
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data: countries, isLoading: countriesLoading } = useCountries()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const createPost = useCreatePost()
  const [uploading, setUploading] = useState(false)
  const { files: imageFiles, previews, addFiles, removeFile } = useImagePicker()
  const [countryId, setCountryId] = useState<number>()
  const [categoryId, setCategoryId] = useState<number>()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PostFormValues>({
    resolver: yupResolver(postFormSchema(t)),
  })

  const { localizedCountries, localizedCategories } = useLocalizedOptions(countries, categories)

  const onSubmit = async (data: PostFormValues) => {
    let imageUrls: string[] = []

    if (imageFiles.length > 0) {
      try {
        setUploading(true)
        // CreatePostPage is only reachable via ProtectedRoute, so user is
        // always non-null here.
        imageUrls = await uploadPostImages(imageFiles, user!.id)
      } catch (err) {
        // Storage errors thrown above are always Error instances (supabase-js
        // StorageError extends Error).
        toast.error((err as Error).message)
        setUploading(false)
        return
      }
      setUploading(false)
    }

    createPost.mutate(
      {
        author_id: user!.id,
        title: data.title.trim(),
        body: data.body.trim(),
        country_id: data.country_id,
        category_id: data.category_id,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      },
      {
        onSuccess: (row) => navigate(`/post/${row.id}`),
      },
    )
  }

  const submitting = uploading || createPost.isPending

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="font-display text-2xl font-bold tracking-tight mb-6">{t('post.createTitle')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label={t('post.titleLabel')} error={errors.title?.message}>
          <input type="text" {...register('title')} className={inputClass} />
        </Field>

        <Field label={t('post.bodyLabel')} error={errors.body?.message}>
          <textarea rows={10} {...register('body')} className={inputClass} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('post.countryLabel')} error={errors.country_id?.message}>
            <SelectMenu
              options={localizedCountries ?? []}
              value={countryId}
              onChange={(id) => {
                setCountryId(Number(id))
                setValue('country_id', Number(id), { shouldValidate: true })
              }}
              placeholder={t('post.selectCountry')}
              disabled={countriesLoading}
              triggerClass={inputClass}
            />
          </Field>

          <Field label={t('post.categoryLabel')} error={errors.category_id?.message}>
            <SelectMenu
              options={localizedCategories ?? []}
              value={categoryId}
              onChange={(id) => {
                setCategoryId(Number(id))
                setValue('category_id', Number(id), { shouldValidate: true })
              }}
              placeholder={t('post.selectCategory')}
              disabled={categoriesLoading}
              triggerClass={inputClass}
            />
          </Field>
        </div>

        {/* Photos — optional, text-first */}
        <div>
          <div className="mb-1.5 text-sm font-medium text-ink">
            {t('post.photosLabel')}{' '}
            <span className="font-normal text-muted">· {t('post.optional')}</span>
          </div>
          <ImagePicker
            images={imageFiles.map((file, i) => ({
              key: `${i}-${file.name}`,
              src: previews[i],
              onRemove: () => removeFile(i),
            }))}
            onAdd={addFiles}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {uploading ? t('post.uploading') : submitting ? t('common.loading') : t('post.submitLabel')}
        </button>
      </form>
    </div>
  )
}
