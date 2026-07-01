import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { supabase } from '../../api/supabase'
import { useAuthStore } from '../../stores/auth'
import { useCountries } from '../../api/countries'
import { useCategories } from '../../api/categories'
import { useCreatePost } from '../../api/posts'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import {
  postFormSchema,
  ALLOWED_IMAGE_TYPES,
} from './form/postFormSchema'

const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800'

export default function CreatePost() {
  const { t, i18n } = useTranslation()
  useDocumentTitle(t('post.createTitle'))
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data: countries, isLoading: countriesLoading } = useCountries()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const createPost = useCreatePost()
  const [uploading, setUploading] = useState(false)
  const [imageName, setImageName] = useState('')
  const fileInputRef = useRef(null)
  const { register, handleSubmit, resetField, formState: { errors } } = useForm({
    resolver: yupResolver(postFormSchema(t)),
  })
  const imageRegister = register('image')

  const collator = new Intl.Collator(i18n.language)
  const localizedCountries = countries
    ?.map((c) => ({ id: c.id, label: t(`countries.${c.code}`, { defaultValue: c.name }) }))
    .sort((a, b) => collator.compare(a.label, b.label))
  const localizedCategories = categories
    ?.map((c) => ({ id: c.id, label: t(`categories.${c.slug}`, { defaultValue: c.name }) }))
    .sort((a, b) => collator.compare(a.label, b.label))

  const onSubmit = async (data) => {
    let image_url = null
    const file = data.image?.[0]

    if (file) {
      try {
        setUploading(true)
        const ext = file.name.split('.').pop().toLowerCase()
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(path, file, { contentType: file.type })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(path)
        image_url = urlData.publicUrl
      } catch (err) {
        toast.error(err.message)
        setUploading(false)
        return
      }
      setUploading(false)
    }

    createPost.mutate(
      {
        author_id: user.id,
        title: data.title.trim(),
        body: data.body.trim(),
        country_id: data.country_id,
        category_id: data.category_id,
        image_url,
      },
      {
        onSuccess: (row) => navigate(`/post/${row.id}`),
      },
    )
  }

  const submitting = uploading || createPost.isPending

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">{t('post.createTitle')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label={t('post.titleLabel')} error={errors.title?.message}>
          <input type="text" {...register('title')} className={inputClass} />
        </Field>

        <Field label={t('post.bodyLabel')} error={errors.body?.message}>
          <textarea rows={10} {...register('body')} className={inputClass} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('post.countryLabel')} error={errors.country_id?.message}>
            <select
              {...register('country_id', { valueAsNumber: true })}
              defaultValue=""
              disabled={countriesLoading}
              className={inputClass}
            >
              <option value="" disabled>{t('post.selectCountry')}</option>
              {localizedCountries?.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>

          <Field label={t('post.categoryLabel')} error={errors.category_id?.message}>
            <select
              {...register('category_id', { valueAsNumber: true })}
              defaultValue=""
              disabled={categoriesLoading}
              className={inputClass}
            >
              <option value="" disabled>{t('post.selectCategory')}</option>
              {localizedCategories?.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={t('post.imageLabel')} error={errors.image?.message}>
          <input
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            {...imageRegister}
            ref={(el) => {
              imageRegister.ref(el)
              fileInputRef.current = el
            }}
            onChange={(e) => {
              imageRegister.onChange(e)
              setImageName(e.target.files?.[0]?.name ?? '')
            }}
            className="sr-only"
          />
        </Field>
        <div className="flex items-center gap-3 flex-wrap -mt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('post.chooseImage')}
          </button>
          <span className="text-sm text-gray-500 truncate">
            {imageName || t('post.noImageChosen')}
          </span>
          {imageName && (
            <button
              type="button"
              onClick={() => {
                resetField('image')
                setImageName('')
              }}
              className="text-sm text-red-600 hover:underline"
            >
              {t('post.removeImage')}
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {uploading ? t('post.uploading') : submitting ? t('common.loading') : t('post.submitLabel')}
        </button>
      </form>
    </div>
  )
}
