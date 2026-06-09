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

type GamePhase = 'mode-select' | 'playing' | 'done'

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
  const [usedHelp, setUsedHelp] = useState(false)
  const [helpActive, setHelpActive] = useState(false)
  const [showHelpConfirm, setShowHelpConfirm] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
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
      const finalScore = Object.values(newSlots).filter(s => s?.correct === true).length
      const timeSpent = startedAtRef.current
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : 0
      const slotsToSave = Object.fromEntries(
        Object.entries(newSlots)
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
      setPhase('done')
      resultTimerRef.current = setTimeout(() => setShowResult(true), 800)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string)
    setSelectedPlayerId(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null)
    const { active, over } = event
    if (!over) return
    const overId = over.id as string
    if (!overId.startsWith('slot-')) return
    const targetRank = parseInt(overId.replace('slot-', ''), 10) as Rank
    placePlayer(active.id as string, targetRank, slots, queueIndex)
  }

  /* Tap-to-place: toggle selection on active card */
  function handleSelectPlayer(playerId: string) {
    setSelectedPlayerId(prev => prev === playerId ? null : playerId)
  }

  /* Tap-to-place: slot tapped while a player is selected */
  function handleSlotClick(rank: Rank) {
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

  return (
    <div className="fc-stage">
      <div className="fc-phone">
        <TopBar
          onHelp={phase === 'playing' ? handleHelp : undefined}
          helpUsed={usedHelp}
          helpActive={helpActive}
          onShowResult={phase === 'done' ? () => setShowResult(true) : undefined}
        />

        {/* Category badge — shown in playing + done */}
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
              </div>
            </main>

            {phase === 'playing' && (
              <DragOverlay dropAnimation={null}>
                {activeDragId && (() => {
                  const p = queue.find(q => q.player_id === activeDragId)
                  return p ? (
                    <div className="flex items-center gap-2 bg-surface-2 border-2 border-primary rounded-sm px-3 py-2 shadow-2 cursor-grabbing rotate-2 scale-105">
                      <span className="fc-label" style={{ color: 'var(--fg)', fontWeight: 600 }}>{p.name}</span>
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
