'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal, Toast, Icon } from '@/components/ui'
import { RANK_TO_LEVEL } from '@/lib/types'
import { createBrowserClient } from '@/lib/supabase'
import type { SlotEntry, Rank, Level, PuzzleStats, PuzzlePlayer } from '@/lib/types'

interface ResultModalProps {
  open: boolean
  onClose: () => void
  score: number
  slots: Record<number, SlotEntry | null>
  usedHelp: boolean
  puzzleDate: string
  category: string
  players: PuzzlePlayer[]
}

/* ─── share text ─── */

function buildShareText(
  date: string,
  category: string,
  slots: Record<number, SlotEntry | null>,
  score: number,
  usedHelp: boolean,
): string {
  const [yyyy, mm, dd] = date.split('-')
  const dateFmt = `${dd}/${mm}/${yyyy}`

  const levels: Record<Level, string[]> = { 1: [], 2: [], 3: [], 4: [] }
  for (let rank = 1; rank <= 10; rank++) {
    const level = RANK_TO_LEVEL[rank as Rank]
    const slot = slots[rank]
    levels[level].push(slot ? (slot.correct ? '🟩' : '🟥') : '⬜')
  }
  const pyramid = ([1, 2, 3, 4] as Level[]).map(l => levels[l].join('')).join('\n')
  const hint = usedHelp ? 'com dica 💡' : 'sem dica'

  return [
    `⚽ FutCopa — ${dateFmt}`,
    `🏆 ${category}`,
    '',
    pyramid,
    '',
    `${score}/10 — ${hint}`,
    'futcopa.vercel.app',
  ].join('\n')
}

/* ─── stories canvas share (9:16) ─── */

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, x, currentY)
  return currentY + lineHeight
}

