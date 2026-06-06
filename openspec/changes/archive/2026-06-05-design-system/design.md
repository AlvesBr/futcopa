## Context

Primeira change de UI. Nenhum scaffold de frontend existe (o `bootstrap-infra` criou só
`package.json`/`tsconfig`/`lib/types.ts`/schema). A exploração visual roda fora do repo, no
Claude Design, e retorna um handoff bundle. Esta change transforma esse handoff numa fundação
de código reutilizável.

## Goals / Non-Goals

**Goals:**
- Tokens versionados (cores, tipografia, espaçamento, raios, sombras, motion) em claro+escuro.
- Scaffold Next.js 14 (App Router) + Tailwind + Storybook, mobile-first.
- Primitivos `components/ui/*` documentados no Storybook (variações + ambos os temas).
- `DESIGN_SYSTEM.md` como referência viva.

**Non-Goals:**
- Componentes específicos do jogo (Pyramid, PlayerCard, ResultModal...) — são dos changes 3-5.
- Lógica de jogo, dados ou rotas de puzzle.
- Fotos reais de jogadores (decisão do change 2).

## Decisions

- **Tokens como CSS variables + tema do Tailwind.** As cores/raios/etc. vivem como CSS vars em
  `app/globals.css` (um bloco `:root` claro e um `.dark` escuro) e o `tailwind.config.ts` referencia
  essas vars. Razão: troca de tema sem recompilar e fonte única. Alternativa descartada: cores
  hardcoded no config (duplicaria claro/escuro).
- **Tema via classe `dark` + preferência do sistema, com toggle.** `ThemeProvider` lê
  `prefers-color-scheme`, permite override manual e persiste em localStorage. Sem flash (script
  inline no `<head>`).
- **Storybook para documentar primitivos**, cada um com stories cobrindo variações e os 2 temas.
  Razão: validar o design system isolado da lógica do jogo.
- **Acessibilidade de feedback:** os tokens semânticos de acerto/erro vêm em par com ícone/forma
  (não só verde/vermelho), preparando os componentes de jogo para daltônicos. Contraste WCAG AA.
- **Consumo do handoff:** o bundle exportado é salvo em `design/handoff/`; os tokens são traduzidos
  manualmente para `globals.css`/`tailwind.config.ts`, e os componentes gerados viram a base de
  `components/ui/*` (revisados, tipados, com stories).

## Risks / Trade-offs

- [Acesso ao Claude Design é research preview e pode faltar ao usuário] → Parte B pode partir de
  tokens fornecidos manualmente; o brief também serve como spec textual caso o handoff não venha.
- [Handoff pode trazer CSS/markup divergente das convenções] → Tratar como ponto de partida, não
  cópia literal: revisar, tipar e adequar ao Tailwind/tema antes de commitar.
- [Scaffold Next.js redefine o `package.json` mínimo] → Estender (não substituir) as deps já
  instaladas no `bootstrap-infra`.

## Migration Plan

Aditivo (nova fundação). Sem migração de dados. Rollback = reverter o commit; nada em produção
depende disto ainda.

## Open Questions

- Direção visual final: decidida pelo usuário entre as 2-3 propostas do Claude Design.
- Necessidade de OG-image dinâmica (`@vercel/og`) fica para o change de SEO (7), não aqui.
