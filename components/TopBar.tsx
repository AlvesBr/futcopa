'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import { Icon } from '@/components/ui'

interface TopBarProps {
  onHelp?:       () => void
  helpUsed?:     boolean
  helpActive?:   boolean
  onShowResult?: () => void
  backHref?:     string
}

export function TopBar({
  onHelp,
  helpUsed     = false,
  helpActive   = false,
  onShowResult,
  backHref,
}: TopBarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const helpDisabled = helpUsed || helpActive || !onHelp

  return (
    <header className="fc-topbar">

      {/* Wordmark */}
      <Link href="/" className="fc-wm" aria-label="FutCopa — início">
        <Image src="/assets/logo-mark.svg" alt="" width={28} height={28} />
        <span className="fc-wm-text">
          <span className="a">Fut</span><span className="b">Copa</span>
        </span>
      </Link>

      {/* Back link (optional) */}
      {backHref && (
        <Link href={backHref} className="fc-iconbtn" aria-label="Voltar" title="Voltar">
          <Icon name="left" size={20} />
        </Link>
      )}

      {/* Result (when done) */}
      {onShowResult && (
        <button
          onClick={onShowResult}
          className="fc-iconbtn"
          aria-label="Ver resultado"
          title="Ver resultado"
        >
          <Icon name="trophy" size={20} />
        </button>
      )}

      {/* Help (Dica) */}
      {onHelp != null && (
        <button
          onClick={helpDisabled ? undefined : onHelp}
          disabled={helpDisabled}
          aria-label={helpUsed ? 'Dica já usada' : 'Usar dica'}
          title={helpActive ? 'Dica ativa…' : helpUsed ? 'Dica já usada' : 'Dica (1×)'}
          className="fc-iconbtn"
          style={
            helpActive
              ? { background: 'var(--warning-bg)', color: 'var(--warning-ink)' }
              : helpUsed
                ? { opacity: 0.4, cursor: 'not-allowed' }
                : undefined
          }
        >
          <Icon name="hint" size={20} />
        </button>
      )}

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="fc-iconbtn"
        aria-label="Alternar tema"
        title={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo escuro'}
      >
        {resolvedTheme === 'dark' ? (
          <Icon name="sun" size={20} />
        ) : (
          <Icon name="moon" size={20} />
        )}
      </button>

    </header>
  )
}
