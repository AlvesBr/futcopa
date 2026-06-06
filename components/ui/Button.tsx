import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-primary text-[var(--on-primary)] shadow-glow-grass hover:brightness-105 disabled:bg-surface-3 disabled:text-fg-3 disabled:shadow-none disabled:cursor-not-allowed',
  gold:      'bg-gold-400 text-[var(--fg-on-gold)] shadow-glow-gold hover:brightness-105',
  secondary: 'bg-surface text-fg border border-[var(--border-strong)] hover:bg-surface-2',
  ghost:     'bg-transparent text-primary hover:bg-surface-2',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm min-h-[38px] gap-2',
  md: 'px-[22px] py-[14px] min-h-[50px] gap-[9px]',
  lg: 'px-7 py-4 min-h-[56px] gap-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', block = false, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-bold rounded-pill cursor-pointer border-none whitespace-nowrap',
        'transition-[transform,background,box-shadow,filter] duration-[var(--dur-1)]',
        'active:scale-[.97] disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        block && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
