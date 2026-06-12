import type { Metadata } from 'next'
import { LiveScreen } from '@/components/LiveScreen'

export const metadata: Metadata = {
  title: 'FutCopa — Copa 2026 Ao Vivo',
  description: 'Jogos da Copa do Mundo 2026: placares, horários e resultados dia a dia.',
}

export default function AoVivoPage() {
  return <LiveScreen />
}
