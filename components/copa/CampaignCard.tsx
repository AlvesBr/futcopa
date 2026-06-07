'use client'

import { useState } from 'react'
import type { CampaignResult } from '@/lib/types'
import { copyShareLink, buildShareText } from '@/lib/campaignShare'
import { CampaignStats } from './CampaignStats'

const PHASE_LABELS: Record<string, string> = {
  grupos: 'Grupos', oitavas: 'Oitavas', quartas: 'Quartas',
  semi: 'Semi', final: 'Final', campeao: '🏆 Campeão',
}

interface CampaignCardProps {
  result:    CampaignResult
  onRepeat?: () => void
}

export function CampaignCard({ result, onRepeat }: CampaignCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyShareLink(result.seed)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">

      {/* Stats da campanha */}
      <CampaignStats result={result} />

      {/* Time montado */}
      <section>
        <p className="fc-eyebrow text-fg-3 uppercase tracking-wide mb-2">Meu time</p>
        <div className="flex flex-col gap-1">
          {result.picks.map((pick, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-[var(--slot-border)] last:border-0">
              <span className="fc-caption text-fg-3 w-8">{pick.position}</span>
              <span className="fc-body text-fg font-medium flex-1">{pick.player.name}</span>
              <span className="text-sm">{pick.squadInfo.flag_emoji}</span>
              <span className="fc-caption text-fg-3">
                {pick.squadInfo.country_name} {pick.squadInfo.edition_year}
              </span>
              <span className="fc-caption font-bold text-fg w-6 text-right">
                {pick.player.rating}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Percurso */}
      <section>
        <p className="fc-eyebrow text-fg-3 uppercase tracking-wide mb-2">Percurso</p>
        <div className="flex flex-col gap-1">
          {result.matches.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="fc-caption text-fg-3 w-14 uppercase">{PHASE_LABELS[m.phase]}</span>
              <span>{m.opponentSquad.flag_emoji}</span>
              <span className="fc-caption text-fg flex-1">{m.opponentSquad.country_name}</span>
              <span className={`fc-caption font-bold ${m.won ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                {m.homeGoals}–{m.awayGoals} {m.won ? '✓' : '✕'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Ações */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-sm border border-primary text-primary fc-body font-bold hover:bg-primary hover:text-white transition-colors"
        >
          {copied ? '✓ Link copiado!' : '🔗 Copiar link'}
        </button>

        {onRepeat && (
          <button
            onClick={onRepeat}
            className="flex items-center gap-2 px-4 py-2 rounded-sm border border-[var(--slot-border)] text-fg fc-body hover:border-primary transition-colors"
          >
            ↻ Repetir
          </button>
        )}
      </div>

    </div>
  )
}
