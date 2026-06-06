'use client'

import { cn } from '@/lib/cn'
import type { DraftSlot, Formation } from '@/lib/types'
import { FORMATION_SLOTS } from '@/lib/cupData'

// Posições (x%, y%) no campo visual para cada slot, indexadas por formação
// y=0 = goleiro (base), y=100 = ataque (topo)
const SLOT_POSITIONS: Record<string, { x: number; y: number }[]> = {
  '4-3-3': [
    { x: 50, y:  5 }, // GOL
    { x: 15, y: 27 }, // LD
    { x: 37, y: 27 }, // ZAG
    { x: 63, y: 27 }, // ZAG
    { x: 85, y: 27 }, // LE
    { x: 25, y: 54 }, // MEI
    { x: 50, y: 54 }, // MEI
    { x: 75, y: 54 }, // MEI
    { x: 15, y: 80 }, // PD
    { x: 50, y: 82 }, // CA
    { x: 85, y: 80 }, // PE
  ],
  '4-4-2': [
    { x: 50, y:  5 }, // GOL
    { x: 15, y: 27 }, { x: 37, y: 27 }, { x: 63, y: 27 }, { x: 85, y: 27 }, // defesa
    { x: 15, y: 57 }, { x: 37, y: 57 }, { x: 63, y: 57 }, { x: 85, y: 57 }, // meio
    { x: 35, y: 82 }, { x: 65, y: 82 }, // ataque
  ],
  '4-2-3-1': [
    { x: 50, y:  5 },
    { x: 15, y: 25 }, { x: 37, y: 25 }, { x: 63, y: 25 }, { x: 85, y: 25 },
    { x: 35, y: 50 }, { x: 65, y: 50 },
    { x: 15, y: 70 }, { x: 50, y: 70 }, { x: 85, y: 70 },
    { x: 50, y: 88 },
  ],
  '4-2-4': [
    { x: 50, y:  5 },
    { x: 15, y: 27 }, { x: 37, y: 27 }, { x: 63, y: 27 }, { x: 85, y: 27 },
    { x: 35, y: 55 }, { x: 65, y: 55 },
    { x: 15, y: 80 }, { x: 37, y: 80 }, { x: 63, y: 80 }, { x: 85, y: 80 },
  ],
  '3-5-2': [
    { x: 50, y:  5 },
    { x: 25, y: 27 }, { x: 50, y: 27 }, { x: 75, y: 27 },
    { x: 10, y: 55 }, { x: 30, y: 55 }, { x: 50, y: 55 }, { x: 70, y: 55 }, { x: 90, y: 55 },
    { x: 35, y: 82 }, { x: 65, y: 82 },
  ],
  '5-3-2': [
    { x: 50, y:  5 },
    { x:  8, y: 27 }, { x: 27, y: 27 }, { x: 50, y: 27 }, { x: 73, y: 27 }, { x: 92, y: 27 },
    { x: 25, y: 57 }, { x: 50, y: 57 }, { x: 75, y: 57 },
    { x: 35, y: 82 }, { x: 65, y: 82 },
  ],
  '4-5-1': [
    { x: 50, y:  5 },
    { x: 15, y: 27 }, { x: 37, y: 27 }, { x: 63, y: 27 }, { x: 85, y: 27 },
    { x: 10, y: 57 }, { x: 30, y: 57 }, { x: 50, y: 57 }, { x: 70, y: 57 }, { x: 90, y: 57 },
    { x: 50, y: 84 },
  ],
  '3-4-3': [
    { x: 50, y:  5 },
    { x: 25, y: 27 }, { x: 50, y: 27 }, { x: 75, y: 27 },
    { x: 15, y: 57 }, { x: 37, y: 57 }, { x: 63, y: 57 }, { x: 85, y: 57 },
    { x: 15, y: 82 }, { x: 50, y: 82 }, { x: 85, y: 82 },
  ],
}

interface SlotData {
  pos:       string
  idx:       number
  pick:      DraftSlot | null
  pickable:  boolean   // slot compatível com jogador selecionado
}

