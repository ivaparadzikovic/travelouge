import type { ReactNode, MouseEvent } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey'

interface ModalProps {
  open?: boolean
  onClose: () => void
  children: ReactNode
  labelledBy?: string
  className?: string
}

export function Modal({ open = true, onClose, children, labelledBy, className }: ModalProps) {
  useEscapeKey(onClose)

  if (!open) return null

  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div className={className} onClick={stopPropagation}>
        {children}
      </div>
    </div>
  )
}
