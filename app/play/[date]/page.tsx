import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPuzzleOfDay } from '@/lib/getPuzzleOfDay'
import { PlayScreen } from '@/components/PlayScreen'

interface Props {
  params: { date: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    return { title: 'FutCopa' }
  }
  const puzzle = await getPuzzleOfDay(params.date)
  if (!puzzle) return { title: 'FutCopa' }

  const title = `FutCopa — ${puzzle.category}`
  const description = puzzle.description ?? 'Você consegue ordenar os 10 maiores da Copa do Mundo?'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function PlayPage({ params }: Props) {
  const { date } = params

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound()
  }

  const puzzle = await getPuzzleOfDay(date)

  if (!puzzle) {
    notFound()
  }

  return <PlayScreen puzzle={puzzle} />
}
