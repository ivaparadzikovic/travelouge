import { Children, cloneElement, useId } from 'react'
import type { AriaAttributes, ReactElement, ReactNode } from 'react'

interface FieldChildProps {
  id?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
  'aria-describedby'?: string
}

interface FieldProps {
  label?: ReactNode
  error?: ReactNode
  children: ReactElement<FieldChildProps>
  className?: string
}

export default function Field({ label, error, children, className = '' }: FieldProps) {
  const id = useId()
  const errorId = error ? `${id}-error` : undefined
  const child = Children.only(children)
  const enhanced = cloneElement(child, {
    id: child.props.id ?? id,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': errorId ?? child.props['aria-describedby'],
  })
  const labelFor = enhanced.props.id
  return (
    <div className={className}>
      {label && (
        <label htmlFor={labelFor} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {enhanced}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-down">
          {error}
        </p>
      )}
    </div>
  )
}
