'use client'

import { cn } from '@/lib/cn'
import { PlayerPoolRow } from './PlayerPoolRow'
import { RerollControls } from './RerollControls'
import type { CupPlayer, CupSquad, CupEdition, DraftMode } from '@/lib/types'

interface DraftRollPanelProps {
  // Estado do roll atual
  currentSquad:   CupSquad   | null
  currentEdition: CupEdition | null
  players:        CupPlayer[]
  selectedPlayer: CupPlayer  | null
  rerollsLeft:    number
  mode:           DraftMode
  isRolling:      boolean
  picksCount:     number   // quantos picks já feitos

  // Callbacks
  onRoll:          () => void
  onSelectPlayer:  (player: CupPlayer) => void
  onRerollSquad:   () => void
  onRerollEdition: () => void
}

export function DraftRollPanel({
  currentSquad,
  currentEdition,
  players,
  selectedPlayer,
  rerollsLeft,
  mode,
  isRolling,
  picksCount,
  onRoll,
  onSelectPlayer,
  onRerollSquad,
  onRerollEdition,
}: DraftRollPanelProps) {
  const hasRoll = currentSquad !== null && currentEdition !== null

  return (
    <section className="col-roll flex flex-col gap-4 min-w-0">

      {/* Roll panel */}
      {!hasRoll ? (
        /* Estado idle — aguardando roll */
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="fc-body text-fg-2 text-center">
            {picksCount === 0
              ? 'Role para sortear uma seleção e uma Copa do Mundo'
              : `Pick ${picksCount + 1}/11 — role para continuar`}
          </p>
          <button
            onClick={onRoll}
            disabled={isRolling}
            className={cn(
              'bg-primary text-white font-bold px-6 py-3 rounded-sm fc-subtitle transition-opacity',
              isRolling && 'opacity-60 cursor-not-allowed'
            )}
          >
            {isRolling ? 'Sorteando…' : 'Rolar 🎲'}
          </button>
        </div>
      ) : (
        /* Estado com roll — exibir seleção + pool */
        <div className="flex flex-col gap-3">

          {/* Cabeçalho do roll */}
          <div className="flex flex-col gap-1">
            <p className="fc-caption text-fg-3 uppercase tracking-wide">Saiu</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentSquad.flag_emoji}</span>
              <div>
                <p className="fc-subtitle text-fg font-bold">{currentSquad.country_name}</p>
                <p className="fc-caption text-fg-3">Copa {currentEdition.year}</p>
              </div>
            </div>

            {/* Re-sorteios */}
            <RerollControls
              rerollsLeft={rerollsLeft}
              onRerollSquad={onRerollSquad}
              onRerollEdition={onRerollEdition}
            />
          </div>

          {/* Pool de jogadores */}
          <div className="flex flex-col gap-0.5">
            <p className="fc-caption text-fg-3 mb-1">
              Escolha um jogador
              {selectedPlayer && (
                <span className="text-primary font-bold"> — {selectedPlayer.name} selecionado</span>
              )}
            </p>
            <div className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto pr-1">
              {players.map(player => (
                <PlayerPoolRow
                  key={player.id}
                  player={player}
                  selected={selectedPlayer?.id === player.id}
                  mode={mode}
                  onClick={() => onSelectPlayer(player)}
                />
              ))}
            </div>
          </div>

          {/* Mensagem quando jogador selecionado não tem slot */}
          {selectedPlayer && (
            <p className="fc-caption text-fg-3 italic">
              Clique num slot compatível no campo para posicionar{' '}
              <span className="font-bold text-fg">{selectedPlayer.name}</span>
              {' '}({selectedPlayer.positions.join('/')})
            </p>
          )}

        </div>
      )}

    </section>
  )
}
