'use client'

import { useTheme } from '@/components/ThemeProvider'
import { IconButton } from '@/components/ui'

interface TopBarProps {
  title?: string
  onHelp?: () => void
  helpUsed?: boolean
  helpActive?: boolean
  onShowResult?: () => void
}

export function TopBar({
  title = 'FutCopa',
  onHelp,
  helpUsed = false,
  helpActive = false,
  onShowResult,
}: TopBarProps) {
  const { resolvedTheme, setTheme } = useTheme()

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const helpDisabled = helpUsed || helpActive || !onHelp
  const helpLabel = helpActive ? '✨ Dica…' : helpUsed ? '💡 Usado' : '? Ajuda'

  return (
    <header className="w-full flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-surface">
      <span className="fc-label-lg font-bold text-primary tracking-wide">{title}</span>
      <div className="flex items-center gap-2">
        {onShowResult && (
          <button
            onClick={onShowResult}
            className="fc-caption font-semibold text-fg-2 hover:text-fg px-3 py-1 rounded-pill bg-surface-2 border border-[var(--border)] cursor-pointer transition-colors duration-[var(--dur-1)]"
          >
            Resultado
          </button>
        )}
        {onHelp != null && (
          <button
            onClick={helpDisabled ? undefined : onHelp}
            disabled={helpDisabled}
            aria-label="Ajuda"
            className={[
              'px-3 py-1.5 rounded-pill fc-caption font-bold border transition-colors duration-[var(--dur-1)]',
              helpDisabled
                ? 'bg-surface-2 text-fg-3 border-[var(--border)] cursor-not-allowed'
                : 'bg-surface-2 text-fg border-[var(--border)] cursor-pointer hover:border-primary hover:text-primary',
            ].join(' ')}
          >
            {helpLabel}
          </button>
        )}
        <IconButton label="Alternar tema" onClick={toggleTheme}>
          {resolvedTheme === 'dark' ? '☀️' : '🌙'}
        </IconButton>
      </div>
    </header>
  )
}
