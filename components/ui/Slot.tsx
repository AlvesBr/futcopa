import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type SlotState = 'empty' | 'active' | 'filled' | 'correct' | 'incorrect'

interface SlotProps extends HTMLAttributes<HTMLDivElement> {
  state?: SlotState
  rank?: number
  children?: React.ReactNode
}

const stateClasses: Record<SlotState, string> = {
  empty:     'bg-[var(--slot)] border-dashed border-[var(--slot-border)]',
  active:    'bg-[var(--grass-50)] border-solid border-primary shadow-glow-grass dark:bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))]',
  filled:    'bg-[var(--gold-100)] border-solid border-gold-400 text-[var(--fg-on-gold)] shadow-1',
  correct:   'bg-[var(--success-bg)] border-solid border-[var(--success)]',
  incorrect: 'bg-[var(--error-bg)]  border-solid border-[var(--error)]',
}

export function Slot({ state = 'empty', rank, className, children, ...props }: SlotProps) {
  return (
    <div
      role="button"
      aria-label={rank ? `Slot nível ${rank}` : 'Slot da pirâmide'}
      className={cn(
        'relative w-[84px] h-[56px] rounded-sm flex items-center justify-center gap-[6px]',
        'cursor-pointer select-none border-2',
        'transition-[transform,border-color,box-shadow,background] duration-[var(--dur-2)] ease-bounce',
        stateClasses[state],
        className,
      )}
      {...props}
    >
      {rank != null && (
        <span className="absolute -top-2 -left-2 w-5 h-5 rounded-pill bg-ink-900 dark:bg-fg text-white dark:text-bg fc-caption font-bold grid place-items-center">
          {rank}
        </span>
      )}
      {state === 'empty' && !children && (
        <span aria-hidden className="text-[22px] text-fg-3 font-normal">+</span>
      )}
      {children}
    </div>
  )
}
