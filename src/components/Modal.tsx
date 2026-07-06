import type { ReactNode, MouseEvent } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey'

interface ModalProps {
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Modal({ onClose, children, className }: ModalProps) {
  useEscapeKey(onClose)

  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={className} onClick={stopPropagation}>
        {children}
      </div>
    </div>
  )
}
