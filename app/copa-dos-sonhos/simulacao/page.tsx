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
import { getAllSquads }       from '@/lib/cupData'
import { generateCampaign, mulberry32, seedToNumber } from '@/lib/simulation'
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
  const [isAutoRunning, setIsAutoRunning] = useState(false)
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
        // Buscar todos os squads disponíveis (sem filtro de rating)
        const allSquads = await getAllSquads()

        if (allSquads.length === 0) {
          setError('Não foi possível gerar adversários. Verifique se o banco está populado.')
          setLoading(false)
          return
        }

        // Shuffle determinístico baseado no seed (sub-stream isolado ^ 0xA1)
        // Garante que o mesmo seed sempre produz a mesma ordem de adversários
        const rng = mulberry32(seedToNumber(seed) ^ 0xA1B2C3D4)
        const shuffled: typeof allSquads = [...allSquads]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1))
          const tmp = shuffled[i]!
          shuffled[i] = shuffled[j]!
          shuffled[j] = tmp
        }

        // Preferir squads que o usuário NÃO usou no draft como primeiros adversários
        // Isso maximiza a variedade: adversários "novos" primeiro, repetidos por último
        const draftedIds = new Set(draft.picks.map(p => p.player.squad_id))
        const preferred  = shuffled.filter(s => !draftedIds.has(s.id))
        const fallback   = shuffled.filter(s =>  draftedIds.has(s.id))
        const orderedPool = [...preferred, ...fallback]

        // Atribuir adversários ciclicamente às 7 fases
        // Com N squads e 7 fases: no mínimo ceil(7/N) repetições — inevitável com N=6
        const opponents = PHASES_ORDER.map((_, i) => orderedPool[i % orderedPool.length]!)

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

  // Animação automática: avança 1 jogo a cada 1.8s
  useEffect(() => {
    if (!isAutoRunning || !campaign) return
    if (revealedCount >= totalMatches) {
      setIsAutoRunning(false)
      return
    }
    const timer = setTimeout(() => {
      setRevealedCount(prev => Math.min(prev + 1, totalMatches))
    }, 1800)
    return () => clearTimeout(timer)
  }, [isAutoRunning, revealedCount, totalMatches, campaign])

  const handleReveal = useCallback(() => {
    if (!campaign) return
    if (revealMode === 'automatico') {
      setIsAutoRunning(true)
    } else {
      setRevealedCount(prev => Math.min(prev + 1, totalMatches))
    }
  }, [campaign, revealMode, totalMatches])

  const handleStopAuto = useCallback(() => {
    setIsAutoRunning(false)
  }, [])

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
      <div className="fc-stage">
        <div className="fc-phone" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <p className="fc-body animate-pulse" style={{ color: 'var(--fg-2)' }}>Simulando a Copa…</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="fc-stage">
        <div className="fc-phone" style={{ alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <p className="fc-body" style={{ color: 'var(--error)', textAlign: 'center' }}>{error ?? 'Erro desconhecido.'}</p>
          <Link href="/copa-dos-sonhos/draft" className="fc-body" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
            ← Voltar ao draft
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fc-stage">
    <div className="fc-phone">

      {/* Top bar */}
      <header className="fc-topbar">
        <div className="fc-wm" style={{ gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--gold-400)' }}>
            A Campanha
          </span>
          <span className="fc-caption" style={{ color: 'var(--fg-3)' }}>#<span style={{ fontWeight: 700, color: 'var(--fg)' }}>{seed}</span></span>
        </div>
        <button onClick={handleRepeat} className="fc-iconbtn" title="Recomeçar" aria-label="Recomeçar">
          ↻
        </button>
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="fc-iconbtn"
          aria-label="Alternar tema"
        >
          {resolvedTheme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 max-w-4xl mx-auto w-full">

        {/* Coluna esquerda — jogos revelados */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Controles de revelação */}
          {!allRevealed && (
            <RevealControls
              mode={revealMode}
              onModeChange={m => { setRevealMode(m); setIsAutoRunning(false) }}
              onReveal={handleReveal}
              onStop={handleStopAuto}
              canReveal={!allRevealed}
              allRevealed={allRevealed}
              isAutoRunning={isAutoRunning}
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
            <div className={isAutoRunning ? 'animate-pulse' : ''}>
              <MatchReveal
                match={campaign.matches[revealedCount]!}
                revealed={false}
                userFlag="🌟"
              />
            </div>
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
    </div>
  )
}

export default function SimulacaoPage() {
  return (
    <Suspense fallback={
      <div className="fc-stage">
        <div className="fc-phone" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <p className="fc-body animate-pulse" style={{ color: 'var(--fg-2)' }}>Carregando…</p>
        </div>
      </div>
    }>
      <SimulacaoInner />
    </Suspense>
  )
}
