import { ImageResponse } from 'next/og'
import type { Puzzle } from '@/lib/types'

export const runtime = 'edge'
export const alt = 'FutCopa — puzzle do dia'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: { date: string }
}

async function getPuzzleCategory(date: string): Promise<string | null> {
  try {
    const { default: puzzles } = await import('@/data/puzzles.json')
    const puzzle = (puzzles as Puzzle[]).find((p) => p.date === date)
    return puzzle?.category ?? null
  } catch {
    return null
  }
}

export default async function OgImage({ params }: Props) {
  const category = /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    ? await getPuzzleCategory(params.date)
    : null

  const [yyyy, mm, dd] = params.date.split('-')
  const dateFmt = yyyy && mm && dd ? `${dd}/${mm}/${yyyy}` : params.date

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#07120d',
          gap: 20,
          padding: '0 80px',
        }}
      >
        <span style={{ fontSize: 80, lineHeight: 1 }}>⚽</span>
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#e8f5ef',
            letterSpacing: '-2px',
          }}
        >
          FutCopa
        </span>
        {category && (
          <span
            style={{
              fontSize: 38,
              color: '#7ecba8',
              textAlign: 'center',
              lineHeight: 1.3,
              marginTop: 4,
            }}
          >
            {category}
          </span>
        )}
        <span
          style={{
            fontSize: 26,
            color: '#4a8a6a',
            marginTop: category ? 12 : 4,
          }}
        >
          {dateFmt} · futcopa.vercel.app
        </span>
      </div>
    ),
    { ...size },
  )
}
