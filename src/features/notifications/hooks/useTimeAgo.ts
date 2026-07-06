import { MS_PER_MINUTE, MINUTES_PER_HOUR, HOURS_PER_DAY } from '../constants'

// Formats an ISO timestamp as a locale-aware relative time string
// (e.g. "2 hours ago"), matching the previous inline `timeAgo` helper.
export function useTimeAgo(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / MS_PER_MINUTE)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (minutes < 1) return rtf.format(0, 'minute')
  if (minutes < MINUTES_PER_HOUR) return rtf.format(-minutes, 'minute')

  const hours = Math.round(minutes / MINUTES_PER_HOUR)
  if (hours < HOURS_PER_DAY) return rtf.format(-hours, 'hour')

  const days = Math.round(hours / HOURS_PER_DAY)
  return rtf.format(-days, 'day')
}
