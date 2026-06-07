## Why

O repositório só tem documentação e specs — nenhuma base de código existe. Antes de
implementar qualquer feature (jogo, dados, scripts) é preciso uma fundação mínima e
compartilhada: dependências, tipos centrais e o esquema de banco completo. Isso destrava
todos os changes seguintes e não depende do handoff do Design System (nenhuma UI aqui).

## What Changes

- Adiciona `package.json` + `tsconfig.json` mínimos (deps de dados/jogo: `@dnd-kit/core`,
  `@supabase/supabase-js`, `@supabase/ssr`; devDeps `typescript`, `tsx`; script
  `validate:puzzles`). O scaffold completo do Next.js/Tailwind/Storybook NÃO entra aqui —
  é da Fase 0 Parte B (gated pelo Design).
- Cria `lib/types.ts` com os tipos centrais derivados de `supabase/schema.sql`
  (`Player`, `Puzzle`, `PuzzlePlayer`, `UserResult`, `PuzzleStats`, `Report`) e o mapa
  `RANK_TO_LEVEL` (1→1, 2-3→2, 4-6→3, 7-10→4), reutilizado por todo o projeto.
- Estende `supabase/schema.sql`: em `players` adiciona `photo_credit`, `photo_license`,
  `photo_source_url` (atribuição de imagens); cria a tabela `reports` (reportar erro de
  dado) com RLS (insert público anônimo, leitura só service role).
- Adiciona `docs/supabase-setup.md`: guia para criar o projeto Supabase, rodar o
  `schema.sql` e preencher `.env.local`.

## Capabilities

### New Capabilities
<!-- Nenhuma. Esta change é fundação/infra: não introduz capacidade de produto. -->

### Modified Capabilities
<!-- Nenhuma. Não altera requisitos de nenhuma spec existente. As extensões de schema e
     os tipos são detalhes de implementação que dão suporte às specs já existentes. -->

## Impact

- **Novos arquivos:** `package.json`, `tsconfig.json`, `lib/types.ts`, `docs/supabase-setup.md`.
- **Modificados:** `supabase/schema.sql` (colunas de atribuição + tabela `reports` + RLS).
- **Dependências:** instala `@dnd-kit/core`, `@supabase/supabase-js`, `@supabase/ssr`,
  `typescript`, `tsx`.
- **Sem impacto em runtime/UI** — base consumida pelos changes 2 (dados) e 6 (scripts) e,
  após o Design, pelos changes de UI.
