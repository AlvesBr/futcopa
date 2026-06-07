'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal, Toast } from '@/components/ui'
import { RANK_TO_LEVEL } from '@/lib/types'
import { createBrowserClient } from '@/lib/supabase'
import type { SlotEntry, Rank, Level, PuzzleStats } from '@/lib/types'

interface ResultModalProps {
  open: boolean
  onClose: () => void
  score: number
  slots: Record<number, SlotEntry | null>
  usedHelp: boolean
  puzzleDate: string
  category: string
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
              className="w-full py-3 rounded-pill font-bold bg-primary text-[var(--on-primary)] border-none cursor-pointer hover:brightness-105 transition-[filter] duration-[var(--dur-1)]"
            >
              Compartilhar resultado
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-pill font-bold border border-[var(--border-strong)] bg-surface-2 text-fg cursor-pointer hover:bg-surface-3 transition-colors duration-[var(--dur-1)]"
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
