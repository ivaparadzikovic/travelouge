import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePopularDestinations } from '../../../api/countries'
import CountryFlag from '../../../components/CountryFlag'
import { POPULAR_DESTINATIONS_LIMIT } from '../constants'

export default function PopularDestinations() {
  const { t } = useTranslation()
  const { data: destinations, isLoading } = usePopularDestinations(POPULAR_DESTINATIONS_LIMIT)

  if (isLoading || !destinations || destinations.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
        {t('home.popularDestinations')}
      </h2>
      <ul className="flex flex-wrap gap-2.5">
        {destinations.map((d) => (
          <li key={d.country_id}>
            <Link
              to={`/browse?country=${d.code}`}
              className="group inline-flex items-center gap-2 rounded-full border border-accent/60 bg-surface py-2 pl-2 pr-3.5 transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft dark:border-border"
            >
              <CountryFlag code={d.code} className="h-4 w-6" />
              <span className="font-display text-[13px] font-semibold text-ink transition-colors group-hover:text-accent">
                {t(`countries.${d.code}`, { defaultValue: d.name })}
              </span>
              <span className="text-xs text-muted">{d.post_count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
