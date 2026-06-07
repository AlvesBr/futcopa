import type { Metadata, Viewport } from 'next'
import { ThemeProvider, themeScript } from '@/components/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'FutCopa — Pirâmide diária',
  description: 'Ranqueie 10 jogadores históricos da Copa do Mundo na pirâmide certa.',
  icons: { icon: '/icon.svg' },
  openGraph: {
    title: 'FutCopa — Pirâmide diária',
    description: 'Ranqueie 10 jogadores históricos da Copa do Mundo na pirâmide certa.',
    locale: 'pt_BR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f8f7' },
    { media: '(prefers-color-scheme: dark)',  color: '#07120d' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Prevents theme flash before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
