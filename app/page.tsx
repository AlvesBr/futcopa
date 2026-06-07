import Link from 'next/link'
import { getPuzzleOfDay, todayDate } from '@/lib/getPuzzleOfDay'
import { GAME_MODES } from '@/lib/gameModes'

export default async function HomePage() {
  const date   = todayDate()
  const puzzle = await getPuzzleOfDay(date)

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10 gap-10">

      {/* Cabeçalho */}
      <header className="text-center">
        <span className="text-5xl">⚽</span>
        <h1 className="fc-title text-fg mt-2">FutCopa</h1>
        <p className="fc-body text-fg-2 mt-1">Jogos de Copa do Mundo para todo dia</p>
      </header>

      {/* Hero — Pyramid (puzzle diário) */}
      <section className="w-full max-w-md">
        <p className="fc-eyebrow text-fg-3 mb-2 uppercase tracking-wide">Puzzle do dia</p>
        <Link
          href={`/play/${date}`}
          className="block rounded-lg border-2 border-primary bg-[var(--surface)] hover:bg-[var(--grass-50)] transition-colors p-6 shadow-1"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="fc-subtitle text-fg font-bold">Pyramid</h2>
              <p className="fc-body text-fg-2 mt-1">
                {puzzle
                  ? `Ordene os jogadores: ${puzzle.category}`
                  : 'Puzzle indisponível hoje — volte amanhã'}
              </p>
            </div>
            <span className="text-3xl shrink-0">🏔️</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="fc-caption text-fg-3">~2 min</span>
            {puzzle && (
              <span className="fc-caption font-semibold text-primary">
                Jogar agora →
              </span>
            )}
          </div>
        </Link>
      </section>

      {/* Grid secundário — outros modos */}
      {GAME_MODES.length > 0 && (
        <section className="w-full max-w-md">
          <p className="fc-eyebrow text-fg-3 mb-2 uppercase tracking-wide">Mais modos</p>
          <div className="flex flex-col gap-3">
            {GAME_MODES.map(mode => (
              <ModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </section>
      )}

    </main>
  )
}

// ── Componente de card de modo ────────────────────────────────────────────────

import type { HubMode } from '@/lib/types'

function ModeCard({ mode }: { mode: HubMode }) {
  const inner = (
    <div className="rounded-lg border-2 border-[var(--slot-border)] bg-[var(--surface)] p-5 flex items-start justify-between gap-4 transition-colors hover:border-primary">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="fc-subtitle text-fg font-bold">{mode.title}</h3>
          {mode.badge && (
            <span className={`fc-caption font-bold px-2 py-0.5 rounded-pill ${
              mode.badge === 'NOVO'
                ? 'bg-primary text-white'
                : 'bg-[var(--surface-2)] text-fg-2'
            }`}>
              {mode.badge}
            </span>
          )}
        </div>
        <p className="fc-body text-fg-2 mt-1 line-clamp-2">{mode.description}</p>
        <span className="fc-caption text-fg-3 mt-2 block">{mode.duration}</span>
      </div>
    </div>
  )

  if (!mode.available) {
    return <div className="opacity-60 cursor-not-allowed">{inner}</div>
  }

  return <Link href={mode.href}>{inner}</Link>
}
