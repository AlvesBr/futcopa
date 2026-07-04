'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import type { Formation, DraftMode } from '@/lib/types'
import { createEmptyDraftState, saveDraftState } from '@/lib/draftState'
import { useTheme } from '@/components/ThemeProvider'

const FORMATIONS: Formation[] = [
  '4-3-3', '4-4-2', '4-2-3-1', '4-2-4',
  '3-5-2', '5-3-2', '4-5-1',   '3-4-3',
]

const MODES = [
  {
    id:    'classico'  as DraftMode,
    icon:  '⚽',
    title: 'Clássico',
    desc:  'Você vê o rating de cada jogador.',
  },
  {
    id:    'almanaque' as DraftMode,
    icon:  '📖',
    title: 'De Almanaque',
    desc:  'Ratings ocultos — só a memória salva.',
  },
]

export default function CopaDosSonhosPage() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [formation, setFormation] = useState<Formation>('4-3-3')
  const [mode, setMode]           = useState<DraftMode>('classico')

  function handleStart() {
    const state = createEmptyDraftState(formation, mode)
    saveDraftState(state)
    router.push('/copa-dos-sonhos/draft')
  }

  return (
    <div className="fc-stage">
      <div className="fc-phone">

        {/* ── Top bar ───────────────────────────────────── */}
        <header className="fc-topbar">
          <Link href="/" className="fc-wm" aria-label="FutCopa — início">
            <Image src="/assets/logo-mark.svg" alt="" width={28} height={28} />
            <span className="fc-wm-text">
              <span className="a">Fut</span><span className="b">Copa</span>
            </span>
          </Link>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="fc-iconbtn"
            aria-label="Alternar tema"
          >
            {resolvedTheme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        {/* ── Hero banner ───────────────────────────────── */}
        <div
          style={{
            background: 'var(--grad-night)',
            padding: '28px 20px 24px',
            textAlign: 'center',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              fontSize: 'clamp(26px, 7vw, 36px)',
              lineHeight: 1,
              letterSpacing: '-.01em',
              color: 'var(--gold-400)',
              marginBottom: 6,
            }}
          >
            Copa dos Sonhos
          </p>
          <p style={{ color: 'var(--fg-3)', fontSize: 14, lineHeight: 1.5 }}>
            Role o dado · Sorteie seleções históricas · Escale 11 craques · Simule a Copa
          </p>

          {/* Como funciona */}
          <div className="flex justify-center gap-8 mt-5">
            {[
              { icon: '🎲', label: 'Role',   desc: 'Sorteia seleção + Copa' },
              { icon: '🧩', label: 'Monte',  desc: 'Escolha um craque' },
              { icon: '🏆', label: 'Simule', desc: 'Veja se vai longe' },
            ].map(step => (
              <div key={step.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, lineHeight: 1 }}>{step.icon}</div>
                <p style={{ fontWeight: 800, fontSize: 13, color: 'var(--fg)', marginTop: 4 }}>
                  {step.label}
                </p>
                <p style={{ fontSize: 11, color: 'var(--fg-3)', maxWidth: 70, margin: '2px auto 0' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Settings ──────────────────────────────────── */}
        <div style={{ flex: 1, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Formação */}
          <section>
            <p className="fc-label" style={{ color: 'var(--fg-3)', marginBottom: 8 }}>
              Formação
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {FORMATIONS.map(f => (
                <button
                  key={f}
                  onClick={() => setFormation(f)}
                  style={{
                    padding: '9px 4px',
                    borderRadius: 'var(--r-sm)',
                    border: `2px solid ${formation === f ? 'var(--primary)' : 'var(--border-strong)'}`,
                    background: formation === f ? 'var(--primary)' : 'var(--surface)',
                    color: formation === f ? 'var(--on-primary)' : 'var(--fg)',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all var(--dur-1)',
                    boxShadow: formation === f ? 'var(--glow-grass)' : 'none',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </section>

          {/* Modo */}
          <section>
            <p className="fc-label" style={{ color: 'var(--fg-3)', marginBottom: 8 }}>
              Dificuldade
            </p>
            <div className="fc-modes" style={{ padding: 0, gap: 10 }}>
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`fc-mode ${mode === m.id ? 'fc-mode--sel' : ''}`}
                >
                  <div className="fc-mode-badge">{m.icon}</div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p className="fc-mode-title">{m.title}</p>
                    <p className="fc-mode-desc">{m.desc}</p>
                  </div>
                  {mode === m.id && (
                    <span style={{ color: 'var(--primary)', fontSize: 18 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Resumo */}
          <p style={{ fontSize: 12, color: 'var(--fg-3)', textAlign: 'center' }}>
            {formation} · {mode === 'classico' ? 'Clássico' : 'De Almanaque'} · Rejogável ∞
          </p>

        </div>

        {/* ── CTA fixo na base ──────────────────────────── */}
        <div
          style={{
            padding: '12px 18px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
          }}
        >
          <button
            onClick={handleStart}
            className="fc-btn fc-btn--primary fc-btn--block"
            style={{ background: 'linear-gradient(to right, var(--grass-500), var(--gold-500))' }}
          >
            🎲 Jogar agora
          </button>
        </div>

      </div>
    </div>
  )
}
