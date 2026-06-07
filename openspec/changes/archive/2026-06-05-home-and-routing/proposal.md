## Why

O jogo tem dados e design system prontos, mas nenhuma tela renderiza ainda. Esta change
entrega o shell do app (layout global, navegação, tema) e as duas rotas de entrada:
a home (`/`) que redireciona para o puzzle do dia, e a rota de play
(`/play/[date]`) com o esqueleto que as fases de jogo seguintes vão preencher.

## What Changes

- Criar `app/page.tsx` — home que redireciona para `/play/<hoje>` ou exibe "indisponível"
- Criar `app/play/[date]/page.tsx` — route dinâmica SSR que carrega o puzzle; exibe 404 se data inválida; bloqueia replay via localStorage
- Criar `app/play/[date]/not-found.tsx` — página 404 customizada do jogo
- Criar `app/loading.tsx` — skeleton de loading global
- Criar `components/TopBar.tsx` — barra superior com logo, botões de ajuda/stats/tema
- Criar `components/CategoryBadge.tsx` — badge que exibe categoria e descrição do puzzle
- Criar `components/PyramidShell.tsx` — estrutura visual da pirâmide (slots vazios, sem drag ainda)
- Criar `components/PlayerQueue.tsx` — fila de jogadores (cards clicáveis, sem drag ainda)
- Adaptar `app/layout.tsx` — já existe; apenas confirmar que ThemeProvider e globals.css estão corretos

## Capabilities

### New Capabilities
<!-- Nenhuma capacidade nova — esta change implementa specs existentes -->

### Modified Capabilities
- `daily-puzzle`: implementa os requirements de roteamento, redirect e bloqueio de replay (já especificados em `openspec/specs/daily-puzzle/spec.md`)
- `puzzle-data-access`: implementa o uso de `getPuzzleOfDay` no Server Component da rota de play

## Impact

- **Novos arquivos:** `app/page.tsx`, `app/play/[date]/page.tsx`, `app/play/[date]/not-found.tsx`, `app/loading.tsx`, `components/TopBar.tsx`, `components/CategoryBadge.tsx`, `components/PyramidShell.tsx`, `components/PlayerQueue.tsx`
- **Sem novas dependências** — usa `@dnd-kit` já instalado (sem drag nesta fase), `components/ui/*` existente, `lib/getPuzzleOfDay.ts`
- **Base para Change 4 (play-screen):** a rota `/play/[date]` e os componentes de shell ficam prontos para receber a lógica de drag-and-drop
