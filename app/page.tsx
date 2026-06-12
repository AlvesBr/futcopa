'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/components/ThemeProvider'

/* Countdown until midnight (próximo puzzle) */
function useCountdown() {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    function calc() {
      const now  = new Date()
      const next = new Date(now)
      next.setHours(24, 0, 0, 0)
      const diff = next.getTime() - now.getTime()
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
      setRemaining(`${h}:${m}:${s}`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return remaining
}

export default function HomePage() {
  const { resolvedTheme, setTheme } = useTheme()
  const countdown = useCountdown()

  /* Today's date → play URL (timezone local, igual a todayDate() do servidor) */
  const today = new Date().toLocaleDateString('en-CA')

  return (
    <div className="fc-stage">
      <div className="fc-phone">

        {/* ── Home: football pitch ───────────────────────── */}
        <div className="fc-home">

          {/* Upper bar */}
          <div className="flex items-center justify-between px-4 pt-4 pb-0">
            <div className="fc-marquee">
              <span className="fc-live-dot" />
              Copa 2026 · Ao Vivo
            </div>
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="fc-iconbtn"
              aria-label="Alternar tema"
            >
              {resolvedTheme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Hero: wordmark + tagline */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <Image
              src="/assets/logo-mark.svg"
              alt="FutCopa logo"
              width={88}
              height={88}
              priority
            />
            <div
              style={{
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                fontSize: 'clamp(56px, 15vw, 84px)',
                lineHeight: 0.9,
                letterSpacing: '-.01em',
              }}
            >
              <span style={{ color: 'var(--grass-300)' }}>FUT</span>
              <span style={{ color: 'var(--gold-400)' }}>COPA</span>
            </div>

            <p
              className="fc-sub"
              style={{ maxWidth: 300, marginTop: 6, color: '#cfe9d6', fontSize: 16, lineHeight: 1.5 }}
            >
              O gameshow para apaixonados por Copa do Mundo. Monte o pódio de 10 craques todo dia.
            </p>

            {/* Countdown */}
            <div className="fc-countdown mt-1">
              <p className="lab">Próximo desafio em</p>
              <p className="clk fc-tnum">{countdown}</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 px-5 pb-8">
            <Link
              href={`/play/${today}`}
              className="fc-btn fc-btn--primary fc-btn--block"
            >
              Jogar agora
            </Link>
            <Link
              href="/copa-dos-sonhos"
              className="fc-btn fc-btn--ghost fc-btn--block"
              style={{ gap: 8 }}
            >
              🏆 Copa dos Sonhos
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
