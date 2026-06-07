'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/cn'
import { SLOTS_PER_LEVEL, RANK_TO_LEVEL } from '@/lib/types'
import type { Level, Rank, SlotEntry, GameMode } from '@/lib/types'

interface PyramidShellProps {
  slots: Record<number, SlotEntry | null>
  mode: GameMode
  helpActive: boolean
  activePlayerLevel?: Level
  isDragging?: boolean
  selectedPlayerId?: string | null
  onSlotClick?: (rank: Rank) => void
}

const LEVELS: Level[] = [1, 2, 3, 4]

function levelStartRank(level: Level): number {
  if (level === 1) return 1
  if (level === 2) return 2
  if (level === 3) return 4
  return 7
}

function DroppableSlot({
  rank,
  entry,
  helpActive,
  showLevelHint,
  showSelectHint,
  onSlotClick,
}: {
  rank: number
  entry: SlotEntry | null
  helpActive: boolean
  showLevelHint: boolean
  showSelectHint: boolean
  onSlotClick?: (rank: Rank) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${rank}` })

  type VisualState = 'empty' | 'active' | 'filled' | 'correct' | 'incorrect'

  let state: VisualState
  if (!entry) {
    state = isOver ? 'active' : 'empty'
  } else if (entry.correct) {
    state = 'correct'
  } else {
    state = 'incorrect'
  }

  const stateClasses: Record<VisualState, string> = {
    empty:     'bg-[var(--slot)] border-dashed border-[var(--slot-border)]',
    active:    'bg-[var(--grass-50)] border-solid border-primary shadow-glow-grass dark:bg-[color-mix(in_srgb,var(--primary)_14%,var(--surface))]',
    filled:    'bg-[var(--gold-100)] border-solid border-gold-400 text-[var(--fg-on-gold)] shadow-1',
    correct:   'bg-[var(--success-bg)] border-solid border-[var(--success)]',
    incorrect: 'bg-[var(--error-bg)] border-solid border-[var(--error)]',
  }

  return (
    <div
      ref={setNodeRef}
      aria-label={`Slot ${rank}`}
      onClick={() => !entry && onSlotClick?.(rank as Rank)}
      className={cn(
        'relative w-[84px] h-[64px] sm:w-[100px] sm:h-[72px] rounded-sm flex items-center justify-center',
        'select-none border-2',
        'transition-[border-color,box-shadow,background] duration-[var(--dur-2)]',
        stateClasses[state],
        !entry && onSlotClick && 'cursor-pointer',
        /* help animation */
        helpActive && entry && entry.correct && 'animate-pulse shadow-glow-grass',
        helpActive && entry && !entry.correct && 'animate-pulse',
        /* easy mode level hint ring */
        showLevelHint && !entry && 'ring-2 ring-primary ring-offset-1',
        /* tap-to-place selection hint */
        showSelectHint && !entry && 'ring-2 ring-primary ring-offset-1 animate-pulse',
      )}
    >
      <span className="absolute -top-2 -left-2 w-6 h-6 rounded-pill bg-ink-900 dark:bg-fg text-white dark:text-bg font-bold grid place-items-center text-[11px]">
        {rank}
      </span>
      {!entry && (
        <span aria-hidden className="text-[20px] text-fg-3 leading-none">+</span>
      )}
      {entry && (
        <span className="fc-caption text-current font-semibold text-center px-1 leading-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {entry.playerName.split(' ').at(-1)}
        </span>
      )}
    </div>
  )
}

export function PyramidShell({
  slots,
  mode,
  helpActive,
  activePlayerLevel,
  isDragging = false,
  selectedPlayerId,
  onSlotClick,
}: PyramidShellProps) {
  return (
    <section aria-label="Pirâmide" className="flex flex-col items-center gap-3 py-4">
      {LEVELS.map(level => (
        <div key={level} className={cn('flex items-center', level === 4 ? 'gap-1.5' : 'gap-2')}>
          {Array.from({ length: SLOTS_PER_LEVEL[level] }, (_, i) => {
            const rank = levelStartRank(level) + i
            const showLevelHint =
              mode === 'easy' && isDragging && activePlayerLevel === level
            const showSelectHint = !!selectedPlayerId && !slots[rank]
            return (
              <DroppableSlot
                key={rank}
                rank={rank}
                entry={slots[rank] ?? null}
                helpActive={helpActive}
                showLevelHint={showLevelHint}
                showSelectHint={showSelectHint}
                onSlotClick={onSlotClick}
              />
            )
          })}
        </div>
      ))}
    </section>
  )
}
