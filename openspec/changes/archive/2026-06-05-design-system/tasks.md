## 1. Parte A — Claude Design (manual, pelo usuário)

- [x] 1.1 Abrir claude.ai/design, criar projeto e colar o brief de `design/CLAUDE_DESIGN_BRIEF.md`
- [x] 1.2 Gerar 2-3 direções visuais e escolher uma
- [x] 1.3 Gerar as Foundations/tokens (cores claro+escuro, tipografia, espaçamento, raios, sombras, motion) com contraste WCAG AA e par seguro p/ daltônicos
- [x] 1.4 Gerar as telas/componentes do jogo (lista no brief) em claro+escuro, mobile e desktop
- [x] 1.5 Exportar o handoff bundle e salvá-lo em `design/handoff/` (ou trazer ao Claude Code)

## 2. Parte B — Scaffold (código)

- [x] 2.1 Scaffold Next.js 14 (App Router + TS) estendendo o package.json; adicionar Tailwind + PostCSS
- [x] 2.2 Adicionar Storybook (`@storybook/*`) configurado para Next + Tailwind
- [x] 2.3 `npm install` e build/storybook sobem sem erro

## 3. Parte B — Tokens e tema

- [x] 3.1 Traduzir os tokens do handoff para `app/globals.css` (CSS vars `:root` + `.dark`) e referenciá-los em `tailwind.config.ts`
- [x] 3.2 Criar `ThemeProvider` (preferência do sistema + toggle persistido em localStorage, sem flash)
- [x] 3.3 `app/layout.tsx` aplica o tema e importa `globals.css`

## 4. Parte B — Primitivos + documentação

- [x] 4.1 Criar primitivos em `components/ui/` (Button, Card, Modal, Badge, Avatar, Slot, Toast, IconButton) tipados
- [x] 4.2 Garantir tokens semânticos de acerto/erro com ícone/forma (não só cor) e contraste AA
- [x] 4.3 Story no Storybook para cada primitivo (variações + claro/escuro)
- [x] 4.4 Escrever `DESIGN_SYSTEM.md` (tokens, inventário de componentes, uso, theming, notas a11y)

## 5. Verificação

- [x] 5.1 `npm run build` e `npm run storybook` sobem sem erro
- [x] 5.2 Toggle claro/escuro funciona e persiste; primitivos legíveis em ~360px
- [x] 5.3 Sincronizar a spec (`sync`) antes de arquivar (capacidade nova `design-system`)
