import { NextResponse } from 'next/server'
import fallback from '@/data/worldcup-2026.json'
import type { WorldCupData } from '@/lib/live'

/**
 * Proxy server-side dos jogos da Copa 2026 (openfootball).
 * O cliente NUNCA chama a fonte externa diretamente: o fetch acontece aqui,
 * com cache de 120s (ISR) e fallback para o snapshot local em data/.
 */
const SOURCE_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

export async function GET() {
  let data: WorldCupData
  let source: 'openfootball' | 'snapshot' = 'openfootball'

  try {
    const res = await fetch(SOURCE_URL, { next: { revalidate: 120 } })
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    data = (await res.json()) as WorldCupData
    if (!Array.isArray(data.matches)) throw new Error('formato inesperado')
  } catch {
    data = fallback as WorldCupData
    source = 'snapshot'
  }

  return NextResponse.json(
    { ...data, source },
    { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } },
  )
}
