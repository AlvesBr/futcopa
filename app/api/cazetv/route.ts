import { NextResponse } from 'next/server'
import { CAZETV_FEED_URL, type CazeVideo } from '@/lib/cazetv'

/**
 * Proxy server-side do feed RSS da CazéTV (YouTube).
 * Feed oficial, sem chave de API. Cache de 300s; em falha retorna lista
 * vazia — a UI cai no link genérico do canal para jogos ao vivo.
 */

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
}

function parseFeed(xml: string): CazeVideo[] {
  const videos: CazeVideo[] = []
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []
  for (const entry of entries) {
    const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1]
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1]
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1]
    if (videoId && title) {
      videos.push({ videoId, title: decodeEntities(title), published: published ?? '' })
    }
  }
  return videos
}

export async function GET() {
  let videos: CazeVideo[] = []
  try {
    const res = await fetch(CAZETV_FEED_URL, { next: { revalidate: 300 } })
    if (res.ok) videos = parseFeed(await res.text())
  } catch {
    /* feed fora do ar — lista vazia aciona o fallback na UI */
  }

  return NextResponse.json(
    { videos },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' } },
  )
}
