'use client'

import { useDraggable } from '@dnd-kit/core'
import { Avatar } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { PuzzlePlayer, GameMode } from '@/lib/types'

interface PlayerQueueProps {
  queue: PuzzlePlayer[]
  queueIndex: number
  mode: GameMode
  selectedPlayerId?: string | null
  onSelectPlayer?: (playerId: string) => void
}

function ActiveCard({
  player,
  mode,
  isSelected,
  onSelect,
}: {
  player: PuzzlePlayer
  mode: GameMode
  isSelected: boolean
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: player.player_id,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, touchAction: 'none' }}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 bg-surface-2 border-2 rounded-md px-4 py-3 select-none w-full',
        'transition-[opacity,border-color,box-shadow] duration-[var(--dur-1)]',
        'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-30',
        isSelected && !isDragging
          ? 'border-primary ring-2 ring-primary ring-offset-2 shadow-glow-grass'
          : 'border-primary shadow-1',
      )}
    >
      <Avatar src={player.photo_url} name={player.name} size={40} />
      <div className="flex flex-col min-w-0">
        <span className="fc-body text-fg font-semibold whitespace-nowrap">{player.name}</span>
        {mode === 'easy' && (
          <span className="fc-caption text-primary font-semibold">
            Nível {player.correct_level}
          </span>
        )}
      </div>
      {isSelected && (
        <span className="ml-auto fc-caption text-primary font-bold whitespace-nowrap">
          Toque num slot ↑
        </span>
      )}
    </div>
  )
}

export function PlayerQueue({ queue, queueIndex, mode, selectedPlayerId, onSelectPlayer }: PlayerQueueProps) {
  if (queueIndex >= queue.length) return null

  const activePlayer = queue[queueIndex]!
  const upcomingPlayers = queue.slice(queueIndex + 1, queueIndex + 6)
  const isSelected = selectedPlayerId === activePlayer.player_id

  return (
    <section aria-label="Fila de jogadores" className="w-full px-4 pb-6 flex flex-col items-center gap-2">
      <p className="fc-caption text-fg-2 text-center">
        {queueIndex} / {queue.length} posicionados
      </p>
      <p className="fc-caption text-fg-3 text-center">
        {isSelected ? 'Toque em um slot vazio para posicionar' : 'Arraste ou toque para posicionar'}
      </p>

      <ActiveCard
        player={activePlayer}
        mode={mode}
        isSelected={isSelected}
        onSelect={() => onSelectPlayer?.(activePlayer.player_id)}
      />

      {upcomingPlayers.length > 0 && (
        <div className="w-full mt-1 flex flex-col items-center gap-1.5">
          <p className="fc-caption text-fg-3">Próximos na fila:</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {upcomingPlayers.map(p => (
              <span
                key={p.player_id}
                className="flex items-center gap-1.5 bg-surface-2 border border-[var(--border)] rounded-pill pl-1 pr-2.5 py-0.5 opacity-60"
              >
                <Avatar src={p.photo_url} name={p.name} size={20} />
                <span className="fc-caption text-fg-2 whitespace-nowrap">{p.name}</span>
              </span>
            ))}
            {queue.length - queueIndex - 1 > 5 && (
              <span className="fc-caption text-fg-3 self-center">
                +{queue.length - queueIndex - 6}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
