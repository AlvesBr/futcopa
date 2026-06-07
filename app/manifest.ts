import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FutCopa',
    short_name: 'FutCopa',
    description: 'Ranqueie 10 jogadores históricos da Copa do Mundo na pirâmide certa.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07120d',
    theme_color: '#07120d',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
  }
}
