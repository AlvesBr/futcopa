## Why

O jogo está funcionalmente completo mas faltam os artefatos de SEO e deploy para que a URL `futcopa.vercel.app` seja rastreável, compartilhável e instalável como PWA. Sem `metadataBase`, as URLs de OG image que o `generateMetadata` já produz são relativas — nenhum crawler consegue carregá-las. Sem sitemap e robots, os puzzles não são indexados. Sem manifest, o jogo não aparece como "Adicionar à tela inicial" no iOS/Android.

## What Changes

- Adicionar `metadataBase` em `app/layout.tsx` — corrige URLs relativas de OG/Twitter
- Criar `app/robots.ts` — permite indexação de todas as rotas; aponta para sitemap
- Criar `app/sitemap.ts` — lista home + todas as datas de puzzle de `data/puzzles.json`
- Criar `app/manifest.ts` — Web App Manifest (nome, cores, ícone, `display: standalone`)
- Criar `app/icon.svg` — favicon SVG (⚽) servido automaticamente pelo Next.js
- Criar `app/opengraph-image.tsx` — OG image padrão do site via `ImageResponse` (next/og)
- Criar `app/play/[date]/opengraph-image.tsx` — OG image por puzzle com nome da categoria
- Criar `vercel.json` — security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

## Capabilities

### New Capabilities
<!-- Nenhuma — esta change apenas configura deploy/SEO sem adicionar comportamento de jogo -->

### Modified Capabilities
<!-- Nenhuma — `metadataBase` e as rotas de SEO não alteram requirements de gameplay -->

## Impact

- **Modificado:** `app/layout.tsx` — add `metadataBase`
- **Novos arquivos:** `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, `app/icon.svg`, `app/opengraph-image.tsx`, `app/play/[date]/opengraph-image.tsx`, `vercel.json`
- **Sem novas dependências** — `next/og` (ImageResponse) já está incluído no Next.js 14
- **Sem impacto em componentes de jogo** — mudanças são todas em routes/metadata do App Router
- **Build deve continuar OK** — rotas de metadata do Next.js não quebram se ImageResponse falhar em dev
