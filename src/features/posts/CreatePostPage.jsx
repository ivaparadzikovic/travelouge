import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/auth'
import { useCountries } from '../../api/countries'
import { useCategories } from '../../api/categories'
import { useCreatePost, uploadPostImages } from '../../api/posts'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import CountryFlag from '../../components/CountryFlag'
import SelectMenu from './components/SelectMenu'
import ImagePicker from './components/ImagePicker'
import { postFormSchema, MAX_IMAGES, imageFileError } from './form/postFormSchema'

// Light mode uses a purple border on inputs for stronger contrast; dark mode
// keeps the neutral border token.
const inputClass = 'w-full rounded-lg border border-accent bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-border dark:focus:border-accent'

export default function CreatePost() {
  const { t, i18n } = useTranslation()
  useDocumentTitle(t('post.createTitle'))
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data: countries, isLoading: countriesLoading } = useCountries()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const createPost = useCreatePost()
  const [uploading, setUploading] = useState(false)
  const [imageFiles, setImageFiles] = useState([])
  const [titleLen, setTitleLen] = useState(0)
  const [countryId, setCountryId] = useState(null)
  const [categoryId, setCategoryId] = useState(null)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(postFormSchema(t)),
  })
  const titleRegister = register('title')

  const previews = useMemo(
    () => imageFiles.map((f) => URL.createObjectURL(f)),
    [imageFiles],
  )
  useEffect(() => {
    return () => { previews.forEach((url) => URL.revokeObjectURL(url)) }
  }, [previews])

  const addFiles = (fileList) => {
    const files = Array.from(fileList ?? [])
    if (files.length === 0) return
    const room = MAX_IMAGES - imageFiles.length
    if (room <= 0) {
      toast.error(t('post.imageTooMany', { count: MAX_IMAGES }))
      return
    }
    const accepted = []
    for (const f of files) {
      const err = imageFileError(f, t)
      if (err) {
        toast.error(err)
        continue
      }
      accepted.push(f)
    }
    if (accepted.length > room) {
      toast.error(t('post.imageTooMany', { count: MAX_IMAGES }))
    }
    setImageFiles((prev) => [...prev, ...accepted.slice(0, room)])
  }
  const removeFile = (idx) =>
    setImageFiles((prev) => prev.filter((_, i) => i !== idx))

  const collator = new Intl.Collator(i18n.language)
  const localizedCountries = countries
    ?.map((c) => ({
      id: c.id,
      label: t(`countries.${c.code}`, { defaultValue: c.name }),
      icon: <CountryFlag code={c.code} />,
    }))
    .sort((a, b) => collator.compare(a.label, b.label))
  const localizedCategories = categories
    ?.map((c) => ({ id: c.id, label: t(`categories.${c.slug}`, { defaultValue: c.name }) }))
    .sort((a, b) => collator.compare(a.label, b.label))

  const onSubmit = async (data) => {
    let imageUrls = []

    if (imageFiles.length > 0) {
      try {
        setUploading(true)
        imageUrls = await uploadPostImages(imageFiles, user.id)
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
        image_url: imageUrls[0] ?? null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      },
      {
        onSuccess: (row) => navigate(`/post/${row.id}`),
      },
    )
  }

  const submitting = uploading || createPost.isPending

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <Link
        to="/"
        className="mb-2 inline-block text-xs text-muted hover:text-ink transition-colors"
      >
        ← {t('common.home')}
      </Link>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        {t('post.createTitle')}
      </h1>
      <p className="mb-6 mt-0.5 text-sm text-muted">{t('post.createSubtitle')}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Field label={t('post.titleLabel')} error={errors.title?.message}>
            <input
              type="text"
              {...titleRegister}
              onChange={(e) => {
                titleRegister.onChange(e)
                setTitleLen(e.target.value.length)
              }}
              className={inputClass}
            />
          </Field>
          <div className="mt-1 text-right text-xs text-muted">{titleLen} / 200</div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('post.countryLabel')} error={errors.country_id?.message}>
            <SelectMenu
              options={localizedCountries ?? []}
              value={countryId}
              onChange={(id) => {
                setCountryId(id)
                setValue('country_id', id, { shouldValidate: true })
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
                setCategoryId(id)
                setValue('category_id', id, { shouldValidate: true })
              }}
              placeholder={t('post.selectCategory')}
              disabled={categoriesLoading}
              triggerClass={inputClass}
            />
          </Field>
        </div>

        <Field label={t('post.bodyLabel')} error={errors.body?.message}>
          <textarea rows={10} {...register('body')} className={inputClass} />
        </Field>

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
