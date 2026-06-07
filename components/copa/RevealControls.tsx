import { cn } from '@/lib/cn'

type RevealMode = 'passo-a-passo' | 'automatico'

interface RevealControlsProps {
  mode:         RevealMode
  onModeChange: (m: RevealMode) => void
  onReveal:     () => void
  canReveal:    boolean
  allRevealed:  boolean
}

export function RevealControls({
  mode,
  onModeChange,
  onReveal,
  canReveal,
  allRevealed,
}: RevealControlsProps) {
  return (
    <div className="flex flex-col gap-3">

      {/* Toggle de modo */}
      <div className="flex gap-1 p-1 rounded-sm bg-[var(--surface-2,var(--surface))] border border-[var(--slot-border)] w-fit">
        {(['passo-a-passo', 'automatico'] as RevealMode[]).map(m => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={cn(
              'fc-caption px-3 py-1 rounded-sm transition-colors',
              mode === m
                ? 'bg-primary text-white font-bold'
                : 'text-fg-3 hover:text-fg'
            )}
          >
            {m === 'passo-a-passo' ? 'Jogo a jogo' : 'Automático'}
          </button>
        ))}
      </div>

      {/* Botão revelar */}
      {!allRevealed && canReveal && (
        <button
          onClick={onReveal}
          className="bg-primary text-white font-bold px-6 py-2 rounded-sm fc-body hover:opacity-90 transition-opacity w-fit"
        >
          {mode === 'passo-a-passo' ? 'Revelar próximo →' : 'Revelar tudo →'}
        </button>
      )}

    </div>
  )
}
