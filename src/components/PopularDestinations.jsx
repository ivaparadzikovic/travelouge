import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePopularDestinations } from '../hooks/useCategories'

export default function PopularDestinations() {
  const { t } = useTranslation()
  const { data: destinations, isLoading } = usePopularDestinations(5)

  if (isLoading || !destinations || destinations.length === 0) return null

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold">{t('home.popularDestinations')}</h2>
      <ul className="flex flex-wrap gap-2">
        {destinations.map((d) => {
          const code = d.code.toLowerCase()
          return (
            <li key={d.country_id}>
              <Link
                to={`/browse?country=${d.code}`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 text-sm transition hover:border-blue-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 dark:hover:bg-gray-700"
              >
                <img
                  src={`https://flagcdn.com/w40/${code}.png`}
                  srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
                  alt=""
                  width="20"
                  height="15"
                  loading="lazy"
                  className="h-4 w-6 rounded-sm object-cover"
                />
                <span className="font-medium">
                  {t(`countries.${d.code}`, { defaultValue: d.name })}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  · {d.post_count}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
