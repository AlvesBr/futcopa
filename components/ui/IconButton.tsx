import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, className, children, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      className={cn(
        'w-[42px] h-[42px] flex-none grid place-items-center rounded-pill border-none cursor-pointer',
        'bg-surface-2 text-fg-2',
        'transition-[background,color,transform] duration-[var(--dur-1)]',
        'hover:bg-surface-3 hover:text-fg active:scale-[.94]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)
IconButton.displayName = 'IconButton'
