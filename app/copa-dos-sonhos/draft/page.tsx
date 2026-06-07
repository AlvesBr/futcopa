'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DraftRollPanel }  from '@/components/copa/DraftRollPanel'
import { FormationPitch }  from '@/components/copa/FormationPitch'
import { BoxScore }        from '@/components/copa/BoxScore'
import { loadDraftState, saveDraftState, createEmptyDraftState } from '@/lib/draftState'
import { getRandomRoll, getCompatibleSlots, FORMATION_SLOTS } from '@/lib/cupData'
import { generateSeed }    from '@/lib/simulation'
import type { DraftState, CupPlayer, DraftSlot } from '@/lib/types'

export default function DraftPage() {
  const router = useRouter()

  const [draft, setDraft]                   = useState<DraftState | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<CupPlayer | null>(null)
  const [compatibleSlots, setCompatible]    = useState<string[]>([])
  const [isRolling, setIsRolling]           = useState(false)
  const [noSlotMsg, setNoSlotMsg]           = useState<string | null>(null)

  // Carregar estado do sessionStorage
  useEffect(() => {
    const state = loadDraftState()
    if (!state) {
      router.replace('/copa-dos-sonhos')
      return
    }
    setDraft(state)
  }, [router])

  // Atualizar slots compatíveis quando jogador é selecionado
  useEffect(() => {
    if (!draft || !selectedPlayer) {
      setCompatible([])
      return
    }
    const slots      = FORMATION_SLOTS[draft.formation] ?? []
    const pickSet    = new Set(draft.picks.map(p => `${p.position}-${p.slotIndex}`))
    const posCounts: Record<string, number> = {}

    const emptySlotKeys = slots
      .map(pos => {
        const idx      = posCounts[pos] ?? 0
        posCounts[pos] = idx + 1
        return { pos, idx, key: `${pos}-${idx}` }
      })
      .filter(({ key }) => !pickSet.has(key))
      .map(({ pos }) => pos)

    const compatible = getCompatibleSlots(selectedPlayer.positions.map(p => p.toUpperCase()), emptySlotKeys)

    // Reconstruir as chaves com índice para os slots compatíveis
    const posCounts2: Record<string, number> = {}
    const compatibleKeys = slots
      .map(pos => {
        const idx       = posCounts2[pos] ?? 0
        posCounts2[pos] = idx + 1
        return { pos, idx, key: `${pos}-${idx}` }
      })
      .filter(({ pos, key }) => compatible.includes(pos) && !pickSet.has(key))
      .map(({ key }) => key)

    setCompatible(compatibleKeys)

    if (compatible.length === 0 && selectedPlayer) {
      setNoSlotMsg(
        `${selectedPlayer.name} joga ${selectedPlayer.positions.join('/')} — não há slot compatível disponível.`
      )
    } else {
      setNoSlotMsg(null)
    }
  }, [draft, selectedPlayer])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRoll = useCallback(async () => {
    if (!draft || isRolling) return
    setIsRolling(true)
    setSelectedPlayer(null)
    setNoSlotMsg(null)

    try {
      const usedSquadIds = draft.picks.map(p => p.squadInfo.country_code + p.squadInfo.edition_year)
      const roll = await getRandomRoll([])   // passar IDs reais em produção

      if (!roll) {
        console.error('Nenhum squad disponível')
        return
      }

      const newDraft: DraftState = {
        ...draft,
        rerollsLeft:  3,
        currentRoll: {
          squad:   roll.squad,
          edition: roll.edition,
          players: roll.players,
        },
      }
      setDraft(newDraft)
      saveDraftState(newDraft)
    } catch (err) {
      console.error('Erro ao sortear:', err)
    } finally {
      setIsRolling(false)
    }
  }, [draft, isRolling])

  const handleReroll = useCallback(async (keep: 'squad' | 'edition') => {
    if (!draft || draft.rerollsLeft <= 0 || !draft.currentRoll) return
    setIsRolling(true)
    setSelectedPlayer(null)

    try {
      const roll = await getRandomRoll([])
      if (!roll) return

      const newRoll = keep === 'squad'
        ? { ...draft.currentRoll, edition: roll.edition, players: roll.players }
        : { ...draft.currentRoll, squad: roll.squad, players: roll.players }

      const newDraft: DraftState = {
        ...draft,
        rerollsLeft:  draft.rerollsLeft - 1,
        currentRoll: newRoll,
      }
      setDraft(newDraft)
      saveDraftState(newDraft)
    } catch (err) {
      console.error('Erro ao re-sortear:', err)
    } finally {
      setIsRolling(false)
    }
  }, [draft])

  const handleSelectPlayer = useCallback((player: CupPlayer) => {
    setSelectedPlayer(prev => prev?.id === player.id ? null : player)
    setNoSlotMsg(null)
  }, [])

  const handleSlotClick = useCallback((pos: string, idx: number) => {
    if (!draft || !selectedPlayer || !draft.currentRoll) return

    const key = `${pos}-${idx}`
    if (!compatibleSlots.includes(key)) return

    const newSlot: DraftSlot = {
      position:  pos as DraftSlot['position'],
      slotIndex: idx,
      player:    selectedPlayer,
      squadInfo: {
        country_code: draft.currentRoll.squad!.country_code,
        country_name: draft.currentRoll.squad!.country_name,
        flag_emoji:   draft.currentRoll.squad!.flag_emoji,
        edition_year: draft.currentRoll.edition!.year,
      },
    }

    const newDraft: DraftState = {
      ...draft,
      picks:       [...draft.picks, newSlot],
      currentRoll: null,
      rerollsLeft: 3,
    }

    setDraft(newDraft)
    saveDraftState(newDraft)
    setSelectedPlayer(null)
    setCompatible([])

    // Se completou os 11, navegar para simulação
    const slots = FORMATION_SLOTS[draft.formation] ?? []
    if (newDraft.picks.length >= slots.length) {
      const seed = generateSeed()
      router.push(`/copa-dos-sonhos/simulacao?seed=${seed}`)
    }
  }, [draft, selectedPlayer, compatibleSlots, router])

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!draft) return null

  const slots      = FORMATION_SLOTS[draft.formation] ?? []
  const isComplete = draft.picks.length >= slots.length

  return (
    <div className="min-h-screen flex flex-col">

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--slot-border)]">
        <Link href="/copa-dos-sonhos" className="fc-caption text-fg-3 hover:text-fg">
          ← Sair
        </Link>
        <span className="fc-caption text-fg-2">
          {draft.formation} · {draft.mode === 'classico' ? 'Clássico' : 'De Almanaque'}
        </span>
      </header>

      {/* Layout principal: 3 colunas em desktop, coluna única em mobile */}
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 max-w-5xl mx-auto w-full">

        {/* Coluna esquerda — roll panel */}
        <div className="md:w-72 shrink-0">
          <DraftRollPanel
            currentSquad={draft.currentRoll?.squad ?? null}
            currentEdition={draft.currentRoll?.edition ?? null}
            players={draft.currentRoll?.players ?? []}
            selectedPlayer={selectedPlayer}
            rerollsLeft={draft.rerollsLeft}
            mode={draft.mode}
            isRolling={isRolling}
            picksCount={draft.picks.length}
            onRoll={handleRoll}
            onSelectPlayer={handleSelectPlayer}
            onRerollSquad={() => handleReroll('edition')}
            onRerollEdition={() => handleReroll('squad')}
          />
          {noSlotMsg && (
            <p className="fc-caption text-[var(--error)] mt-2">{noSlotMsg}</p>
          )}
        </div>

        {/* Centro — campo visual */}
        <div className="flex-1 max-w-xs mx-auto md:max-w-sm">
          <FormationPitch
            formation={draft.formation}
            picks={draft.picks}
            compatibleSlots={compatibleSlots}
            onSlotClick={handleSlotClick}
          />
          {isComplete && (
            <div className="mt-3 text-center">
              <p className="fc-caption text-fg-2 mb-2">Escalação completa 11/11</p>
              <button
                onClick={() => {
                  const seed = generateSeed()
                  router.push(`/copa-dos-sonhos/simulacao?seed=${seed}`)
                }}
                className="bg-primary text-white font-bold px-6 py-2 rounded-sm fc-body"
              >
                Simular a Copa →
              </button>
            </div>
          )}
        </div>

        {/* Coluna direita — box score */}
        <div className="md:w-52 shrink-0">
          <BoxScore picks={draft.picks} formation={draft.formation} />
        </div>

      </main>
    </div>
  )
}
