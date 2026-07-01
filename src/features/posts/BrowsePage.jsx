import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useBrowsePosts } from '../../api/posts'
import { useCountries } from '../../api/countries'
import { useCategories } from '../../api/categories'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import Field from '../../components/Field'
import PostCard from './components/PostCard'
import PostCardSkeleton from './components/PostCardSkeleton'

export default function Browse() {
  const { t, i18n } = useTranslation()
  useDocumentTitle(t('common.browse'))
  const [searchParams, setSearchParams] = useSearchParams()

  const { data: countries } = useCountries()
  const { data: categories } = useCategories()

  const countryCode = searchParams.get('country') ?? ''
  const categorySlug = searchParams.get('category') ?? ''
  const urlQuery = searchParams.get('q') ?? ''
  const countryId = countries?.find((c) => c.code === countryCode)?.id ?? ''
  const categoryId = categories?.find((c) => c.slug === categorySlug)?.id ?? ''

  const [queryInput, setQueryInput] = useState(urlQuery)
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery)
  if (lastUrlQuery !== urlQuery) {
    setLastUrlQuery(urlQuery)
    setQueryInput(urlQuery)
  }

  const setCountryFromId = (id) => {
    const next = new URLSearchParams(searchParams)
    const code = countries?.find((c) => String(c.id) === String(id))?.code
    if (code) next.set('country', code)
    else next.delete('country')
    setSearchParams(next, { replace: true })
  }
  const setCategoryFromId = (id) => {
    const next = new URLSearchParams(searchParams)
    const slug = categories?.find((c) => String(c.id) === String(id))?.slug
    if (slug) next.set('category', slug)
    else next.delete('category')
    setSearchParams(next, { replace: true })
  }
  const onSearchSubmit = (e) => {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    const q = queryInput.trim()
    if (q.length >= 2) next.set('q', q)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const { data: posts, isLoading, isError, error } = useBrowsePosts({
    countryId: countryId ? Number(countryId) : null,
    categoryId: categoryId ? Number(categoryId) : null,
    q: urlQuery,
  })

  const collator = new Intl.Collator(i18n.language)
  const localizedCountries = countries
    ?.map((c) => ({ id: c.id, label: t(`countries.${c.code}`, { defaultValue: c.name }) }))
    .sort((a, b) => collator.compare(a.label, b.label))
  const localizedCategories = categories
    ?.map((c) => ({ id: c.id, label: t(`categories.${c.slug}`, { defaultValue: c.name }) }))
    .sort((a, b) => collator.compare(a.label, b.label))

  const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800'

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('common.browse')}</h1>

      <form onSubmit={onSearchSubmit} role="search" className="mb-4">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={t('common.search')}
            aria-label={t('common.search')}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Field label={t('post.countryLabel')}>
          <select
            value={countryId}
            onChange={(e) => setCountryFromId(e.target.value)}
            className={inputClass}
          >
            <option value="">{t('browse.allCountries')}</option>
            {localizedCountries?.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label={t('post.categoryLabel')}>
          <select
            value={categoryId}
            onChange={(e) => setCategoryFromId(e.target.value)}
            className={inputClass}
          >
            <option value="">{t('browse.allCategories')}</option>
            {localizedCategories?.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {isError && <p className="text-red-500">{error.message}</p>}
      {!isLoading && !isError && posts?.length === 0 && (
        <p className="text-gray-500">{t('post.noResults')}</p>
      )}

      <ul className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts?.map((post) => <PostCard key={post.id} post={post} />)}
      </ul>
    </div>
  )
}
