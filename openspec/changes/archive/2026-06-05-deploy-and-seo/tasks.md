## 1. Metadados Globais

- [x] 1.1 Adicionar `NEXT_PUBLIC_SITE_URL=https://futcopa.vercel.app` ao `.env.local.example`
- [x] 1.2 Atualizar `app/layout.tsx` — adicionar `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')` no objeto `metadata`; adicionar `icons: { icon: '/icon.svg' }` para referenciar o favicon

## 2. SEO Estático

- [x] 2.1 Criar `app/robots.ts` — `MetadataRoute.Robots` permitindo todos os crawlers (`allow: '/'`) e apontando `sitemap` para `${SITE_URL}/sitemap.xml`
- [x] 2.2 Criar `app/sitemap.ts` — importa `data/puzzles.json` via `import`, retorna `MetadataRoute.Sitemap` com a URL raiz + uma entrada por puzzle (`/play/YYYY-MM-DD`), `lastModified` = data do puzzle, `changeFrequency: 'daily'`, `priority: 0.8` (puzzles) / `1.0` (home)
- [x] 2.3 Criar `app/manifest.ts` — `MetadataRoute.Manifest` com `name: 'FutCopa'`, `short_name: 'FutCopa'`, `description`, `start_url: '/'`, `display: 'standalone'`, `background_color: '#07120d'`, `theme_color: '#07120d'`, `icons` (192px + 512px apontando para o favicon SVG como PNG fallback)

## 3. Favicon

- [x] 3.1 Criar `app/icon.svg` — ícone SVG com emoji ⚽ em fundo verde escuro (`#07120d`) num `<rect>` com `rx="20%"` + `<text>` centralizado; Next.js serve automaticamente como `/icon.svg` e usa como favicon

## 4. OG Images (next/og)

- [x] 4.1 Criar `app/opengraph-image.tsx` — OG image padrão do site (1200×630): fundo `#07120d`, emoji ⚽ grande, título "FutCopa", tagline "Pirâmide diária da Copa do Mundo", URL do site; usar `ImageResponse` com `export const runtime = 'edge'`
- [x] 4.2 Criar `app/play/[date]/opengraph-image.tsx` — OG image por puzzle (1200×630): carrega `getPuzzleOfDay(params.date)` e exibe a `category` do puzzle; mesmo layout do padrão mas com linha extra mostrando a categoria; fallback para imagem padrão se puzzle não encontrado; `export const runtime = 'edge'`

## 5. Deploy Config

- [x] 5.1 Criar `vercel.json` — `headers` com `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` para todas as rotas (`source: '/(.*)'`)

## 6. Verificação

- [x] 6.1 Executar `npm run build` e confirmar que todas as novas rotas compilam sem erros (robots, sitemap, manifest, opengraph-image, icon)
- [x] 6.2 Confirmar que `npm run typecheck` passa sem erros
