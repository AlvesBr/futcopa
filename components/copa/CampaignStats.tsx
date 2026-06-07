import type { CampaignResult } from '@/lib/types'

const PHASE_LABELS: Record<string, string> = {
  grupos:  'Fase de Grupos',
  oitavas: 'Oitavas de Final',
  quartas: 'Quartas de Final',
  semi:    'Semifinal',
  final:   'Final',
  campeao: '🏆 CAMPEÃO',
}

interface CampaignStatsProps {
  result: CampaignResult
}

export function CampaignStats({ result }: CampaignStatsProps) {
  const phaseLabel = PHASE_LABELS[result.phaseReached] ?? result.phaseReached
  const isCampeao  = result.phaseReached === 'campeao'

  return (
    <div className="flex flex-col items-center gap-4 py-4">

      {/* Fase alcançada */}
      <div className="text-center">
        <p className="fc-eyebrow text-fg-3 uppercase tracking-wide">Fase alcançada</p>
        <p className={`mt-1 font-bold text-2xl ${isCampeao ? 'text-[var(--gold-400,#c9a227)]' : 'text-fg'}`}>
          {phaseLabel}
        </p>
      </div>

      {/* Stats em linha */}
      <div className="flex gap-8 text-center">
        <div>
          <p className="fc-title text-fg font-bold">{result.wins}</p>
          <p className="fc-caption text-fg-3">vitórias</p>
        </div>
        <div>
          <p className="fc-title text-fg font-bold">{result.goalsFor}</p>
          <p className="fc-caption text-fg-3">gols pró</p>
        </div>
        <div>
          <p className="fc-title text-fg font-bold">{result.goalsAgainst}</p>
          <p className="fc-caption text-fg-3">sofridos</p>
        </div>
      </div>

      {/* SEED */}
      <p className="fc-caption text-fg-3">
        Campanha · SEED <span className="font-bold text-fg">#{result.seed}</span>
      </p>

    </div>
  )
}
