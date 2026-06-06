## 1. Cliente Supabase

- [x] 1.1 Criar `lib/supabase.ts` exportando `createBrowserClient` (usa `@supabase/ssr`) e `createServerClient` (lê cookies do Next.js)
- [x] 1.2 Adicionar `.env.local.example` com as três variáveis necessárias (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)

## 2. Camada de acesso a dados

- [x] 2.1 Criar `lib/getPuzzleOfDay.ts`: função `getPuzzleOfDay(date: string): Promise<Puzzle | null>` que consulta Supabase e cai em `data/puzzles.json` como fallback
- [x] 2.2 Criar `lib/validateAnswer.ts`: função pura `validateAnswer(rank: Rank, chosenLevel: Level): boolean` usando `RANK_TO_LEVEL`

## 3. JSON estático (fallback + dev)

- [x] 3.1 Criar `data/puzzles.json` com os 7 primeiros puzzles (Dias 1–7 de `docs/puzzles.md`) no formato `Puzzle[]` com datas a partir de 2026-06-06
- [x] 3.2 Verificar que o JSON é válido e os ranks estão corretos segundo `RANK_TO_LEVEL`

## 4. Script de seed

- [x] 4.1 Criar `scripts/seed_puzzles.ts` que lê `data/puzzles.json`, faz upsert de jogadores únicos em `players` e puzzles em `puzzles` via Supabase service role key
- [x] 4.2 Garantir que o script imprime um resumo de quantos registros foram inseridos/atualizados

## 5. Verificação

- [x] 5.1 `npm run typecheck` sem erros
- [x] 5.2 `getPuzzleOfDay` retorna `Puzzle` válido quando chamado com data de `data/puzzles.json` (testar manualmente ou via `tsx`)
- [x] 5.3 `validateAnswer` retorna correto para casos limite: rank 1 → nível 1, rank 3 → nível 2, rank 6 → nível 3, rank 10 → nível 4
- [x] 5.4 Sincronizar a spec (`sync`) antes de arquivar (nova capacidade `puzzle-data-access`)
