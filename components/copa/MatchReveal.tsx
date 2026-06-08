import { cn } from '@/lib/cn'
import type { SimulatedMatch } from '@/lib/types'

const PHASE_LABELS: Record<string, string> = {
  grupos:  'GRUPOS',
  oitavas: 'OITAVAS',
  quartas: 'QUARTAS',
  semi:    'SEMI',
  final:   'FINAL',
}

interface MatchRevealProps {
  match:    SimulatedMatch
  revealed: boolean   // false = só mostra fase + adversário; true = mostra placar + gols
  userFlag: string    // emoji da seleção do usuário (não existe; usamos 🌟)
}

export function MatchReveal({ match, revealed, userFlag = '🌟' }: MatchRevealProps) {
  const { opponentSquad: opp, homeGoals, awayGoals, goals, penalties, won, phase } = match

  return (
    <article className={cn(
      'rounded-lg border-2 p-4 transition-colors',
      !revealed && 'border-[var(--slot-border)] opacity-70',
      revealed && won  && 'border-[var(--success)]  bg-[var(--success-bg)]',
      revealed && !won && 'border-[var(--error)]    bg-[var(--error-bg)]',
    )}>

      {/* Fase */}
      <p className="fc-caption text-fg-3 mb-2 uppercase tracking-wide">
        {PHASE_LABELS[phase] ?? phase}
      </p>

      {/* Times + placar */}
      <div className="flex items-center gap-3">
        <span className="text-xl">{userFlag}</span>
        <span className="fc-title text-fg font-bold">
          {revealed ? homeGoals : '?'}
        </span>
        <span className="fc-caption text-fg-3">vs</span>
        <span className="fc-title text-fg font-bold">
          {revealed ? awayGoals : '?'}
        </span>
        <span className="text-xl">{revealed ? opp.flag_emoji : '🏴'}</span>
        <span className="fc-body text-fg-2 flex-1 truncate">
          {revealed ? `${opp.country_name}` : '???'}
        </span>
        {revealed && (
          <span className={cn(
            'fc-caption font-bold px-2 py-0.5 rounded-pill',
            won ? 'bg-[var(--success)] text-white' : 'bg-[var(--error)] text-white'
          )}>
            {won ? '✓' : '✕'}
          </span>
        )}
      </div>

      {/* Gols por minuto */}
      {revealed && goals.length > 0 && (
        <div className="mt-3 flex flex-col gap-0.5">
          {goals.map((g, i) => (
            <p key={i} className="fc-caption text-fg-2">
              <span className="text-fg-3 w-8 inline-block">{g.minute}'</span>
              <span className={g.isOpponent ? 'text-[var(--error)]' : 'text-fg'}>
                {g.isOpponent ? '◦' : '⚽'} {g.scorerName.toUpperCase()}
              </span>
            </p>
          ))}
        </div>
      )}

      {/* Pênaltis */}
      {revealed && penalties && (
        <div className="mt-3 border-t border-[var(--slot-border)] pt-3">
          <p className="fc-caption text-fg-3 mb-1">Pênaltis</p>
          <div className="flex gap-4">
            {/* Kicks do usuário */}
            <div className="flex gap-1">
              {penalties.userKicks.map((k, i) => (
                <span key={i} title={k.takerName} className={cn(
                  'w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold',
                  k.converted ? 'bg-[var(--success)] text-white' : 'bg-[var(--error)] text-white'
                )}>
                  {k.converted ? '●' : '✕'}
                </span>
              ))}
            </div>
            <span className="fc-caption text-fg-3">vs</span>
            {/* Kicks do adversário */}
            <div className="flex gap-1">
              {penalties.opponentKicks.map((k, i) => (
                <span key={i} title={k.takerName} className={cn(
                  'w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold',
                  k.converted ? 'bg-[var(--error)] text-white' : 'bg-[var(--success)] text-white'
                )}>
                  {k.converted ? '●' : '✕'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

    </article>
  )
}
