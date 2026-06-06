'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { Formation, DraftMode } from '@/lib/types'
import { createEmptyDraftState, saveDraftState } from '@/lib/draftState'

const FORMATIONS: Formation[] = [
  '4-3-3', '4-4-2', '4-2-3-1', '4-2-4',
  '3-5-2', '5-3-2', '4-5-1',   '3-4-3',
]

export default function CopaDosSonhosPage() {
  const router = useRouter()
  const [formation, setFormation] = useState<Formation>('4-3-3')
  const [mode, setMode]           = useState<DraftMode>('classico')

  function handleStart() {
    const state = createEmptyDraftState(formation, mode)
    saveDraftState(state)
    router.push('/copa-dos-sonhos/draft')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 gap-8">

      {/* Header */}
      <header className="text-center">
        <Link href="/" className="fc-caption text-fg-3 hover:text-fg mb-4 block">
          ← Voltar
        </Link>
        <h1 className="fc-title text-fg">Copa dos Sonhos</h1>
        <p className="fc-body text-fg-2 mt-2 max-w-sm mx-auto">
          Role o dado. Sorteie uma seleção e uma Copa. Escale um craque histórico.
          Complete os 11 e simule o torneio.
        </p>
      </header>

      {/* Como funciona */}
      <div className="flex gap-6 text-center">
        {[
          { icon: '🎲', label: 'Role',   desc: 'Sorteia seleção + Copa' },
          { icon: '🧩', label: 'Monte',  desc: 'Escolha um craque' },
          { icon: '🏆', label: 'Simule', desc: 'Veja se vai longe' },
        ].map(step => (
          <div key={step.label} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{step.icon}</span>
            <span className="fc-caption font-bold text-fg">{step.label}</span>
            <span className="fc-caption text-fg-3 max-w-[80px] text-center">{step.desc}</span>
          </div>
        ))}
      </div>

      {/* Seleção de formação */}
      <section className="w-full max-w-sm">
        <p className="fc-eyebrow text-fg-3 mb-2 uppercase tracking-wide">Formação</p>
        <div className="grid grid-cols-4 gap-2">
          {FORMATIONS.map(f => (
            <button
              key={f}
              onClick={() => setFormation(f)}
              className={cn(
                'py-2 px-1 rounded-sm border-2 fc-caption font-bold transition-colors',
                formation === f
                  ? 'border-primary bg-primary text-white'
                  : 'border-[var(--slot-border)] bg-[var(--surface)] text-fg hover:border-primary'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Seleção de modo */}
      <section className="w-full max-w-sm">
        <p className="fc-eyebrow text-fg-3 mb-2 uppercase tracking-wide">Dificuldade</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: 'classico',  label: 'Clássico',    desc: 'Você vê o rating de cada jogador.' },
            { id: 'almanaque', label: 'De Almanaque', desc: 'Ratings ocultos — só a memória salva.' },
          ] as { id: DraftMode; label: string; desc: string }[]).map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                'p-3 rounded-sm border-2 text-left transition-colors',
                mode === m.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-[var(--slot-border)] bg-[var(--surface)] text-fg hover:border-primary'
              )}
            >
              <span className="fc-caption font-bold block">{m.label}</span>
              <span className={cn('fc-caption block mt-0.5', mode === m.id ? 'text-white/80' : 'text-fg-3')}>
                {m.desc}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <button
        onClick={handleStart}
        className="bg-primary text-white font-bold px-8 py-3 rounded-sm hover:opacity-90 transition-opacity fc-subtitle"
      >
        Jogar agora →
      </button>

      <p className="fc-caption text-fg-3 text-center max-w-xs">
        {formation} · {mode === 'classico' ? 'Clássico' : 'De Almanaque'} · Rejogável quantas vezes quiser
      </p>

    </main>
  )
}
