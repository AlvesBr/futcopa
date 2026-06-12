'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { TopBar } from '@/components/TopBar'
import { cn } from '@/lib/cn'
import {
  type RawMatch,
  type MatchStatus,
  teamName,
  teamFlag,
  stageLabel,
  matchStatus,
  estimatedMinute,
  kickoffLocal,
  matchDates,
  matchesOnDate,
  displayScore,
} from '@/lib/live'
import { cazeLinkFor, type CazeVideo } from '@/lib/cazetv'

const REFRESH_MS = 60_000
const TICK_MS = 30_000

function todayLocal(): string {
  return new Date().toLocaleDateString('en-CA')
}

function formatDateChip(date: string): string {
  const d = new Date(`${date}T12:00:00`)
  const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  return label.replace('.', '').replace(' de ', ' ')
}

/* ─── linha de uma seleção dentro do card ─── */

function TeamRow({ team, score, winner }: { team: string; score: number | null; winner: boolean }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[18px] leading-none shrink-0">{teamFlag(team)}</span>
      <span
        className={cn(
          'fc-body min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
          winner ? 'font-bold text-fg' : 'font-medium text-fg-2',
        )}
      >
        {teamName(team)}
      </span>
      {score != null && (
        <span className={cn('ml-auto fc-body fc-tnum', winner ? 'font-bold text-fg' : 'font-medium text-fg-2')}>
          {score}
        </span>
      )}
    </div>
  )
}

/* ─── badge de status à direita do card ─── */

function StatusBadge({ status, match, now }: { status: MatchStatus; match: RawMatch; now: Date }) {
  if (status === 'live' || status === 'halftime') {
    return (
      <span className="flex items-center gap-1.5 text-[var(--success)] font-bold fc-caption whitespace-nowrap">
        <span className="w-2 h-2 rounded-pill bg-[var(--success)] animate-pulse" />
        {status === 'halftime' ? 'INT' : estimatedMinute(match, now)}
      </span>
    )
  }
  if (status === 'finished') {
    return <span className="fc-caption text-fg-3 font-semibold whitespace-nowrap">FIM</span>
  }
  if (status === 'awaiting') {
    return <span className="fc-caption text-fg-3 whitespace-nowrap animate-pulse">…</span>
  }
  return (
    <span className="fc-caption text-fg font-bold fc-tnum whitespace-nowrap">
      {kickoffLocal(match)}
    </span>
  )
}

/* ─── card de partida (expansível) ─── */

