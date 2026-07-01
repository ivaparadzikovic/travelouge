import { Children, cloneElement, useId } from 'react'

export default function Field({ label, error, children, className = '' }) {
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
        <label htmlFor={labelFor} className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}
      {enhanced}
      {error && (
        <p id={errorId} className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
