'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { BadgeVariant } from './Badge'

interface ToastProps {
  message: string
  variant?: Exclude<BadgeVariant, 'default'>
  duration?: number
  onDismiss?: () => void
}

const variantIcon: Record<string, string> = {
  success: '✓',
  error:   '✕',
  warning: '!',
  info:    'i',
}

export function Toast({ message, variant = 'info', duration = 2800, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, duration)
    return () => clearTimeout(t)
  }, [duration, onDismiss])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-[92px] left-0 right-0 z-[60] flex justify-center pointer-events-none',
      )}
    >
      <div
        className={cn(
          'inline-flex items-center gap-[9px] px-[17px] py-[11px] rounded-pill shadow-3',
          'bg-ink-900 text-white fc-body-sm font-bold',
          'animate-[fc-toast-in_var(--dur-3)_var(--ease-bounce)]',
        )}
      >
        <span aria-hidden className="text-[13px]">{variantIcon[variant]}</span>
        {message}
      </div>
    </div>
  )
}
