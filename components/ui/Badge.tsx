import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  icon?: React.ReactNode
}

/* Shape map — colorblind-safe: each semantic state has a dedicated shape */
const shapeSymbol: Record<BadgeVariant, string | null> = {
  success: '●',   /* circle */
  error:   '◆',   /* diamond */
  warning: '▲',   /* triangle */
  info:    '■',   /* square */
  default: null,
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[var(--success-bg)] text-[var(--success-ink)] border-[var(--success)]',
  error:   'bg-[var(--error-bg)]   text-[var(--error-ink)]   border-[var(--error)]',
  warning: 'bg-[var(--warning-bg)] text-[var(--warning-ink)] border-[var(--warning)]',
  info:    'bg-[var(--info-bg)]    text-[var(--info-ink)]    border-[var(--info)]',
  default: 'bg-surface-2 text-fg-2 border-[var(--border)]',
}

export function Badge({ variant = 'default', icon, className, children, ...props }: BadgeProps) {
  const shape = shapeSymbol[variant]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-[3px] rounded-pill border fc-caption font-bold',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon ?? (shape && <span aria-hidden className="text-[10px]">{shape}</span>)}
      {children}
    </span>
  )
}
