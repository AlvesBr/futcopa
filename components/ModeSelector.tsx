'use client'

import { useState } from 'react'
import type { GameMode } from '@/lib/types'
import { Icon } from '@/components/ui'

interface ModeSelectorProps {
  onSelect: (mode: GameMode) => void
}

const MODES = [
  {
    id:    'normal' as GameMode,
    icon:  'trophy',
    bg:    'var(--info-bg)',
    color: 'var(--info-ink)',
    title: 'Normal',
    desc:  'Sem dicas de nível. Confie no seu conhecimento.',
  },
  {
    id:    'easy' as GameMode,
    icon:  'hint',
    bg:    'var(--warning-bg)',
    color: 'var(--warning-ink)',
    title: 'Fácil',
    desc:  'Mostra o nível correto de cada jogador antes de posicionar.',
  },
]

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  const [selected, setSelected] = useState<GameMode>('normal')

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Title */}
      <div style={{ padding: '20px 18px 4px' }}>
        <h1 className="fc-h1" style={{ color: 'var(--fg)', margin: 0 }}>
          Escolha o modo
        </h1>
        <p className="fc-body" style={{ color: 'var(--fg-2)', marginTop: 6 }}>
          Você pode trocar quando quiser.
        </p>
      </div>

      {/* Mode cards */}
      <div className="fc-modes">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`fc-mode ${selected === m.id ? 'fc-mode--sel' : ''}`}
          >
            <div
              className="fc-mode-badge"
              style={{ background: m.bg, color: m.color }}
            >
              <Icon name={m.icon as any} size={24} />
            </div>
            <div className="flex-1 text-left">
              <p className="fc-mode-title">{m.title}</p>
              <p className="fc-mode-desc">{m.desc}</p>
            </div>
            {selected === m.id && (
              <span style={{ color: 'var(--primary)', fontSize: 20 }}>
                <Icon name="check" size={20} strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '4px 18px 28px', marginTop: 'auto' }}>
        <button
          className="fc-btn fc-btn--primary fc-btn--block"
          onClick={() => onSelect(selected)}
        >
          Começar →
        </button>
      </div>

    </div>
  )
}
