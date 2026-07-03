import { useEffect, useRef, useState } from 'react'

/**
 * Accessible custom dropdown used across the post forms/filters. Unlike a native
 * <select>, it lets each option carry a leading `icon` node (e.g. a country flag)
 * and gives full control over the hover styling (purple, matching the app accent)
 * instead of the browser's default blue option highlight. Drives a plain
 * value/onChange contract so it can be wired to react-hook-form via setValue.
 *
 * Options: `{ id, label, icon? }`.
 */
export default function SelectMenu({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  triggerClass = '',
  className = '',
  id,
  ...rest
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = options.find((o) => o.id === value)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (optionId) => {
    onChange?.(optionId)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        {...rest}
        className={`flex items-center justify-between gap-2 text-left ${triggerClass}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              {selected.icon}
              <span className="truncate text-ink">{selected.label}</span>
            </>
          ) : (
            <span className="truncate text-muted">{placeholder}</span>
          )}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={placeholder}
          className="absolute z-30 mt-1 max-h-64 min-w-full w-max max-w-[16rem] overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          {options.map((o) => {
            const isSelected = o.id === value
            return (
              <li key={o.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => pick(o.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent-soft ${
                    isSelected ? 'bg-accent-soft font-medium text-accent' : 'text-ink'
                  }`}
                >
                  {o.icon}
                  <span className="truncate">{o.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