async function generateStoriesImage(
  date: string,
  category: string,
  score: number,
  usedHelp: boolean,
  slots: Record<number, SlotEntry | null>,
): Promise<Blob | null> {
  const W = 1080, H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  /* background */
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#04140c')
  bg.addColorStop(1, '#0c3119')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  /* decorative circles */
  ctx.save()
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#57a010'
  ctx.beginPath(); ctx.arc(W * 0.85, H * 0.12, 360, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(W * 0.15, H * 0.88, 300, 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  /* logo */
  ctx.textAlign = 'center'
  ctx.font = 'bold 100px "Russo One", Helvetica, sans-serif'
  ctx.fillStyle = '#bbe75a'
  ctx.fillText('FUT', W / 2 - 105, 300)
  ctx.fillStyle = '#ffc21e'
  ctx.fillText('COPA', W / 2 + 108, 300)

  /* divider */
  ctx.strokeStyle = '#2a6b41'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(80, 330); ctx.lineTo(W - 80, 330); ctx.stroke()

  /* date */
  const [yyyy, mm, dd] = date.split('-')
  ctx.fillStyle = '#82b598'
  ctx.font = '52px "Hanken Grotesk", Helvetica, sans-serif'
  ctx.fillText(`${dd}/${mm}/${yyyy}`, W / 2, 405)

  /* category */
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 58px "Hanken Grotesk", Helvetica, sans-serif'
  const afterCat = wrapText(ctx, category, W / 2, 490, W - 140, 74)

  /* score */
  ctx.fillStyle = '#ffc21e'
  ctx.font = 'bold 260px "Hanken Grotesk", Helvetica, sans-serif'
  ctx.fillText(String(score), W / 2, afterCat + 280)
  ctx.fillStyle = '#82b598'
  ctx.font = 'bold 80px "Hanken Grotesk", Helvetica, sans-serif'
  ctx.fillText('/ 10', W / 2, afterCat + 375)

  /* pyramid */
  const levels: Record<Level, string[]> = { 1: [], 2: [], 3: [], 4: [] }
  for (let rank = 1; rank <= 10; rank++) {
    const level = RANK_TO_LEVEL[rank as Rank]
    const slot = slots[rank]
    levels[level].push(slot ? (slot.correct ? '🟩' : '🟥') : '⬜')
  }
  ctx.font = '130px serif'
  let py = afterCat + 470
  for (const lv of [1, 2, 3, 4] as Level[]) {
    ctx.fillText(levels[lv].join(''), W / 2, py)
    py += 155
  }

  /* hint */
  if (usedHelp) {
    ctx.fillStyle = '#82b598'
    ctx.font = '50px "Hanken Grotesk", Helvetica, sans-serif'
    ctx.fillText('(com dica 💡)', W / 2, py + 20)
  }

  /* url */
  ctx.strokeStyle = '#2a6b41'
  ctx.beginPath(); ctx.moveTo(80, H - 130); ctx.lineTo(W - 80, H - 130); ctx.stroke()
  ctx.fillStyle = '#82b598'
  ctx.font = '52px "Hanken Grotesk", Helvetica, sans-serif'
  ctx.fillText('futcopa.vercel.app', W / 2, H - 65)

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  /* execCommand fallback for HTTP / older browsers */
  const el = document.createElement('textarea')
  el.value = text
  el.style.position = 'fixed'
  el.style.opacity = '0'
  document.body.appendChild(el)
  el.focus()
  el.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(el)
  if (!ok) throw new Error('execCommand failed')
}

/* ─── pyramid emoji for modal display ─── */

function buildPyramidEmoji(slots: Record<number, SlotEntry | null>): string {
  const levels: Record<Level, string[]> = { 1: [], 2: [], 3: [], 4: [] }
  for (let rank = 1; rank <= 10; rank++) {
    const level = RANK_TO_LEVEL[rank as Rank]
    const slot = slots[rank]
    levels[level].push(slot ? (slot.correct ? '🟩' : '🟥') : '⬜')
  }
  return ([1, 2, 3, 4] as Level[]).map(l => levels[l].join('')).join('\n')
}

/* ─── countdown ─── */

function msUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setDate(midnight.getDate() + 1)
  midnight.setHours(0, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}

function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

function useCountdown(): string {
  const [remaining, setRemaining] = useState(msUntilMidnight)

  useEffect(() => {
    const id = setInterval(() => setRemaining(msUntilMidnight()), 1000)
    return () => clearInterval(id)
  }, [])

  return formatMs(remaining)
}

/* ─── component ─── */

export function ResultModal({
  open,
  onClose,
  score,
  slots,
  usedHelp,
  puzzleDate,
  category,
  players,
}: ResultModalProps) {
  const countdown = useCountdown()
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)
  const [stats, setStats] = useState<Pick<PuzzleStats, 'total_plays' | 'avg_score' | 'perfect_scores'> | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  /* fetch community stats when modal opens */
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setStatsLoading(true)
    ;(async () => {
      try {
        const sb = createBrowserClient()
        const { data } = await sb
          .from('puzzle_stats')
          .select('total_plays, avg_score, perfect_scores')
          .eq('puzzle_date', puzzleDate)
          .single()
        if (!cancelled) setStats(data ?? null)
      } catch {
        /* stats are non-critical — fail silently */
      } finally {
        if (!cancelled) setStatsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [open, puzzleDate])

  const handleShare = useCallback(async () => {
    const text = buildShareText(puzzleDate, category, slots, score, usedHelp)
    try {
      await copyToClipboard(text)
      setToast({ message: 'Copiado!', variant: 'success' })
    } catch {
      setToast({ message: 'Não foi possível copiar', variant: 'error' })
    }
  }, [puzzleDate, category, slots, score, usedHelp])

  const handleShareStories = useCallback(async () => {
    try {
      const blob = await generateStoriesImage(puzzleDate, category, score, usedHelp, slots)
      if (!blob) throw new Error('canvas failed')
      const file = new File([blob], `futcopa-${puzzleDate}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'FutCopa', text: `${score}/10 — ${category}` })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `futcopa-${puzzleDate}.png`
        a.click()
        URL.revokeObjectURL(url)
        setToast({ message: 'Imagem salva!', variant: 'success' })
      }
    } catch {
      setToast({ message: 'Erro ao gerar imagem', variant: 'error' })
    }
  }, [puzzleDate, category, slots, score, usedHelp])

  const dash = (v: number | null | undefined) =>
    v != null ? String(v) : '—'

  return (
    <>
      <Modal open={open} onClose={onClose} title="Resultado">
        <div className="flex flex-col items-center gap-5 py-2">
          {/* score */}
          <div className="text-center">
            <p className="font-bold text-primary" style={{ fontSize: '3rem', lineHeight: 1 }}>
              {score}<span className="text-fg-2 text-3xl"> / 10</span>
            </p>
            {usedHelp && (
              <span className="fc-caption text-fg-2 mt-1 block">(com dica 💡)</span>
            )}
          </div>

          {/* pyramid emoji */}
          <pre className="text-2xl leading-loose text-center bg-surface-2 rounded-xl px-8 py-4 font-mono select-all">
            {buildPyramidEmoji(slots)}
          </pre>

          {/* gabarito — ordem correta com acerto/erro do usuário */}
          <div className="w-full">
            <p className="fc-caption text-fg-2 mb-2 text-center font-semibold">Gabarito</p>
            <ul className="flex flex-col gap-1">
              {[...players]
                .sort((a, b) => a.correct_rank - b.correct_rank)
                .map(p => {
                  const placedRank = (Object.entries(slots) as [string, SlotEntry | null][])
                    .find(([, e]) => e?.playerId === p.player_id)?.[0]
                  const placedLevel = placedRank
                    ? RANK_TO_LEVEL[Number(placedRank) as Rank]
                    : undefined
                  const ok = placedLevel === p.correct_level
                  return (
                    <li
                      key={p.player_id}
                      className="flex items-center gap-2 bg-surface-2 rounded-md px-3 py-1.5"
                    >
                      <span className="w-5 shrink-0 text-center font-bold text-fg-2 text-sm">
                        {p.correct_rank}
                      </span>
                      <span className="flex-1 min-w-0 text-sm font-medium text-fg overflow-hidden text-ellipsis whitespace-nowrap">
                        {p.name}
                      </span>
                      {!ok && placedLevel != null && (
                        <span className="fc-caption text-fg-3 whitespace-nowrap">
                          você: Nv {placedLevel}
                        </span>
                      )}
                      <span className="fc-caption text-fg-2 shrink-0">{p.value}</span>
                      <span
                        aria-label={ok ? 'Acertou' : 'Errou'}
                        className={ok ? 'text-[var(--success)] shrink-0' : 'text-[var(--error)] shrink-0'}
                      >
                        {ok ? <Icon name="check" size={16} strokeWidth={3} /> : <Icon name="x" size={16} strokeWidth={3} />}
                      </span>
                    </li>
                  )
                })}
            </ul>
          </div>

          {/* community stats */}
          <div className="w-full grid grid-cols-3 gap-2 text-center">
            {(
              [
                { label: 'Jogadas', value: dash(stats?.total_plays) },
                { label: 'Média', value: statsLoading ? '…' : dash(stats?.avg_score) },
                { label: '10/10', value: statsLoading ? '…' : (stats?.perfect_scores != null && stats?.total_plays ? `${Math.round((stats.perfect_scores / stats.total_plays) * 100)}%` : '—') },
              ] as const
            ).map(({ label, value }) => (
              <div key={label} className="bg-surface-2 rounded-xl py-3">
                <p className="font-bold text-fg text-lg leading-none">{value}</p>
                <p className="fc-caption text-fg-2 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* countdown */}
          <div className="text-center">
            <p className="fc-caption text-fg-2">Próximo puzzle em</p>
            <p className="font-bold text-fg font-mono text-xl">{countdown}</p>
          </div>

          {/* actions */}
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={handleShare}
              className="fc-btn fc-btn--primary fc-btn--block"
            >
              <Icon name="share" size={20} />
              Compartilhar resultado
            </button>
            <button
              onClick={handleShareStories}
              className="fc-btn fc-btn--secondary fc-btn--block"
            >
              <Icon name="share" size={20} />
              Salvar para Stories
            </button>
            <button
              onClick={onClose}
              className="fc-btn fc-btn--ghost fc-btn--block"
            >
              Ver pirâmide
            </button>
          </div>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  )
}
