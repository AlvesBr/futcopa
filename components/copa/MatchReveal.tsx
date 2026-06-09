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
        <span className="text-2xl">{userFlag}</span>
        <span className={cn('fc-title font-bold text-xl', revealed && won ? 'text-[var(--success)]' : revealed && !won ? 'text-[var(--error)]' : 'text-fg')}>
          {revealed ? homeGoals : '?'}
        </span>
        <span className="fc-body text-fg-3">–</span>
        <span className={cn('fc-title font-bold text-xl', revealed && !won ? 'text-[var(--error)]' : 'text-fg')}>
          {revealed ? awayGoals : '?'}
        </span>
        <span className="text-2xl">{revealed ? opp.flag_emoji : '🏴'}</span>
        <span className="fc-body text-fg-2 flex-1 truncate font-medium">
          {revealed ? opp.country_name : '???'}
        </span>
        {revealed && (
          <span className={cn(
            'fc-caption font-bold px-2 py-0.5 rounded',
            won ? 'bg-[var(--success)] text-white' : 'bg-[var(--error)] text-white'
          )}>
            {won ? 'VITÓRIA' : 'DERROTA'}
          </span>
        )}
      </div>

      {/* Gols por minuto — separados por time */}
      {revealed && goals.length > 0 && (() => {
        const userGoals     = goals.filter(g => !g.isOpponent)
        const opponentGoals = goals.filter(g =>  g.isOpponent)
        return (
          <div className="mt-3 flex flex-col gap-1">
            {userGoals.length > 0 && (
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="fc-caption text-fg-3 uppercase tracking-wide shrink-0">Gols</span>
                <span className="fc-caption text-fg">
                  {userGoals.map((g, i) => (
                    <span key={i}>{g.minute}' ⚽ {g.scorerName.toUpperCase()}{i < userGoals.length - 1 ? '  ' : ''}</span>
                  ))}
                </span>
              </div>
            )}
            {opponentGoals.length > 0 && (
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="fc-caption text-fg-3 uppercase tracking-wide shrink-0">Sofreu</span>
                <span className="fc-caption" style={{ color: 'var(--error)' }}>
                  {opponentGoals.map((g, i) => (
                    <span key={i}>{g.minute}' ◦ {g.scorerName.toUpperCase()}{i < opponentGoals.length - 1 ? '  ' : ''}</span>
                  ))}
                </span>
              </div>
            )}
          </div>
        )
      })()}

      {/* Pênaltis */}
      {revealed && penalties && (
        <div className="mt-3 border-t border-[var(--slot-border)] pt-3">
          <p className="fc-caption text-fg-3 mb-2 uppercase tracking-wide">
            Disputa de Pênaltis — Melhor de 5
          </p>
          <div className="flex flex-col gap-1">
            {Array.from({ length: Math.max(penalties.userKicks.length, penalties.opponentKicks.length) }).map((_, i) => {
              const uk = penalties.userKicks[i]
              const ok = penalties.opponentKicks[i]
              return (
                <div key={i} className="flex items-center gap-2 fc-caption leading-snug">
                  {/* Batedor do usuário */}
                  <span className={cn(
                    'flex-1 text-right font-medium',
                    !uk                         ? 'text-fg-3'
                    : uk.converted              ? 'text-fg'
                    :                             'text-[var(--error)] line-through opacity-60'
                  )}>
                    {uk ? uk.takerName.toUpperCase() : ''}
                  </span>
                  <span className={cn(
                    'text-base w-5 text-center',
                    uk?.converted ? 'text-[var(--success)]' : 'text-[var(--error)]'
                  )}>
                    {uk ? (uk.converted ? '⚽' : '✕') : ''}
                  </span>

                  <span className="text-fg-3 px-1">·</span>

                  {/* Batedor do adversário */}
                  <span className={cn(
                    'text-base w-5 text-center',
                    ok?.converted ? 'text-[var(--error)]' : 'text-[var(--success)]'
                  )}>
                    {ok ? (ok.converted ? '⚽' : '✕') : ''}
                  </span>
                  <span className={cn(
                    'flex-1 font-medium',
                    !ok                         ? 'text-fg-3'
                    : ok.converted              ? 'text-fg'
                    :                             'text-[var(--success)] opacity-60'
                  )}>
                    {ok ? ok.takerName.toUpperCase() : ''}
                  </span>
                </div>
              )
            })}
          </div>
          {/* Placar dos pênaltis */}
          <p className="fc-caption text-fg-3 mt-2">
            {userFlag} {penalties.userKicks.filter(k => k.converted).length}
            {' – '}
            {penalties.opponentKicks.filter(k => k.converted).length} {opp.flag_emoji}
            {'  '}
            <span className={cn('font-bold', penalties.userWon ? 'text-[var(--success)]' : 'text-[var(--error)]')}>
              {penalties.userWon ? '→ Avançamos!' : '→ Eliminados'}
            </span>
          </p>
        </div>
      )}

    </article>
  )
}
