## Context

O schema do Supabase já existe (`supabase/schema.sql`) com as tabelas `players`, `puzzles`,
`user_results` e `reports`. Os tipos centrais estão em `lib/types.ts` (tipos `Player`,
`Puzzle`, `PuzzlePlayer`, `Level`, `Rank`, `RANK_TO_LEVEL`). Os primeiros 7 puzzles com
dados validados estão em `docs/puzzles.md` (Dias 1–7, status ✅ Pronto).

Ainda não existe nenhuma camada de acesso a dados no `lib/` — os componentes de UI das
fases seguintes precisam importar de algum lugar.

## Goals / Non-Goals

**Goals:**
- `lib/supabase.ts` — cliente único para Server Components e Client Components
- `lib/getPuzzleOfDay.ts` — busca puzzle por data no Supabase; fallback para JSON estático se falhar
- `lib/validateAnswer.ts` — função pura: dado `rank` do jogador e `slot` escolhido, retorna se o nível está correto
- `scripts/seed_puzzles.ts` — script executado uma vez (offline) que popula `players` + `puzzles`
- `data/puzzles.json` — snapshot dos primeiros 7 puzzles para fallback e dev local sem Supabase

**Non-Goals:**
- Puzzles além dos 7 iniciais (dados ainda não validados)
- Lógica de jogo, drag-and-drop, telas de UI — fases 3-5
- Scripts Python de coleta (change 6)
- Autenticação de usuário

## Decisions

- **Um cliente Supabase, dois contextos.** `lib/supabase.ts` exporta `createBrowserClient` (para Client Components, usa `@supabase/ssr`) e `createServerClient` (para Server Components / Route Handlers, lê cookies). Razão: o padrão oficial do `@supabase/ssr` evita leaks de service role key no bundle do cliente.

- **`getPuzzleOfDay` é async e cacheable.** Recebe `date: string` (YYYY-MM-DD), consulta Supabase com `.eq('date', date)`, retorna `Puzzle | null`. Em caso de erro de rede retorna o fallback JSON se a data existir nele. Razão: garante que o jogo funciona offline/durante outage do Supabase.

- **`validateAnswer` é uma função pura.** Recebe `{ rank: Rank, chosenLevel: Level }`, usa `RANK_TO_LEVEL` de `lib/types.ts`, retorna `boolean`. Sem efeito colateral. Razão: testável sem mock, reutilizável em qualquer componente.

- **Seed em TypeScript (não Python).** O script usa `tsx` (já no dev deps) + `SUPABASE_SERVICE_ROLE_KEY` via `.env.local`. Razão: reutiliza os tipos centrais (`Player`, `Puzzle`) e evita dependências Python só para isso; os dados já estão manualmente curados em `docs/puzzles.md`.

- **Upsert no seed.** O script usa `.upsert()` no Supabase para que re-execuções sejam idempotentes. Razão: seguro re-executar sem duplicar dados.

- **JSON fallback contém só os 7 puzzles iniciais.** `data/puzzles.json` é um array tipado; `getPuzzleOfDay` faz `.find(p => p.date === date)`. Razão: simples, sem dependência de build.

## Risks / Trade-offs

- [Service role key exposta por engano no bundle cliente] → `createServerClient` e o script de seed usam variável sem prefixo `NEXT_PUBLIC_`; linting deve alertar se importado em Client Components.
- [Dados curados manualmente podem ter erros] → Os 7 puzzles iniciais foram validados contra Wikipedia; script de seed imprime os registros inseridos para revisão antes de commitar.
- [Fallback JSON fica desatualizado] → Documentado no `DESIGN_SYSTEM.md`; aceito para MVP, atualizado manualmente quando necessário.

## Migration Plan

Aditivo. Rodar `npx tsx scripts/seed_puzzles.ts` uma vez após configurar `.env.local`.
Rollback: deletar as rows no Supabase; não há dependência de produção ainda.

## Open Questions

- Quantos puzzles semear inicialmente? → 7 (Dias 1–7 todos ✅ Pronto em `docs/puzzles.md`).
- Data de início dos puzzles? → 2026-06-06 (amanhã) como dia 1, incrementando diariamente.
