/**
 * Real country flag from flagcdn.com, keyed by ISO 3166-1 alpha-2 code.
 * Decorative by default — pair it with the country name in adjacent text.
 * Size is controlled via `className` (default matches the inline meta flag).
 */
export default function CountryFlag({ code, className = 'h-3 w-[18px]' }) {
  if (!code) return null
  const cc = code.toLowerCase()
  return (
    <img
      src={`https://flagcdn.com/w40/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 2x`}
      alt=""
      loading="lazy"
      className={`inline-block shrink-0 rounded-sm object-cover align-[-2px] ${className}`}
    />
  )
}
