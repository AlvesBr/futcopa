import type { DraftSlot } from '@/lib/types'
import { FORMATION_SLOTS } from '@/lib/cupData'
import type { Formation } from '@/lib/types'

interface BoxScoreProps {
  picks:     DraftSlot[]
  formation: Formation
}

export function BoxScore({ picks, formation }: BoxScoreProps) {
  const slots    = FORMATION_SLOTS[formation] ?? []
  const total    = slots.length  // sempre 11

  // Ratings compostos
  const attackPositions  = ['CA', 'PE', 'PD', 'MEI', 'MD', 'ME']
  const defensePositions = ['GOL', 'ZAG', 'LD', 'LE']

  function avgFor(positions: string[]) {
    const filtered = picks.filter(p => positions.includes(p.position.toUpperCase()))
    if (!filtered.length) return null
    return Math.round(filtered.reduce((s, p) => s + p.player.rating, 0) / filtered.length)
  }

  const atkRating = avgFor(attackPositions)
  const defRating = avgFor(defensePositions)

  // Mapa posição → pick (para exibição por linha)
  const pickMap = new Map(picks.map(p => [`${p.position}-${p.slotIndex}`, p]))

  // Montar linhas únicas: agrupar slots repetidos com índice
  const positionCounts: Record<string, number> = {}
  const rows = slots.map(pos => {
    const idx  = positionCounts[pos] ?? 0
    positionCounts[pos] = idx + 1
    const key  = `${pos}-${idx}`
    const pick = pickMap.get(key) ?? null
    return { pos, idx, pick }
  })

  return (
    <aside className="col-box flex flex-col gap-3 min-w-[180px]">

      {/* Contador de picks */}
      <div>
        <p className="fc-eyebrow text-fg-3 uppercase tracking-wide">
          Box score · {picks.length}/{total}
        </p>

        {/* Ratings compostos */}
        <div className="flex gap-4 mt-1">
          <div className="text-center">
            <p className="fc-title text-fg leading-none">
              {atkRating ?? '—'}
            </p>
            <p className="fc-caption text-fg-3">ataque</p>
          </div>
          <div className="text-center">
            <p className="fc-title text-fg leading-none">
              {defRating ?? '—'}
            </p>
            <p className="fc-caption text-fg-3">defesa</p>
          </div>
        </div>
      </div>

      {/* Lista posição → jogador → rating */}
      <table className="w-full border-collapse">
        <tbody>
          {rows.map(({ pos, idx, pick }) => (
            <tr key={`${pos}-${idx}`} className="border-b border-[var(--slot-border)] last:border-0">
              <td className="fc-caption text-fg-3 py-1 pr-2 w-10">{pos}</td>
              <td className="py-1 w-5 text-center text-sm leading-none">
                {pick ? pick.squadInfo.flag_emoji : ''}
              </td>
              <td className="fc-caption text-fg py-1 pl-1 flex-1 truncate max-w-[80px]">
                {pick ? pick.player.name : '—'}
              </td>
              <td className="fc-caption font-bold text-fg py-1 pl-2 text-right">
                {pick ? pick.player.rating : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </aside>
  )
}
