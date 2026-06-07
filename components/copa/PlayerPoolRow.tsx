import { cn } from '@/lib/cn'
import type { CupPlayer } from '@/lib/types'

interface PlayerPoolRowProps {
  player:   CupPlayer
  selected: boolean
  mode:     'classico' | 'almanaque'
  onClick:  () => void
}

export function PlayerPoolRow({ player, selected, mode, onClick }: PlayerPoolRowProps) {
  const showRating = mode === 'classico'

  return (
    <button
      onClick={onClick}
      className={cn(
        'pool-row w-full flex items-center gap-3 px-3 py-2 rounded-sm border-2 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/10'
          : 'border-transparent hover:border-[var(--slot-border)] bg-[var(--surface)]'
      )}
    >
      {/* Número da camisa */}
      <span className="fc-caption text-fg-3 w-5 text-right shrink-0">
        {player.squad_number ?? '—'}
      </span>

      {/* Nome */}
      <span className="fc-body text-fg font-medium flex-1 truncate">
        {player.name}
      </span>

      {/* Posições */}
      <span className="fc-caption text-fg-3 shrink-0">
        {player.positions.join('/')}
      </span>

      {/* Rating */}
      <span className={cn(
        'fc-caption font-bold w-7 text-right shrink-0',
        showRating ? 'text-fg' : 'text-fg-3'
      )}>
        {showRating ? player.rating : '?'}
      </span>
    </button>
  )
}
