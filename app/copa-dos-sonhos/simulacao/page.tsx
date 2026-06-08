'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { MatchReveal }       from '@/components/copa/MatchReveal'
import { RevealControls }    from '@/components/copa/RevealControls'
import { TournamentBracket } from '@/components/copa/TournamentBracket'
import { CampaignCard }      from '@/components/copa/CampaignCard'
import { loadDraftState, saveCampaignResult, resetCopaState } from '@/lib/draftState'
import { getOpponentPool }   from '@/lib/cupData'
import { generateCampaign }  from '@/lib/simulation'
import { useTheme }          from '@/components/ThemeProvider'
import type { CampaignResult, TournamentPhase } from '@/lib/types'

type RevealMode = 'passo-a-passo' | 'automatico'

const PHASES_ORDER: TournamentPhase[] = ['grupos', 'grupos', 'grupos', 'oitavas', 'quartas', 'semi', 'final']

function SimulacaoInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const seed         = searchParams.get('seed') ?? 'UNKNOWN'
  const { resolvedTheme, setTheme } = useTheme()

  const [campaign,      setCampaign]      = useState<CampaignResult | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)
  const [revealMode,    setRevealMode]    = useState<RevealMode>('passo-a-passo')
  const [showCard,      setShowCard]      = useState(false)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)

  // Gerar campanha ao montar
  useEffect(() => {
    async function init() {
      const draft = loadDraftState()
      if (!draft || draft.picks.length < 11) {
        setError('Draft incompleto. Volte e complete os 11 jogadores.')
        setLoading(false)
        return
      }

      try {
        // Buscar adversários para cada fase
        const draftedSquadIds = draft.picks.map(p => p.player.squad_id)
        const opponents = []
        const usedOppIds: string[] = []

        for (const phase of PHASES_ORDER) {
          // Tier 1: strict — exclude draft squads AND previously-used opponents
          let pool = await getOpponentPool(phase, draftedSquadIds, usedOppIds)

          // Tier 2: relaxed — exclude only draft squads (allow opponent repeats)
          if (pool.length === 0) {
            pool = await getOpponentPool(phase, draftedSquadIds, [])
          }

          // Tier 3: any — exclude nothing (use any squad in the DB)
          if (pool.length === 0) {
            pool = await getOpponentPool(phase, [], [])
          }

          if (pool.length === 0) break

          // Sortear adversário do pool usando o seed
          const charCode: number = seed.charCodeAt(opponents.length) ?? 0
          const idx: number = Math.abs(charCode) % pool.length
          const opp = pool[idx]
          if (!opp) break
          opponents.push(opp)
          usedOppIds.push(opp.id)
        }

        if (opponents.length === 0) {
          setError('Não foi possível gerar adversários. Verifique se o banco está populado.')
          setLoading(false)
          return
        }

        const result = generateCampaign(
          draft.picks,
          opponents,
          seed,
          draft.formation,
          draft.mode,
        )

        setCampaign(result)
        saveCampaignResult(result)
      } catch (err) {
        console.error('Erro ao gerar campanha:', err)
        setError('Erro ao simular a Copa. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [seed])

  const totalMatches  = campaign?.matches.length ?? 0
  const allRevealed   = revealedCount >= totalMatches

  const handleReveal = useCallback(() => {
    if (!campaign) return
    if (revealMode === 'automatico') {
      setRevealedCount(totalMatches)
    } else {
      setRevealedCount(prev => Math.min(prev + 1, totalMatches))
    }
  }, [campaign, revealMode, totalMatches])

  // Mostrar card ao revelar tudo
  useEffect(() => {
    if (allRevealed && totalMatches > 0) {
      const timer = setTimeout(() => setShowCard(true), 600)
      return () => clearTimeout(timer)
    }
  }, [allRevealed, totalMatches])

  function handleRepeat() {
    resetCopaState()
    router.push('/copa-dos-sonhos')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="fc-body text-fg-2 animate-pulse">Simulando a Copa…</p>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="fc-body text-[var(--error)] text-center">{error ?? 'Erro desconhecido.'}</p>
        <Link href="/copa-dos-sonhos/draft" className="fc-body text-primary underline">
          ← Voltar ao draft
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--slot-border)]"
              style={{ backgroundColor: 'var(--surface)' }}>
        <h1 className="fc-subtitle text-fg font-bold">
          A campanha · SEED <span className="text-fg-3">#{seed}</span>
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={handleRepeat} className="fc-caption text-fg-3 hover:text-fg">
            ↻ Repetir
          </button>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="fc-caption text-fg-3 hover:text-fg px-2 py-1 rounded transition-colors"
            aria-label="Alternar tema"
            title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {resolvedTheme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 max-w-4xl mx-auto w-full">

        {/* Coluna esquerda — jogos revelados */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Controles de revelação */}
          {!allRevealed && (
            <RevealControls
              mode={revealMode}
              onModeChange={setRevealMode}
              onReveal={handleReveal}
              canReveal={!allRevealed}
              allRevealed={allRevealed}
            />
          )}

          {/* Jogos revelados */}
          {campaign.matches.slice(0, revealedCount).map((match, i) => (
            <MatchReveal
              key={i}
              match={match}
              revealed={true}
              userFlag="🌟"
            />
          ))}

          {/* Jogo pendente de revelação */}
          {!allRevealed && revealedCount < totalMatches && campaign.matches[revealedCount] && (
            <MatchReveal
              match={campaign.matches[revealedCount]!}
              revealed={false}
              userFlag="🌟"
            />
          )}

        </div>

        {/* Coluna direita — bracket + card */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">

          <TournamentBracket
            matches={campaign.matches}
            revealedCount={revealedCount}
          />

          {showCard && (
            <CampaignCard
              result={campaign}
              onRepeat={handleRepeat}
            />
          )}

        </div>

      </main>
    </div>
  )
}

export default function SimulacaoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="fc-body text-fg-2 animate-pulse">Carregando…</p>
      </div>
    }>
      <SimulacaoInner />
    </Suspense>
  )
}
