'use client'

import { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import type { Puzzle, PuzzlePlayer, Rank, Level, SlotEntry, GameMode } from '@/lib/types'
import { RANK_TO_LEVEL } from '@/lib/types'
import { createBrowserClient } from '@/lib/supabase'
import { TopBar } from '@/components/TopBar'
import { CategoryBadge } from '@/components/CategoryBadge'
import { PyramidShell } from '@/components/PyramidShell'
import { PlayerQueue } from '@/components/PlayerQueue'
import { ModeSelector } from '@/components/ModeSelector'
import { ResultModal } from '@/components/ResultModal'
import { Modal } from '@/components/ui'

type GamePhase = 'mode-select' | 'playing' | 'review' | 'done'

interface SavedResult {
  score: number
  usedHelp: boolean
  completedAt: string
  timeSpent: number
  slots: Record<string, SlotEntry>
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function buildInitialSlots(): Record<number, SlotEntry | null> {
  const s: Record<number, SlotEntry | null> = {}
  for (let i = 1; i <= 10; i++) s[i] = null
  return s
}

function saveResult(date: string, result: SavedResult) {
  try { localStorage.setItem(`puzzle_result_${date}`, JSON.stringify(result)) } catch {}
}

function loadResult(date: string): SavedResult | null {
  try {
    const raw = localStorage.getItem(`puzzle_result_${date}`)
    return raw ? (JSON.parse(raw) as SavedResult) : null
  } catch { return null }
}

interface PlayScreenProps {
  puzzle: Puzzle
}

export function PlayScreen({ puzzle }: PlayScreenProps) {
  const [phase, setPhase] = useState<GamePhase>('mode-select')
  const [mode, setMode] = useState<GameMode>('normal')
  const [queue, setQueue] = useState<PuzzlePlayer[]>([])
  const [queueIndex, setQueueIndex] = useState(0)
  const [slots, setSlots] = useState<Record<number, SlotEntry | null>>(buildInitialSlots)
  const [revealed, setRevealed] = useState(false)
  const [usedHelp, setUsedHelp] = useState(false)
  const [helpActive, setHelpActive] = useState(false)
  const [showHelpConfirm, setShowHelpConfirm] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [selectedSlotRank, setSelectedSlotRank] = useState<Rank | null>(null)
  const helpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef<number>(0)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )

  /* Replay detection on mount */
  useEffect(() => {
    const saved = loadResult(puzzle.date)
    if (!saved) return
    const restoredSlots = buildInitialSlots()
    for (const [rankStr, entry] of Object.entries(saved.slots)) {
      restoredSlots[Number(rankStr)] = entry
    }
    setSlots(restoredSlots)
    setUsedHelp(saved.usedHelp)
    setRevealed(true)
    setPhase('done')
    setShowResult(true)
  }, [puzzle.date])

  /* Cleanup timers on unmount */
  useEffect(() => () => {
    if (helpTimerRef.current) clearTimeout(helpTimerRef.current)
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current)
  }, [])

  const activePlayer = queue[queueIndex] ?? null
  const score = Object.values(slots).filter(s => s?.correct === true).length

  function handleModeSelect(selectedMode: GameMode) {
    startedAtRef.current = Date.now()
    setMode(selectedMode)
    setQueue(shuffleArray(puzzle.players))
    setPhase('playing')
  }

  /* Recalcula a correção de uma entrada para o rank onde ela está */
  function withCorrectness(entry: SlotEntry, rank: Rank): SlotEntry {
    const player = puzzle.players.find(p => p.player_id === entry.playerId)
    const correct = player ? player.correct_level === RANK_TO_LEVEL[rank] : false
    return { ...entry, correct }
  }

  /* Shared placement logic used by both drag-end and tap-to-place */
  function placePlayer(playerId: string, targetRank: Rank, currentSlots: Record<number, SlotEntry | null>, currentIndex: number) {
    if (currentSlots[targetRank] !== null) return

    const player = queue.find(p => p.player_id === playerId)
    if (!player) return

    const chosenLevel: Level = RANK_TO_LEVEL[targetRank]
    const correct = player.correct_level === chosenLevel

    const newSlots = {
      ...currentSlots,
      [targetRank]: { playerId: player.player_id, playerName: player.name, correct },
    }
    const nextIndex = currentIndex + 1

    setSlots(newSlots)
    setQueueIndex(nextIndex)

    if (nextIndex >= puzzle.players.length) {
      /* Todos posicionados — fase de revisão: ajustar posições antes de confirmar */
      setPhase('review')
    }
  }

  /* Troca o conteúdo de dois slots (review). Mover para slot vazio também funciona. */
  function swapSlots(a: Rank, b: Rank) {
    if (a === b) return
    setSlots(prev => {
      const entryA = prev[a] ?? null
      const entryB = prev[b] ?? null
      return {
        ...prev,
        [a]: entryB ? withCorrectness(entryB, a) : null,
        [b]: entryA ? withCorrectness(entryA, b) : null,
      }
    })
  }

  /* Confirmação final — revela o gabarito e persiste o resultado */
  function handleConfirm() {
    const finalScore = Object.values(slots).filter(s => s?.correct === true).length
    const timeSpent = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current) / 1000)
      : 0
    const slotsToSave = Object.fromEntries(
      Object.entries(slots)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, v as SlotEntry])
    )
    saveResult(puzzle.date, {
      score: finalScore,
      usedHelp,
      completedAt: new Date().toISOString(),
      timeSpent,
      slots: slotsToSave,
    })
    try {
      const sb = createBrowserClient()
      sb.from('user_results').insert({
        puzzle_date: puzzle.date,
        score: finalScore,
        used_help: usedHelp,
        time_spent: timeSpent,
      }).then(() => {})
    } catch {}
    setSelectedSlotRank(null)
    setRevealed(true)
    setPhase('done')
    resultTimerRef.current = setTimeout(() => setShowResult(true), 800)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string)
    setSelectedPlayerId(null)
    setSelectedSlotRank(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null)
    const { active, over } = event
    if (!over) return
    const overId = over.id as string
    if (!overId.startsWith('slot-')) return
    const targetRank = parseInt(overId.replace('slot-', ''), 10) as Rank
    const activeId = active.id as string

    /* Review: arrastou um card já posicionado → troca de posições */
    if (activeId.startsWith('placed-')) {
      const sourceRank = parseInt(activeId.replace('placed-', ''), 10) as Rank
      swapSlots(sourceRank, targetRank)
      return
    }

    placePlayer(activeId, targetRank, slots, queueIndex)
  }

  /* Tap-to-place: toggle selection on active card */
  function handleSelectPlayer(playerId: string) {
    setSelectedPlayerId(prev => prev === playerId ? null : playerId)
  }

  /* Tap em slot: posicionar (playing) ou trocar de lugar (review) */
  function handleSlotClick(rank: Rank) {
    if (phase === 'review') {
      if (selectedSlotRank === null) {
        if (slots[rank]) setSelectedSlotRank(rank)
      } else {
        swapSlots(selectedSlotRank, rank)
        setSelectedSlotRank(null)
      }
      return
    }
    if (!selectedPlayerId || phase !== 'playing') return
    placePlayer(selectedPlayerId, rank, slots, queueIndex)
    setSelectedPlayerId(null)
  }

  function handleHelp() {
    setShowHelpConfirm(true)
  }

  function confirmHelp() {
    setShowHelpConfirm(false)
    setUsedHelp(true)
    setHelpActive(true)
    helpTimerRef.current = setTimeout(() => setHelpActive(false), 2000)
  }

  const isInteractive = phase === 'playing' || phase === 'review'

  /* Nome exibido no DragOverlay (card da fila ou card já posicionado) */
  function dragOverlayName(id: string): string | null {
    if (id.startsWith('placed-')) {
      const rank = parseInt(id.replace('placed-', ''), 10)
      return slots[rank]?.playerName ?? null
    }
    return queue.find(q => q.player_id === id)?.name ?? null
  }

  return (
    <div className="fc-stage">
      <div className="fc-phone">
        <TopBar
          onHelp={isInteractive ? handleHelp : undefined}
          helpUsed={usedHelp}
          helpActive={helpActive}
          onShowResult={phase === 'done' ? () => setShowResult(true) : undefined}
        />

        {/* Category badge — shown in playing + review + done */}
        {phase !== 'mode-select' && (
          <CategoryBadge category={puzzle.category} description={puzzle.description} />
        )}

        {phase === 'mode-select' && (
          <ModeSelector onSelect={handleModeSelect} />
        )}

        {phase !== 'mode-select' && (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <main className="flex-1 flex flex-col items-center gap-2 overflow-y-auto pb-4">
              <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-2">
                <PyramidShell
                  slots={slots}
                  mode={mode}
                  helpActive={helpActive}
                  revealed={revealed}
                  swappable={phase === 'review'}
                  selectedSlotRank={selectedSlotRank}
                  activePlayerLevel={mode === 'easy' ? activePlayer?.correct_level : undefined}
                  isDragging={activeDragId !== null}
                  selectedPlayerId={selectedPlayerId}
                  onSlotClick={handleSlotClick}
                />
                {phase === 'playing' && (
                  <PlayerQueue
                    queue={queue}
                    queueIndex={queueIndex}
                    mode={mode}
                    selectedPlayerId={selectedPlayerId}
                    onSelectPlayer={handleSelectPlayer}
                  />
                )}
                {phase === 'review' && (
                  <section
                    aria-label="Revisão"
                    className="w-full px-4 pb-6 flex flex-col items-center gap-3"
                  >
                    <p className="fc-caption text-fg-2 text-center">
                      Todos posicionados! Arraste um card sobre outro — ou toque em dois —
                      para trocar de lugar.
                    </p>
                    <p className="fc-caption text-fg-3 text-center">
                      {selectedSlotRank !== null
                        ? 'Agora toque no slot de destino'
                        : 'Quando estiver satisfeito, confirme sua resposta'}
                    </p>
                    <button
                      onClick={handleConfirm}
                      className="fc-btn fc-btn--primary"
                      style={{ width: '100%', maxWidth: 320 }}
                    >
                      Confirmar resposta
                    </button>
                  </section>
                )}
              </div>
            </main>

            {isInteractive && (
              <DragOverlay dropAnimation={null}>
                {activeDragId && (() => {
                  const name = dragOverlayName(activeDragId)
                  return name ? (
                    <div className="flex items-center gap-2 bg-surface-2 border-2 border-primary rounded-sm px-3 py-2 shadow-2 cursor-grabbing rotate-2 scale-105">
                      <span className="fc-label" style={{ color: 'var(--fg)', fontWeight: 600 }}>{name}</span>
                    </div>
                  ) : null
                })()}
              </DragOverlay>
            )}
          </DndContext>
        )}

        {/* Dica — confirmação */}
        <Modal open={showHelpConfirm} onClose={() => setShowHelpConfirm(false)} title="Usar dica?">
          <p className="fc-body" style={{ color: 'var(--fg-2)', marginBottom: 20 }}>
            Esta é sua única dica da partida. Os slots corretos serão destacados por 2 segundos.
          </p>
          <div className="flex gap-3">
            <button onClick={confirmHelp} className="fc-btn fc-btn--primary" style={{ flex: 1 }}>
              Usar dica
            </button>
            <button
              onClick={() => setShowHelpConfirm(false)}
              className="fc-btn fc-btn--secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
          </div>
        </Modal>

        <ResultModal
          open={showResult}
          onClose={() => setShowResult(false)}
          score={score}
          slots={slots}
          usedHelp={usedHelp}
          puzzleDate={puzzle.date}
          category={puzzle.category}
        />
      </div>
    </div>
  )
}
