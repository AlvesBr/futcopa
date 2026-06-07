'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  root.setAttribute('data-theme', resolved)
  if (resolved === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('fc-theme') as Theme | null
    const initial = stored ?? 'system'
    setThemeState(initial)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    function resolve(t: Theme): 'light' | 'dark' {
      if (t === 'system') return mq.matches ? 'dark' : 'light'
      return t
    }

    const resolved = resolve(theme)
    setResolvedTheme(resolved)
    applyTheme(resolved)

    if (theme === 'system') {
      const handler = (e: MediaQueryListEvent) => {
        const r = e.matches ? 'dark' : 'light'
        setResolvedTheme(r)
        applyTheme(r)
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
    if (t === 'system') localStorage.removeItem('fc-theme')
    else localStorage.setItem('fc-theme', t)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/* Inline script injected in <head> to set theme before first paint (no flash). */
export const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('fc-theme');
    var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (dark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`
