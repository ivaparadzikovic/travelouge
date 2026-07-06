interface AvatarProps {
  url?: string | null
  name?: string | null
  /** Tailwind size classes, e.g. "w-7 h-7". Defaults to "w-8 h-8". */
  size?: string
  /** Font-size class for the initials fallback. Defaults to "text-xs". */
  initialsClassName?: string
  /** Extra classes appended to both the image and initials variants. */
  className?: string
}

export function Avatar({
  url,
  name,
  size = 'w-8 h-8',
  initialsClassName = 'text-xs',
  className = '',
}: AvatarProps) {
  const initial = name?.[0]?.toUpperCase() || '?'
  const boxClass = [size, className].filter(Boolean).join(' ')

  return url ? (
    <img src={url} alt="" className={`${boxClass} rounded-full object-cover`} />
  ) : (
    <span
      className={`${boxClass} rounded-full bg-linear-to-br from-accent to-accent-2 font-display font-semibold text-white flex items-center justify-center ${initialsClassName}`}
    >
      {initial}
    </span>
  )
}
