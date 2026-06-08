'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DraftRollPanel }  from '@/components/copa/DraftRollPanel'
import { FormationPitch }  from '@/components/copa/FormationPitch'
import { BoxScore }        from '@/components/copa/BoxScore'
import { loadDraftState, saveDraftState, createEmptyDraftState } from '@/lib/draftState'
import {
  getRandomRoll,
  getRandomRollSameEdition,
  getRandomRollSameCountry,
  getCompatibleSlots,
  FORMATION_SLOTS,
} from '@/lib/cupData'
import { generateSeed }    from '@/lib/simulation'
import { useTheme }        from '@/components/ThemeProvider'
import type { DraftState, CupPlayer, DraftSlot, CupEdition, CupSquad } from '@/lib/types'

type RollResult = { edition: CupEdition; squad: CupSquad; players: CupPlayer[] }

export default function DraftPage() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

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
        `${selectedPlayer.name} (${selectedPlayer.positions.join('/')}) — nenhum slot compatível disponível.`
      )
    } else {
      setNoSlotMsg(null)
    }
  }, [draft, selectedPlayer])

  // ── Helpers ────────────────────────────────────────────────────────────────

  function applyRoll(draft: DraftState, roll: RollResult, decrementReroll: boolean): DraftState {
    return {
      ...draft,
      rerollsLeft: decrementReroll ? Math.max(0, draft.rerollsLeft - 1) : draft.rerollsLeft,
      currentRoll: { squad: roll.squad, edition: roll.edition, players: roll.players },
    }
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRoll = useCallback(async () => {
    if (!draft || isRolling) return
    setIsRolling(true)
    setSelectedPlayer(null)
    setNoSlotMsg(null)

    try {
      // Exclui os últimos N squads únicos do histórico de picks para criar
      // um efeito round-robin. N = totalSquads - 1 = 5 (banco tem ~6 squads),
      // garantindo que sempre há pelo menos 1 squad disponível.
      const MAX_EXCLUDE = 5
      const recentIds = draft.picks.map(p => p.player.squad_id).reverse()
      const seen = new Set<string>()
      const usedSquadIds: string[] = []
      for (const id of recentIds) {
        if (!seen.has(id)) {
          seen.add(id)
          usedSquadIds.push(id)
          if (usedSquadIds.length >= MAX_EXCLUDE) break
        }
      }
      const roll = await getRandomRoll(usedSquadIds)

      if (!roll) {
        console.error('Nenhum squad disponível')
        return
      }

      const newDraft: DraftState = {
        ...draft,
        rerollsLeft:  3,
        currentRoll: { squad: roll.squad, edition: roll.edition, players: roll.players },
      }
      setDraft(newDraft)
      saveDraftState(newDraft)
    } catch (err) {
      console.error('Erro ao sortear:', err)
    } finally {
      setIsRolling(false)
    }
  }, [draft, isRolling])

  // "↺ Outra Seleção" → mesma Copa, país diferente
  // "↺ Outra Copa"    → mesmo país, Copa diferente
  const handleReroll = useCallback(async (type: 'team' | 'edition') => {
    if (!draft || draft.rerollsLeft <= 0 || !draft.currentRoll || isRolling) return
    setIsRolling(true)
    setSelectedPlayer(null)
    setNoSlotMsg(null)

    try {
      // Exclui squads já usados no draft E o roll atual (para realmente trocar)
      const usedSquadIds = [
        ...draft.picks.map(p => p.player.squad_id),
        draft.currentRoll.squad?.id ?? '',
      ].filter(Boolean) as string[]

      let roll: RollResult | null = null

      if (type === 'team') {
        // Mesma Copa (edição), seleção diferente
        const editionId = draft.currentRoll.edition?.id
        if (editionId) roll = await getRandomRollSameEdition(editionId, usedSquadIds)
        else           roll = await getRandomRoll(usedSquadIds)
      } else {
        // Mesmo país, Copa diferente
        const countryCode = draft.currentRoll.squad?.country_code
        if (countryCode) roll = await getRandomRollSameCountry(countryCode, usedSquadIds)
        else             roll = await getRandomRoll(usedSquadIds)
      }

      if (!roll) {
        console.warn('Reroll: nenhuma seleção encontrada')
        return
      }

      const newDraft = applyRoll(draft, roll, true)
      setDraft(newDraft)
      saveDraftState(newDraft)
    } catch (err) {
      console.error('Erro ao re-sortear:', err)
    } finally {
      setIsRolling(false)
    }
  }, [draft, isRolling])

  // Saída de emergência: rerolls esgotados + nenhum jogador tem slot disponível
  const handleForceRoll = useCallback(async () => {
    if (!draft || isRolling) return
    setIsRolling(true)
    setSelectedPlayer(null)
    setNoSlotMsg(null)

    try {
      const usedSquadIds = [
        ...draft.picks.map(p => p.player.squad_id),
        draft.currentRoll?.squad?.id ?? '',
      ].filter(Boolean) as string[]

      const roll = await getRandomRoll(usedSquadIds)
      if (!roll) return

      // Mantém rerollsLeft em 0 — é uma ação de emergência, não um reroll normal
      const newDraft: DraftState = {
        ...draft,
        rerollsLeft: 0,
        currentRoll: { squad: roll.squad, edition: roll.edition, players: roll.players },
      }
      setDraft(newDraft)
      saveDraftState(newDraft)
    } catch (err) {
      console.error('Erro ao forçar novo sortear:', err)
    } finally {
      setIsRolling(false)
    }
  }, [draft, isRolling])

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

  // Detectar estado travado: rerolls esgotados + jogador selecionado sem slot
  const isStuck = draft.rerollsLeft === 0 && noSlotMsg !== null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--slot-border)]"
              style={{ backgroundColor: 'var(--surface)' }}>
        <Link href="/copa-dos-sonhos" className="fc-caption text-fg-3 hover:text-fg">
          ← Sair
        </Link>
        <span className="fc-caption text-fg-2">
          {draft.formation} · {draft.mode === 'classico' ? 'Clássico' : 'De Almanaque'}
        </span>
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="fc-caption text-fg-3 hover:text-fg px-2 py-1 rounded transition-colors"
          aria-label="Alternar tema"
          title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {resolvedTheme === 'dark' ? '☀️' : '🌙'}
        </button>
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
            onRerollSquad={() => handleReroll('team')}
            onRerollEdition={() => handleReroll('edition')}
          />

          {/* Mensagem de slot incompatível */}
          {noSlotMsg && (
            <p className="fc-caption mt-2 px-1" style={{ color: 'var(--error)' }}>
              ⚠ {noSlotMsg}
            </p>
          )}

          {/* Saída de emergência: travado sem slot */}
          {isStuck && (
            <button
              onClick={handleForceRoll}
              disabled={isRolling}
              className="mt-3 w-full fc-caption px-3 py-2 rounded-sm border-2 text-left transition-colors"
              style={{
                borderColor: 'var(--warning)',
                color: 'var(--warning-ink)',
                backgroundColor: 'var(--warning-bg)',
              }}
            >
              {isRolling ? 'Sorteando…' : '↻ Nenhum slot disponível — Sortear nova seleção'}
            </button>
          )}
        </div>

        {/* Centro — campo visual */}
        <div className="flex-1 w-full min-h-[320px] max-w-xs mx-auto md:max-w-sm">
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
                className="font-bold px-6 py-2 rounded-sm fc-body transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--fg-on-brand)' }}
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
