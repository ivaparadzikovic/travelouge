import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useBrowsePosts } from '../../api/posts'
import { useCountries } from '../../api/countries'
import { useCategories } from '../../api/categories'
import { useDocumentTitle } from '../../utils/useDocumentTitle'
import PostCard from './components/PostCard'
import PostCardSkeleton from './components/PostCardSkeleton'
import SelectMenu from './components/SelectMenu'
import CountryFlag from '../../components/CountryFlag'

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
    ?.map((c) => ({
      id: c.id,
      label: t(`countries.${c.code}`, { defaultValue: c.name }),
      icon: <CountryFlag code={c.code} />,
    }))
    .sort((a, b) => collator.compare(a.label, b.label))
  const localizedCategories = categories
    ?.map((c) => ({ id: c.id, label: t(`categories.${c.slug}`, { defaultValue: c.name }) }))
    .sort((a, b) => collator.compare(a.label, b.label))

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight mb-6">{t('common.browse')}</h1>

      <form onSubmit={onSearchSubmit} role="search" className="mb-4">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
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
            className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </form>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <SelectMenu
          options={[
            { id: '', label: t('browse.allCountries') },
            ...(localizedCountries ?? []),
          ]}
          value={countryId}
          onChange={(id) => setCountryFromId(id)}
          placeholder={t('browse.allCountries')}
          aria-label={t('post.countryLabel')}
          className="inline-block"
          triggerClass="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {localizedCategories?.map((c) => {
          const active = String(c.id) === String(categoryId)
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFromId(active ? '' : c.id)}
              aria-pressed={active}
              className={
                active
                  ? 'rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink'
                  : 'rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-muted hover:text-ink transition-colors'
              }
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {isError && <p className="text-down">{error.message}</p>}
      {!isLoading && !isError && posts?.length === 0 && (
        <p className="text-muted">{t('post.noResults')}</p>
      )}

      <ul className="space-y-2.5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts?.map((post) => <PostCard key={post.id} post={post} />)}
      </ul>
    </div>
  )
}
