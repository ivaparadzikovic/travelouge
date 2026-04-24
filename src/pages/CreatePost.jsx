import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useCountries, useCategories } from '../hooks/useCategories'
import { useCreatePost } from '../hooks/usePosts'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function CreatePost() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data: countries, isLoading: countriesLoading } = useCountries()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const createPost = useCreatePost()
  const [uploading, setUploading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

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
        <div>
          <label className="block text-sm font-medium mb-1">{t('post.titleLabel')}</label>
          <input
            type="text"
            {...register('title', {
              required: t('post.titleRequired'),
              minLength: { value: 5, message: t('post.titleTooShort') },
              maxLength: { value: 200, message: t('post.titleTooLong') },
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('post.bodyLabel')}</label>
          <textarea
            rows={10}
            {...register('body', {
              required: t('post.bodyRequired'),
              minLength: { value: 10, message: t('post.bodyTooShort') },
              maxLength: { value: 10000, message: t('post.bodyTooLong') },
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          />
          {errors.body && <p className="text-red-500 text-sm mt-1">{errors.body.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('post.countryLabel')}</label>
            <select
              {...register('country_id', {
                required: t('post.countryRequired'),
                valueAsNumber: true,
              })}
              defaultValue=""
              disabled={countriesLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            >
              <option value="" disabled>{t('post.selectCountry')}</option>
              {countries?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.country_id && <p className="text-red-500 text-sm mt-1">{errors.country_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('post.categoryLabel')}</label>
            <select
              {...register('category_id', {
                required: t('post.categoryRequired'),
                valueAsNumber: true,
              })}
              defaultValue=""
              disabled={categoriesLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            >
              <option value="" disabled>{t('post.selectCategory')}</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('post.imageLabel')}</label>
          <input
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            {...register('image', {
              validate: (fileList) => {
                const f = fileList?.[0]
                if (!f) return true
                if (!ALLOWED_IMAGE_TYPES.includes(f.type)) return t('post.imageInvalidType')
                if (f.size > MAX_IMAGE_BYTES) return t('post.imageTooLarge')
                return true
              },
            })}
            className="w-full text-sm"
          />
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? t('post.uploading') : submitting ? t('common.loading') : t('post.submitLabel')}
        </button>
      </form>
    </div>
  )
}