interface FormationPitchProps {
  formation:         Formation
  picks:             DraftSlot[]
  compatibleSlots:   string[]  // lista de "POS-idx" compatíveis com jogador selecionado
  onSlotClick:       (pos: string, idx: number) => void
}

export function FormationPitch({
  formation,
  picks,
  compatibleSlots,
  onSlotClick,
}: FormationPitchProps) {
  const slotTypes = FORMATION_SLOTS[formation] ?? []
  const positions = SLOT_POSITIONS[formation] ?? []

  // Construir mapa pick: "POS-idx" → DraftSlot
  const pickMap = new Map(picks.map(p => [`${p.position}-${p.slotIndex}`, p]))

  // Contar ocorrências de cada posição para indexação
  const posCounts: Record<string, number> = {}
  const slots: SlotData[] = slotTypes.map(pos => {
    const idx      = posCounts[pos] ?? 0
    posCounts[pos] = idx + 1
    const key      = `${pos}-${idx}`
    return {
      pos,
      idx,
      pick:    pickMap.get(key) ?? null,
      pickable: compatibleSlots.includes(key),
    }
  })

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden"
      style={{ paddingBottom: '130%', background: 'var(--grass-50, #1a4a2e)' }}
    >
      {/* Linhas do campo */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 100 130"
        preserveAspectRatio="none"
      >
        <rect x="10" y="5"  width="80" height="120" fill="none" stroke="white" strokeWidth="0.8"/>
        <line x1="10" y1="65" x2="90" y2="65" stroke="white" strokeWidth="0.6"/>
        <circle cx="50" cy="65" r="12" fill="none" stroke="white" strokeWidth="0.6"/>
        <rect x="30" y="5"  width="40" height="18" fill="none" stroke="white" strokeWidth="0.5"/>
        <rect x="30" y="107" width="40" height="18" fill="none" stroke="white" strokeWidth="0.5"/>
      </svg>

      {/* Slots dos jogadores */}
      {slots.map((slot, i) => {
        const pos = positions[i] as { x: number; y: number } | undefined
        if (!pos) return null
        return (
          <PitchSlot
            key={`${slot.pos}-${slot.idx}`}
            slot={slot}
            x={pos.x}
            y={pos.y}
            onClick={() => onSlotClick(slot.pos, slot.idx)}
          />
        )
      })}
    </div>
  )
}

// ── Slot individual no campo ──────────────────────────────────────────────────

function PitchSlot({
  slot,
  x,
  y,
  onClick,
}: {
  slot:    SlotData
  x:       number
  y:       number
  onClick: () => void
}) {
  const { pick, pickable, pos } = slot
  const filled   = pick !== null

  return (
    <button
      onClick={onClick}
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      className={cn(
        'absolute flex flex-col items-center gap-0.5 transition-all duration-150',
        'focus:outline-none',
        pickable && !filled && 'scale-110',
      )}
    >
      {/* Círculo do slot */}
      <div className={cn(
        'w-9 h-9 rounded-full border-2 flex items-center justify-center text-center transition-colors',
        filled
          ? 'bg-[var(--gold-100,#f5c518)] border-[var(--gold-400,#c9a227)] shadow-md'
          : pickable
            ? 'bg-primary/80 border-primary shadow-glow animate-pulse'
            : 'bg-black/30 border-white/30',
      )}>
        {filled ? (
          <span className="fc-caption font-bold text-[10px] leading-none text-[var(--fg-on-gold,#1a1a1a)]">
            {pick!.player.squad_number ?? pick!.player.name.slice(0, 2).toUpperCase()}
          </span>
        ) : (
          <span className="fc-caption text-white/60 text-[10px]">{pos}</span>
        )}
      </div>

      {/* Nome abaixo do disco */}
      {filled && (
        <span className="fc-caption text-white text-[9px] font-bold leading-none max-w-[56px] truncate text-center drop-shadow">
          {(pick?.player.name.split(' ').pop() ?? '').toUpperCase()}
        </span>
      )}
    </button>
  )
}