function MatchCard({ match, now, videos }: { match: RawMatch; now: Date; videos: CazeVideo[] }) {
  const [expanded, setExpanded] = useState(false)
  const status = matchStatus(match, now)
  const score = displayScore(match)
  const homeWin = score ? score.home > score.away : false
  const awayWin = score ? score.away > score.home : false
  const isLive = status === 'live' || status === 'halftime'
  const caze = cazeLinkFor(match, videos, status)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setExpanded(e => !e)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(v => !v) } }}
      className={cn(
        'w-full text-left bg-surface-2 border rounded-md px-3 py-2.5 cursor-pointer',
        'transition-[border-color,box-shadow] duration-[var(--dur-1)]',
        isLive
          ? 'border-[var(--success)] shadow-1'
          : 'border-[var(--border)] hover:border-[var(--border-strong)]',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <TeamRow team={match.team1} score={score?.home ?? null} winner={homeWin} />
          <TeamRow team={match.team2} score={score?.away ?? null} winner={awayWin} />
        </div>
        <div className="shrink-0 w-12 flex justify-end border-l border-[var(--border)] pl-2">
          <StatusBadge status={status} match={match} now={now} />
        </div>
      </div>

      {score?.note && (
        <p className="fc-caption text-fg-3 mt-1">{score.note}</p>
      )}

      {/* Jogo ao vivo: botão de assistir sempre visível */}
      {isLive && caze && (
        <a
          href={caze.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className={cn(
            'mt-2 flex items-center justify-center gap-2 rounded-pill px-3 py-2 no-underline',
            'bg-[#FF0000] text-white font-bold fc-caption',
            'hover:brightness-110 transition-[filter] duration-[var(--dur-1)]',
          )}
        >
          ▶ {caze.label}
        </a>
      )}

      {expanded && (
        <div className="mt-2 pt-2 border-t border-[var(--border)] flex flex-col gap-1">
          {isLive && (
            <p className="fc-caption text-fg-3">
              ⚽ Placar é publicado ao final da partida — minuto estimado pelo horário.
            </p>
          )}
          {!isLive && caze && !caze.fallback && (
            <a
              href={caze.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="fc-caption font-bold text-[#FF0000] no-underline hover:underline"
            >
              ▶ {caze.label}
            </a>
          )}
          {(match.goals1?.length || match.goals2?.length) ? (
            <div className="flex flex-col gap-0.5">
              {match.goals1?.map((g, i) => (
                <p key={`g1-${i}`} className="fc-caption text-fg-2">
                  ⚽ {g.name} {g.minute}&apos; <span className="text-fg-3">({teamName(match.team1)})</span>
                </p>
              ))}
              {match.goals2?.map((g, i) => (
                <p key={`g2-${i}`} className="fc-caption text-fg-2">
                  ⚽ {g.name} {g.minute}&apos; <span className="text-fg-3">({teamName(match.team2)})</span>
                </p>
              ))}
            </div>
          ) : null}
          {match.score?.ht && (
            <p className="fc-caption text-fg-3">
              Intervalo: {match.score.ht[0]}–{match.score.ht[1]}
            </p>
          )}
          <p className="fc-caption text-fg-3">
            🏟️ {match.ground ?? 'A definir'} · {stageLabel(match)}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── tela principal ─── */

export function LiveScreen() {
  const [matches, setMatches] = useState<RawMatch[] | null>(null)
  const [cazeVideos, setCazeVideos] = useState<CazeVideo[]>([])
  const [fetchFailed, setFetchFailed] = useState(false)
  const [selectedDate, setSelectedDate] = useState(todayLocal)
  const [liveOnly, setLiveOnly] = useState(false)
  const [now, setNow] = useState(() => new Date())

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/live')
      if (!res.ok) throw new Error(String(res.status))
      const data = await res.json()
      setMatches(data.matches as RawMatch[])
      setFetchFailed(false)
    } catch {
      setFetchFailed(true)
    }
    try {
      const res = await fetch('/api/cazetv')
      if (res.ok) {
        const data = await res.json()
        setCazeVideos((data.videos ?? []) as CazeVideo[])
      }
    } catch {
      /* sem vídeos — botões caem no fallback do canal */
    }
  }, [])

  useEffect(() => {
    refresh()
    const fetchId = setInterval(refresh, REFRESH_MS)
    const tickId = setInterval(() => setNow(new Date()), TICK_MS)
    return () => { clearInterval(fetchId); clearInterval(tickId) }
  }, [refresh])

  const dates = useMemo(() => (matches ? matchDates(matches) : []), [matches])

  const liveMatches = useMemo(() => {
    if (!matches) return []
    return matches.filter(m => {
      const s = matchStatus(m, now)
      return s === 'live' || s === 'halftime'
    })
  }, [matches, now])

  const visible: RawMatch[] = useMemo(() => {
    if (!matches) return []
    if (liveOnly) return liveMatches
    return matchesOnDate(matches, selectedDate)
  }, [matches, liveOnly, liveMatches, selectedDate])

  /* agrupar por fase/grupo preservando ordem por horário */
  const groups = useMemo(() => {
    const map = new Map<string, RawMatch[]>()
    for (const m of visible) {
      const key = stageLabel(m)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return [...map.entries()]
  }, [visible])

  const dateIdx = dates.indexOf(selectedDate)
  const canPrev = dateIdx > 0
  const canNext = dateIdx >= 0 && dateIdx < dates.length - 1
  /* data selecionada pode não ter jogos (índice -1): acha vizinhos válidos */
  function shiftDate(dir: -1 | 1) {
    if (dateIdx >= 0) {
      const next = dates[dateIdx + dir]
      if (next) setSelectedDate(next)
      return
    }
    const candidates = dir === 1 ? dates.filter(d => d > selectedDate) : dates.filter(d => d < selectedDate).reverse()
    if (candidates[0]) setSelectedDate(candidates[0])
  }

  return (
    <div className="fc-stage">
      <div className="fc-phone">
        <TopBar backHref="/" />

        {/* título + contagem ao vivo */}
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <h1 className="fc-h2 m-0">Copa 2026</h1>
          <button
            onClick={() => setLiveOnly(v => !v)}
            className={cn(
              'flex items-center gap-1.5 rounded-pill px-3 py-1.5 fc-caption font-bold border cursor-pointer',
              'transition-colors duration-[var(--dur-1)]',
              liveOnly
                ? 'bg-[var(--success-bg)] border-[var(--success)] text-[var(--success)]'
                : 'bg-surface-2 border-[var(--border)] text-fg-2 hover:bg-surface-3',
            )}
          >
            <span className={cn('w-2 h-2 rounded-pill', liveMatches.length > 0 ? 'bg-[var(--success)] animate-pulse' : 'bg-fg-3')} />
            Ao vivo {liveMatches.length > 0 ? `(${liveMatches.length})` : ''}
          </button>
        </div>

        {/* navegação por data */}
        {!liveOnly && (
          <div className="flex items-center justify-between px-4 py-2">
            <button
              onClick={() => shiftDate(-1)}
              disabled={dates.length === 0 || (dateIdx >= 0 && !canPrev)}
              className="fc-iconbtn disabled:opacity-30"
              aria-label="Dia anterior"
            >
              ‹
            </button>
            <div className="flex items-center gap-2">
              <span className="fc-body font-bold text-fg capitalize">
                {selectedDate === todayLocal() ? 'Hoje' : formatDateChip(selectedDate)}
              </span>
              {selectedDate !== todayLocal() && (
                <button
                  onClick={() => setSelectedDate(todayLocal())}
                  className="fc-caption text-primary font-bold cursor-pointer bg-transparent border-none"
                >
                  Hoje
                </button>
              )}
            </div>
            <button
              onClick={() => shiftDate(1)}
              disabled={dates.length === 0 || (dateIdx >= 0 && !canNext)}
              className="fc-iconbtn disabled:opacity-30"
              aria-label="Próximo dia"
            >
              ›
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-4">
          {matches === null && !fetchFailed && (
            <p className="fc-caption text-fg-3 text-center py-8">Carregando jogos…</p>
          )}
          {fetchFailed && matches === null && (
            <p className="fc-caption text-fg-3 text-center py-8">
              Não foi possível carregar os jogos. Tente novamente em instantes.
            </p>
          )}

          {matches !== null && groups.length === 0 && (
            <p className="fc-caption text-fg-3 text-center py-8">
              {liveOnly ? 'Nenhum jogo ao vivo agora.' : 'Nenhum jogo nesta data.'}
            </p>
          )}

          {groups.map(([stage, ms]) => (
            <section key={stage} aria-label={stage} className="flex flex-col gap-2">
              <h2 className="fc-label text-fg-2 m-0 uppercase tracking-wide">{stage}</h2>
              {ms.map((m, i) => (
                <MatchCard key={`${m.date}-${m.team1}-${m.team2}-${i}`} match={m} now={now} videos={cazeVideos} />
              ))}
            </section>
          ))}

          {matches !== null && (
            <p className="fc-caption text-fg-3 text-center mt-2">
              Horários no seu fuso · Placares via openfootball, publicados ao final de cada partida
            </p>
          )}
        </main>
      </div>
    </div>
  )
}
