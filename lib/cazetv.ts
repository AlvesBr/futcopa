/**
 * CazéTV — link do vídeo de cada jogo no YouTube.
 * Fonte: feed RSS oficial do canal (sem chave de API), via /api/cazetv.
 * O feed traz só os ~15 vídeos mais recentes: jogos ao vivo quase sempre
 * estão lá; "jogo completo" de partidas antigas pode já ter saído do feed.
 */

import type { RawMatch, MatchStatus } from './live'
import { teamName, isPlaceholder } from './live'

export const CAZETV_CHANNEL_ID = 'UCZiYbVptd3PVPf4f6eR6UaQ'
export const CAZETV_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CAZETV_CHANNEL_ID}`
/** Fallback quando não achamos o vídeo específico do jogo. */
export const CAZETV_STREAMS_URL = 'https://www.youtube.com/@CazeTV/streams'

export interface CazeVideo {
  videoId: string
  title: string
  published: string
}

export interface CazeLink {
  url: string
  /** Rótulo curto para o botão. */
  label: string
  /** true quando é o canal genérico, não o vídeo do jogo. */
  fallback: boolean
}

/** Remove acentos e normaliza para maiúsculas (títulos da CazéTV são gritados). */
function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
}

/** Nome do time presente no título como palavra inteira (evita "IRA" dentro de outra palavra). */
function hasTeam(normTitle: string, team: string): boolean {
  const name = norm(team).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^A-Z])${name}([^A-Z]|$)`).test(normTitle)
}

/**
 * Encontra o melhor vídeo do feed para uma partida.
 * Preferência por status: ao vivo/futuro → transmissão > esquenta;
 * encerrado → jogo completo > transmissão.
 */
export function findMatchVideo(
  match: RawMatch,
  videos: CazeVideo[],
  status: MatchStatus,
): CazeLink | null {
  if (isPlaceholder(match.team1) || isPlaceholder(match.team2)) return null

  const t1 = teamName(match.team1)
  const t2 = teamName(match.team2)

  const candidates = videos.filter(v => {
    const nt = norm(v.title)
    return hasTeam(nt, t1) && hasTeam(nt, t2)
  })
  if (candidates.length === 0) return null

  const finished = status === 'finished' || status === 'awaiting'

  function score(v: CazeVideo): number {
    const nt = norm(v.title)
    let s = 0
    if (nt.includes('JOGO COMPLETO')) s += finished ? 6 : -2
    if (nt.includes('RESUMO')) s -= 3
    if (nt.includes('ESQUENTA')) s -= 2 // esquenta perde para a transmissão real, mas vence o resto
    if (nt.includes('AO VIVO')) s += finished ? 0 : 3
    return s
  }

  const best = [...candidates].sort(
    (a, b) => score(b) - score(a) || b.published.localeCompare(a.published),
  )[0]!

  const nt = norm(best.title)
  const label = nt.includes('JOGO COMPLETO')
    ? 'Jogo completo na CazéTV'
    : nt.includes('ESQUENTA')
      ? 'Esquenta na CazéTV'
      : 'Assistir na CazéTV'

  return {
    url: `https://www.youtube.com/watch?v=${best.videoId}`,
    label,
    fallback: false,
  }
}

/** Link do botão para um jogo: vídeo específico ou canal (só em jogos ao vivo). */
export function cazeLinkFor(
  match: RawMatch,
  videos: CazeVideo[],
  status: MatchStatus,
): CazeLink | null {
  const specific = findMatchVideo(match, videos, status)
  if (specific) return specific
  if (status === 'live' || status === 'halftime') {
    return { url: CAZETV_STREAMS_URL, label: 'Assistir na CazéTV', fallback: true }
  }
  return null
}
