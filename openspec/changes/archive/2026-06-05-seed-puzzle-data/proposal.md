## Why

O jogo precisa de dados para funcionar. A UI das fases seguintes depende de puzzles no
Supabase e de funções de runtime para buscá-los. Esta change popula o banco com os primeiros
puzzles documentados em `docs/puzzles.md` e cria a camada de acesso a dados que o frontend
vai consumir.

## What Changes

- Criar `lib/supabase.ts` — cliente Supabase para uso em Server Components (SSR) e client components
- Criar `lib/getPuzzleOfDay.ts` — busca o puzzle da data corrente no Supabase com fallback para JSON estático
- Criar `lib/validateAnswer.ts` — valida o posicionamento de um jogador num slot (rank → nível correto)
- Criar `scripts/seed_puzzles.ts` — script offline que insere jogadores + puzzles no Supabase usando service role key
- Criar `data/puzzles.json` — snapshot dos primeiros 7 puzzles como fallback estático (usado quando Supabase estiver indisponível)
- Semear os primeiros **7 puzzles** do `docs/puzzles.md` (Dias 1–7, todos com status ✅ Pronto)

## Capabilities

### New Capabilities
- `puzzle-data-access`: camada de runtime para buscar o puzzle diário do Supabase (com fallback JSON) e validar respostas

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- **Novos arquivos:** `lib/supabase.ts`, `lib/getPuzzleOfDay.ts`, `lib/validateAnswer.ts`, `scripts/seed_puzzles.ts`, `data/puzzles.json`
- **Dependências:** nenhuma nova — `@supabase/ssr` e `@supabase/supabase-js` já estão no `package.json`
- **Requer env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (runtime), `SUPABASE_SERVICE_ROLE_KEY` (apenas no script de seed)
- **Base para fases UI (3-5):** todas as rotas de jogo importarão de `lib/getPuzzleOfDay.ts`
- **Sem migrações de schema:** o `supabase/schema.sql` já está correto
