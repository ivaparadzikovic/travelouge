import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useBrowsePosts } from '../hooks/usePosts'
import { useCountries, useCategories } from '../hooks/useCategories'

export default function Browse() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [categoryId, setCategoryId] = useState('')

  const { data: countries } = useCountries()
  const { data: categories } = useCategories()

  const countryCode = searchParams.get('country') ?? ''
  const countryId = countries?.find((c) => c.code === countryCode)?.id ?? ''
  const setCountryId = (id) => {
    const next = new URLSearchParams(searchParams)
    const code = countries?.find((c) => String(c.id) === String(id))?.code
    if (code) next.set('country', code)
    else next.delete('country')
    setSearchParams(next, { replace: true })
  }

  const { data: posts, isLoading, isError, error } = useBrowsePosts({
    countryId: countryId ? Number(countryId) : null,
    categoryId: categoryId ? Number(categoryId) : null,
  })

  const collator = new Intl.Collator(i18n.language)
  const localizedCountries = countries
    ?.map((c) => ({ id: c.id, label: t(`countries.${c.code}`, { defaultValue: c.name }) }))
    .sort((a, b) => collator.compare(a.label, b.label))
  const localizedCategories = categories
    ?.map((c) => ({ id: c.id, label: t(`categories.${c.slug}`, { defaultValue: c.name }) }))
    .sort((a, b) => collator.compare(a.label, b.label))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('common.browse')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t('post.countryLabel')}</label>
          <select
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          >
            <option value="">{t('browse.allCountries')}</option>
            {localizedCountries?.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('post.categoryLabel')}</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
          >
            <option value="">{t('browse.allCategories')}</option>
            {localizedCategories?.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && <p className="text-gray-500">{t('common.loading')}</p>}
      {isError && <p className="text-red-500">{error.message}</p>}
      {!isLoading && !isError && posts?.length === 0 && (
        <p className="text-gray-500">{t('post.noResults')}</p>
      )}

      <ul className="space-y-3">
        {posts?.map((post) => (
          <li
            key={post.id}
            className="border border-gray-200 dark:border-gray-700 rounded p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Link to={`/post/${post.id}`} className="block">
              <h2 className="text-lg font-semibold text-blue-600 hover:underline">{post.title}</h2>
              <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-2">
                <span>
                  {t('home.by')}{' '}
                  <Link
                    to={`/profile/${post.author_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:underline"
                  >
                    @{post.profiles?.username}
                  </Link>
                </span>
                <span>·</span>
                <span>{t(`categories.${post.categories?.slug}`, { defaultValue: post.categories?.name })}</span>
                <span>·</span>
                <span>{t(`countries.${post.countries?.code}`, { defaultValue: post.countries?.name })}</span>
                <span>·</span>
                <span className="text-green-700 dark:text-green-400">↑ {post.upvote_count}</span>
                <span className="text-red-700 dark:text-red-400">↓ {post.downvote_count}</span>
                <span>·</span>
                <span>{post.view_count ?? 0} {t('post.views')}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
