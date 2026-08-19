interface AvatarProps {
  url?: string | null
  name?: string | null
  size?: string
  initialsClassName?: string
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
