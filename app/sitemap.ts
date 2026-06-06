import type { MetadataRoute } from 'next'
import puzzles from '@/data/puzzles.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const puzzleEntries: MetadataRoute.Sitemap = puzzles.map((p) => ({
    url: `${base}/play/${p.date}`,
    lastModified: new Date(p.date),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    ...puzzleEntries,
  ]
}
