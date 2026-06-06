import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'FutCopa — Pirâmide diária da Copa do Mundo'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
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
          gap: 24,
        }}
      >
        <span style={{ fontSize: 120, lineHeight: 1 }}>⚽</span>
        <span
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: '#e8f5ef',
            letterSpacing: '-2px',
          }}
        >
          FutCopa
        </span>
        <span
          style={{
            fontSize: 36,
            color: '#7ecba8',
            marginTop: -8,
          }}
        >
          Pirâmide diária da Copa do Mundo
        </span>
        <span
          style={{
            fontSize: 24,
            color: '#4a8a6a',
            marginTop: 16,
          }}
        >
          futcopa.vercel.app
        </span>
      </div>
    ),
    { ...size },
  )
}
