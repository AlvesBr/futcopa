## 1. Configuração do projeto

- [x] 1.1 Criar `package.json` mínimo (name, private, scripts: `validate:puzzles` → `tsx scripts/validate_puzzles.ts`; deps `@dnd-kit/core`, `@supabase/supabase-js`, `@supabase/ssr`; devDeps `typescript`, `tsx`, `@types/node`)
- [x] 1.2 Criar `tsconfig.json` (strict, target ES2022, moduleResolution bundler, paths `@/*`)
- [x] 1.3 Rodar `npm install` e confirmar sucesso

## 2. Tipos centrais

- [x] 2.1 Criar `lib/types.ts` com `Player`, `PuzzlePlayer`, `Puzzle`, `UserResult`, `PuzzleStats`, `Report` derivados de `supabase/schema.sql`
- [x] 2.2 Adicionar `RANK_TO_LEVEL` (mapa rank 1-10 → nível 1-4) e helper `levelForRank(rank)` em `lib/types.ts`
- [x] 2.3 Confirmar `npx tsc --noEmit` passa

## 3. Schema do banco

- [x] 3.1 Em `supabase/schema.sql`, adicionar a `players` as colunas `photo_credit text`, `photo_license text`, `photo_source_url text` (idempotente: `add column if not exists`)
- [x] 3.2 Adicionar tabela `reports` (id uuid pk, puzzle_date date, player_id text, reason text, details text, created_at timestamptz) idempotente
- [x] 3.3 Habilitar RLS em `reports`: policy de `insert` pública (anônima) e SEM policy de select pública (leitura só service role)

## 4. Documentação de setup

- [x] 4.1 Criar `docs/supabase-setup.md`: criar projeto Supabase → rodar `schema.sql` no SQL Editor → copiar `.env.example` para `.env.local` e preencher URL/anon/service_role

## 5. Verificação

- [x] 5.1 `npm install && npx tsc --noEmit` verdes
- [x] 5.2 Revisar `supabase/schema.sql` como SQL válido (idempotente, RLS de `reports` correta)
