'use client'

import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-[rgba(7,18,13,.55)] backdrop-blur-sm animate-[fc-fade_var(--dur-2)_var(--ease-out)]"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={cn(
          'w-full max-w-[440px] max-h-[92vh] overflow-y-auto',
          'bg-[var(--bg-elevated)] rounded-xl rounded-b-none sm:rounded-xl',
          'px-5 pt-[22px] pb-[calc(22px+env(safe-area-inset-bottom))]',
          'shadow-4 animate-[fc-rise_var(--dur-3)_var(--ease-out)]',
          className,
        )}
      >
        <div className="flex items-start justify-between mb-3">
          {title && <h2 id="modal-title" className="fc-h2 m-0">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="ml-auto w-8 h-8 grid place-items-center rounded-pill bg-surface-2 text-fg-2 hover:bg-surface-3 border-none cursor-pointer"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
