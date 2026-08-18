interface CountryFlagProps {
  code?: string | null
  className?: string
}


export default function CountryFlag({ code, className = 'h-3 w-[18px]' }: CountryFlagProps) {
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
