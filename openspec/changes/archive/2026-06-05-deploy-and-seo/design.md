## Context

O App Router do Next.js 14 tem suporte nativo a SEO/metadata sem dependências extras: `MetadataRoute.Robots`, `MetadataRoute.Sitemap`, `MetadataRoute.Manifest`, `ImageResponse` (next/og). O `app/layout.tsx` já tem `metadata` global e `viewport`, mas está sem `metadataBase` — isso faz com que as URLs de `openGraph.images` sejam relativas e quebradas em qualquer crawler ou cliente de redes sociais.

O jogo está pronto para deploy no Vercel. A configuração é zero-friction: Next.js + Vercel detecta App Router automaticamente, sem `vercel.json` obrigatório — mas `vercel.json` é útil para security headers e para documentar a config.

## Goals / Non-Goals

**Goals:**
- Corrigir OG image URLs (metadataBase)
- Adicionar sitemap automático com as 30 datas de puzzle
- Adicionar robots.txt permissivo
- Adicionar Web App Manifest para instalação mobile
- Adicionar favicon SVG (⚽)
- Adicionar OG images dinâmicas (padrão + por puzzle) via next/og
- Documentar deploy com vercel.json + security headers

**Non-Goals:**
- Analytics (não solicitado)
- i18n / hreflang (jogo é PT-BR only)
- Lighthouse 100 (desempenho é bom o suficiente; imagens já são mínimas)
- `next/font` migration (Google Fonts via CSS funciona; trocar agora é risco sem benefício imediato)

## Decisions

### Decisão 1: `metadataBase` usa variável de ambiente com fallback local

**Escolhido:** `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')`

**Rationale:** Em produção (Vercel), `NEXT_PUBLIC_SITE_URL=https://futcopa.vercel.app` resolve todas as URLs de OG/Twitter corretamente. Em desenvolvimento, o fallback `localhost:3000` evita build errors. Adicionar ao `.env.local.example`.

### Decisão 2: OG image via `next/og` (ImageResponse), não imagem estática

**Escolhido:** `app/opengraph-image.tsx` e `app/play/[date]/opengraph-image.tsx` usando `ImageResponse`.

**Alternativa rejeitada:** `public/og.png` estático. Seria o mesmo para todos os puzzles; não mostra a categoria do dia.

**Rationale:** `ImageResponse` roda no Edge Runtime sem custo de cold start extra no Vercel Free. Permite gerar imagem com texto da categoria em cada puzzle share — exatamente o que torna o compartilhamento distintivo. A fonte `Russo One` já está em `public/fonts/` — pode ser carregada diretamente no ImageResponse.

**Layout da OG image por puzzle:**
```
┌─────────────────────────────────────────────────────┐
│  ⚽  FutCopa                               [verde]  │
│                                                     │
│  🏆  Gols marcados na Copa do Mundo                 │
│     (carreira total)                                │
│                                                     │
│  futcopa.vercel.app                                 │
└─────────────────────────────────────────────────────┘
1200×630px  |  bg: #07120d (dark)  |  text: #e8f5ef
```

### Decisão 3: Sitemap lê `data/puzzles.json` em tempo de build (SSG)

**Escolhido:** `app/sitemap.ts` importa o JSON diretamente com `import puzzles from '@/data/puzzles.json'`.

**Alternativa rejeitada:** Leitura via `fs.readFileSync` em runtime. Seria necessário marcar `export const dynamic = 'force-dynamic'`, impedindo static generation.

**Rationale:** `data/puzzles.json` é estático no repositório; não muda em runtime. Import direto → sitemap gerado em build-time → sem cold start para crawlers.

### Decisão 4: `vercel.json` com security headers, sem rewrites

**Escolhido:** Headers para todas as rotas: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

**Rationale:** Boas práticas mínimas de segurança sem quebrar nada. Vercel aplica automaticamente via `vercel.json`.

## Risks / Trade-offs

- **[OG image em dev]** → `ImageResponse` requer Edge Runtime; em `next dev` pode ser lento no primeiro render — Mitigation: irrelevante para produção; dev não usa OG.
- **[Fonte Russo One no ImageResponse]** → `fs.readFileSync` não está disponível no Edge Runtime → Mitigation: carregar a fonte via `fetch` usando URL absoluta (`${process.env.NEXT_PUBLIC_SITE_URL}/fonts/RussoOne-Regular.ttf`). Em caso de falha (dev sem SITE_URL), usar fallback sem fonte customizada.
- **[Sitemap e puzzles futuros]** → ao criar novos puzzles além dos 30, `build_puzzles.py` regenera o JSON e o próximo deploy atualiza o sitemap automaticamente — sem ação manual.
