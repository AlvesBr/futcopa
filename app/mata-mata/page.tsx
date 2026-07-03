'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

const TEAMS = [
  { id: 'brazil',      name: 'Brasil',     flag: '🇧🇷' },
  { id: 'france',      name: 'França',     flag: '🇫🇷' },
  { id: 'argentina',   name: 'Argentina',  flag: '🇦🇷' },
  { id: 'portugal',    name: 'Portugal',   flag: '🇵🇹' },
  { id: 'england',     name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'germany',     name: 'Alemanha',   flag: '🇩🇪' },
  { id: 'spain',       name: 'Espanha',    flag: '🇪🇸' },
  { id: 'morocco',     name: 'Marrocos',   flag: '🇲🇦' },
  { id: 'netherlands', name: 'Holanda',    flag: '🇳🇱' },
  { id: 'usa',         name: 'EUA',        flag: '🇺🇸' },
]

const RANK_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: 'CAMPEÃO',  color: '#ffc21e' },
  2: { label: 'VICE',     color: '#82b598' },
  3: { label: 'SEMI',     color: '#82b598' },
  4: { label: 'SEMI',     color: '#82b598' },
  5: { label: 'QUARTAS',  color: '#4a8b60' },
  6: { label: 'QUARTAS',  color: '#4a8b60' },
  7: { label: 'QUARTAS',  color: '#4a8b60' },
  8: { label: 'QUARTAS',  color: '#4a8b60' },
  9: { label: 'OITAVAS',  color: '#2a6b41' },
  10: { label: 'OITAVAS', color: '#2a6b41' },
}

export default function MataMataPredictionPage() {
  const [order, setOrder] = useState(TEAMS.map(t => t.id))
  const [selected, setSelected] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleTap = useCallback((id: string) => {
    if (!selected) {
      setSelected(id)
      return
    }
    if (selected === id) {
      setSelected(null)
      return
    }
    setOrder(prev => {
      const arr = [...prev]
      const a = arr.indexOf(selected)
      const b = arr.indexOf(id)
      ;[arr[a], arr[b]] = [arr[b]!, arr[a]!]
      return arr
    })
    setSelected(null)
  }, [selected])

  const buildShareText = useCallback(() => {
    const lines = order.map((id, i) => {
      const team = TEAMS.find(t => t.id === id)!
      const { label } = RANK_LABEL[i + 1] ?? { label: '' }
      return `${i + 1}. ${team.flag} ${team.name} — ${label}`
    })
    return [
      '🏆 FutCopa · Copa 2026',
      'Minha previsão do mata-mata:',
      '',
      ...lines,
      '',
      'futcopa.vercel.app/mata-mata',
    ].join('\n')
  }, [order])

  const handleShare = async () => {
    const text = buildShareText()
    try {
      if (navigator.share) {
        await navigator.share({ text })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  const reset = () => {
    setOrder(TEAMS.map(t => t.id))
    setSelected(null)
  }

  return (
    <div className="fc-stage">
      <div className="fc-phone" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

        {/* header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 16px 8px',
          borderBottom: '1px solid var(--border)',
        }}>
          <Link href="/" style={{
            color: 'var(--fg-2)',
            textDecoration: 'none',
            fontSize: 22,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
          }}>←</Link>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--grass-300)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Copa 2026
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-2)' }}>Mata-Mata · Quem vai mais longe?</p>
          </div>
          <button
            onClick={reset}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--fg-2)',
              fontSize: 12,
              padding: '4px 10px',
              cursor: 'pointer',
            }}
          >
            Resetar
          </button>
        </div>

        {/* instructions */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
        }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>
            {selected
              ? `✋ "${TEAMS.find(t => t.id === selected)?.name}" selecionada — toque outra para trocar de posição`
              : 'Toque uma seleção para selecioná-la, depois toque outra para trocar de lugar'}
          </p>
        </div>

        {/* team list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 8px' }}>
          {order.map((id, i) => {
            const team = TEAMS.find(t => t.id === id)!
            const rank = i + 1
            const rl = RANK_LABEL[rank]!
            const isSelected = selected === id

            return (
              <button
                key={id}
                onClick={() => handleTap(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 14px',
                  marginBottom: 6,
                  background: isSelected
                    ? 'var(--surface-3)'
                    : 'var(--surface-2)',
                  border: isSelected
                    ? '2px solid var(--grass-400)'
                    : '2px solid transparent',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease',
                  boxShadow: isSelected ? '0 0 0 3px rgba(91,184,27,0.2)' : 'none',
                }}
              >
                {/* rank number */}
                <span style={{
                  minWidth: 28,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 15,
                  fontWeight: 700,
                  color: rank === 1 ? '#ffc21e' : 'var(--fg-2)',
                }}>
                  {rank}
                </span>

                {/* flag */}
                <span style={{ fontSize: 28, lineHeight: 1 }}>{team.flag}</span>

                {/* name */}
                <span style={{
                  flex: 1,
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--fg)',
                }}>
                  {team.name}
                </span>

                {/* phase badge */}
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: rl.color,
                  background: `${rl.color}20`,
                  padding: '3px 8px',
                  borderRadius: 6,
                }}>
                  {rl.label}
                </span>

                {/* drag handle hint */}
                <span style={{ color: 'var(--fg-3)', fontSize: 16, lineHeight: 1 }}>⇅</span>
              </button>
            )
          })}
        </div>

        {/* legend */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          {[
            { label: 'Campeão', color: '#ffc21e' },
            { label: 'Semi', color: '#82b598' },
            { label: 'Quartas', color: '#4a8b60' },
            { label: 'Oitavas', color: '#2a6b41' },
          ].map(({ label, color }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--fg-2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </div>

        {/* share CTA */}
        <div style={{ padding: '12px 16px 20px', display: 'flex', gap: 10 }}>
          <button
            onClick={handleShare}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 'var(--radius-pill)',
              background: '#ef4444', // Red color for eye-catching effect
              color: 'white',
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
            }}
            className={!copied ? 'animate-pulse' : ''} // Apply blinking animation conditionally
          >
            {copied ? '✓ Copiado!' : 'Mata a mata'}
          </button>
        </div>

      </div>
    </div>
  )
}
