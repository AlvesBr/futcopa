import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-surface rounded-card border border-[var(--border)]',
        elevated ? 'shadow-3' : 'shadow-1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
)
Card.displayName = 'Card'
