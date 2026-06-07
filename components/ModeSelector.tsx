'use client'

import type { GameMode } from '@/lib/types'

interface ModeSelectorProps {
  onSelect: (mode: GameMode) => void
}

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
      <div className="text-center">
        <h2 className="fc-h2 text-fg mb-1">Escolha o modo</h2>
        <p className="fc-body text-fg-2">Como você quer jogar hoje?</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => onSelect('normal')}
          className="flex flex-col items-start gap-1 bg-surface-2 border-2 border-[var(--border)] rounded-xl px-5 py-4 cursor-pointer hover:border-primary hover:bg-surface-3 transition-colors duration-[var(--dur-1)] text-left"
        >
          <span className="fc-label-lg font-bold text-fg">⚽ Normal</span>
          <span className="fc-caption text-fg-2">Sem dicas de nível. Confie no seu conhecimento.</span>
        </button>
        <button
          onClick={() => onSelect('easy')}
          className="flex flex-col items-start gap-1 bg-surface-2 border-2 border-[var(--border)] rounded-xl px-5 py-4 cursor-pointer hover:border-primary hover:bg-surface-3 transition-colors duration-[var(--dur-1)] text-left"
        >
          <span className="fc-label-lg font-bold text-fg">📍 Fácil</span>
          <span className="fc-caption text-fg-2">Mostra o nível correto de cada jogador antes de posicionar.</span>
        </button>
      </div>
    </main>
  )
}
