import { cn } from '@/lib/cn'
import type { SimulatedMatch } from '@/lib/types'

const PHASE_ORDER = ['grupos', 'grupos', 'grupos', 'oitavas', 'quartas', 'semi', 'final']
const PHASE_LABELS: Record<string, string> = {
  grupos: 'Grupos', oitavas: 'Oitavas', quartas: 'Quartas', semi: 'Semi', final: 'Final',
}

interface TournamentBracketProps {
  matches:       SimulatedMatch[]
  revealedCount: number   // quantos jogos foram revelados
}

export function TournamentBracket({ matches, revealedCount }: TournamentBracketProps) {
  // Agrupar por fase para exibição
  const groupMatches   = matches.filter(m => m.phase === 'grupos')
  const knockoutPhases = ['oitavas', 'quartas', 'semi', 'final'] as const

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Grupos */}
      {groupMatches.length > 0 && (
        <div>
          <p className="fc-eyebrow text-fg-3 uppercase tracking-wide mb-2">Grupos</p>
          <div className="flex gap-2 flex-wrap">
            {groupMatches.map((m, i) => {
              const globalIdx = matches.indexOf(m)
              const isRevealed = globalIdx < revealedCount
              return (
                <BracketChip key={i} match={m} revealed={isRevealed} />
              )
            })}
          </div>
        </div>
      )}

      {/* Mata-mata */}
      <div className="flex gap-3 flex-wrap">
        {knockoutPhases.map(phase => {
          const match = matches.find(m => m.phase === phase)
          if (!match) return null
          const globalIdx = matches.indexOf(match)
          const isRevealed = globalIdx < revealedCount
          return (
            <div key={phase}>
              <p className="fc-caption text-fg-3 mb-1">{PHASE_LABELS[phase]}</p>
              <BracketChip match={match} revealed={isRevealed} />
            </div>
          )
        })}
      </div>

    </div>
  )
}

function BracketChip({ match, revealed }: { match: SimulatedMatch; revealed: boolean }) {
  return (
    <div className={cn(
      'rounded px-3 py-2 border flex items-center gap-2 min-w-[140px]',
      !revealed && 'border-[var(--slot-border)] text-fg-3',
      revealed && match.won  && 'border-[var(--success)] bg-[var(--success-bg)]',
      revealed && !match.won && 'border-[var(--error)]   bg-[var(--error-bg)]',
    )}>
      <span>{match.opponentSquad.flag_emoji}</span>
      <span className="fc-caption text-fg truncate flex-1">{match.opponentSquad.country_name}</span>
      {revealed && (
        <span className="fc-caption font-bold text-fg">
          {match.homeGoals}–{match.awayGoals}
        </span>
      )}
    </div>
  )
}
