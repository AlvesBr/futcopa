import { cn } from '@/lib/cn'

interface RerollControlsProps {
  rerollsLeft:     number
  onRerollSquad:   () => void
  onRerollEdition: () => void
  disabled?:       boolean
}

export function RerollControls({
  rerollsLeft,
  onRerollSquad,
  onRerollEdition,
  disabled = false,
}: RerollControlsProps) {
  const canReroll = rerollsLeft > 0 && !disabled

  return (
    <div className="flex flex-col gap-1">
      <p className="fc-caption text-fg-3">
        Não curtiu? Re-sorteie · <span className="font-bold text-fg">{rerollsLeft}</span> restantes
      </p>
      <div className="flex gap-2">
        <button
          onClick={onRerollSquad}
          disabled={!canReroll}
          className={cn(
            'fc-caption px-3 py-1.5 rounded-sm border transition-colors',
            canReroll
              ? 'border-[var(--slot-border)] text-fg hover:border-primary hover:text-primary'
              : 'border-transparent text-fg-3 cursor-not-allowed opacity-40'
          )}
        >
          ↺ Outra Seleção
        </button>
        <button
          onClick={onRerollEdition}
          disabled={!canReroll}
          className={cn(
            'fc-caption px-3 py-1.5 rounded-sm border transition-colors',
            canReroll
              ? 'border-[var(--slot-border)] text-fg hover:border-primary hover:text-primary'
              : 'border-transparent text-fg-3 cursor-not-allowed opacity-40'
          )}
        >
          ↺ Outra Copa
        </button>
      </div>
    </div>
  )
}
