
interface TimeUnitLabels {
  m: string
  h: string
  d: string
  w: string
  now: string
}

const UNITS: Record<string, TimeUnitLabels> = {
  en: { m: 'm', h: 'h', d: 'd', w: 'w', now: 'now' },
  hr: { m: 'min', h: 'h', d: 'd', w: 'tj', now: 'sad' },
}

export function compactTimeAgo(date: string | Date | null | undefined, locale = 'en'): string {
  if (!date) return ''
  const u = UNITS[locale] ?? UNITS.en
  const then = date instanceof Date ? date : new Date(date)
  const secs = Math.max(0, (Date.now() - then.getTime()) / 1000)

  if (secs < 45) return u.now
  const mins = secs / 60
  if (mins < 60) return `${Math.round(mins)}${u.m}`
  const hours = mins / 60
  if (hours < 24) return `${Math.round(hours)}${u.h}`
  const days = hours / 24
  if (days < 7) return `${Math.round(days)}${u.d}`
  const weeks = days / 7
  if (weeks < 5) return `${Math.round(weeks)}${u.w}`

  return then.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}
