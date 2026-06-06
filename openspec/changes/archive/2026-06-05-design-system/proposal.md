## Why

Toda a UI do jogo (pirâmide, cards, modais, onboarding, stats) depende de uma fundação
visual consistente. Definir um design system antes de codar telas evita retrabalho e
garante coerência, temas claro/escuro e acessibilidade desde o início. A exploração visual
é feita no **Claude Design** (claude.ai/design), que entrega um *handoff bundle* consumido
pelo Claude Code.

## What Changes

- **Parte A (manual, no Claude Design):** gerar 2-3 direções visuais, escolher uma, e produzir
  tokens (claro+escuro) + telas/componentes do jogo; exportar o **handoff bundle**. Guiada pelo
  documento `design/CLAUDE_DESIGN_BRIEF.md`.
- **Parte B (código):** scaffold **Next.js 14 + Tailwind + Storybook**; converter o handoff em
  **tokens** (`tailwind.config.ts` + `app/globals.css` com CSS vars claro/escuro) + `ThemeProvider`;
  criar **primitivos** em `components/ui/*` (Button, Card, Modal, Badge, Avatar, Slot, Toast,
  IconButton) documentados no **Storybook**; escrever `DESIGN_SYSTEM.md`.

## Capabilities

### New Capabilities
- `design-system`: fundação visual do produto — tokens versionados, temas claro/escuro,
  biblioteca de componentes primitivos documentada e regras de acessibilidade de feedback.

### Modified Capabilities
<!-- Nenhuma. -->

## Impact

- **Dependências novas:** `next`, `react`, `react-dom`, `tailwindcss`, `postcss`, `autoprefixer`,
  Storybook (`@storybook/*`). Estende o `package.json` mínimo do `bootstrap-infra`.
- **Novos arquivos:** `tailwind.config.ts`, `postcss.config.js`, `app/globals.css`, `app/layout.tsx`
  (ThemeProvider), `components/ui/*` + stories, `.storybook/*`, `DESIGN_SYSTEM.md`,
  `design/CLAUDE_DESIGN_BRIEF.md`, `design/handoff/` (bundle exportado).
- **Base para todas as fases de UI** (changes 3-5, 7), que passam a consumir `components/ui/*`.
- A Parte A depende de acesso ao Claude Design (research preview: planos Pro/Max/Team/Enterprise).
