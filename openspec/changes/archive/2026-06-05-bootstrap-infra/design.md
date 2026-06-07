## Context

Repositório sem código. As 5 specs e o `supabase/schema.sql` do starter existem. Esta change
cria a fundação backend mínima sem tocar em UI (o scaffold Next.js/Tailwind/Storybook depende
do handoff do Design System e fica para a Fase 0 Parte B). Os changes 2 (dados) e 6 (scripts)
consomem os tipos e o schema definidos aqui.

## Goals / Non-Goals

**Goals:**
- `package.json`/`tsconfig.json` mínimos que compilam `lib/types.ts` e rodam o validador TS.
- Tipos centrais únicos (`lib/types.ts`) reutilizados por dados, scripts e (depois) UI.
- `schema.sql` completo, incluindo atribuição de imagens e a capacidade de reportar erros.
- Guia reproduzível de setup do Supabase.

**Non-Goals:**
- Scaffold do Next.js, Tailwind, Storybook ou qualquer componente/rota (Fase 0 Parte B+).
- Popular dados reais ou rodar coleta (changes 2 e 6).
- Criar/alterar requisitos de specs (esta change é infra; sem delta).

## Decisions

- **`package.json` mínimo agora, não o scaffold completo do Next.js.** Razão: o scaffold de UI
  depende dos tokens do Design System; criar Next/Tailwind/Storybook antes geraria retrabalho.
  Aqui só o necessário para tipos + validador. Alternativa descartada: `create-next-app` já —
  acoplaria a fundação ao Design ainda inexistente.
- **`lib/types.ts` como fonte única de tipos**, derivado de `schema.sql`, com `RANK_TO_LEVEL`
  centralizado. Razão: evitar shapes duplicados de Player/Puzzle entre data/scripts/UI.
- **Extensão do schema em vez de tabela nova para fotos:** adicionar `photo_credit`,
  `photo_license`, `photo_source_url` em `players` (atribuição Wikimedia vive junto do jogador).
  **`reports` como tabela própria** com RLS: `insert` público anônimo (qualquer um reporta),
  `select` restrito a service role (moderação). Alternativa descartada: aceitar reports só por
  e-mail/externo — perde rastreabilidade no banco.
- **`tsx`** para executar o validador TS (`scripts/validate_puzzles.ts`, no change 2) sem build.

## Risks / Trade-offs

- [Schema editado à mão pode divergir do que o Supabase aceita] → Validar como SQL e documentar
  o passo de rodar no SQL Editor; manter idempotência (`create table if not exists`, `add column
  if not exists`).
- [`package.json` mínimo será reescrito pelo scaffold do Next.js] → Manter campos genéricos e
  deps que o Next também usará; o scaffold estende, não substitui.

## Migration Plan

1. Adicionar arquivos e `npm install`. 2. Rodar `npx tsc --noEmit` (deve passar). 3. Aplicar o
`schema.sql` atualizado no Supabase (idempotente — seguro reaplicar). Rollback: reverter o commit;
as colunas/tabela novas são aditivas e não quebram dados existentes.

## Open Questions

- Nenhuma bloqueante. População real de fotos (Wikimedia) é decidida no change 2.
