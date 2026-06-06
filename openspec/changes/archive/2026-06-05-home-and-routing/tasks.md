## 1. Rotas Next.js App Router

- [x] 1.1 Criar `app/page.tsx` — Server Component que chama `getPuzzleOfDay(todayDate())`, redireciona para `/play/<date>` ou exibe "Puzzle indisponível — volte amanhã"
- [x] 1.2 Criar `app/play/[date]/page.tsx` — Server Component async que valida formato da data, chama `getPuzzleOfDay`, chama `notFound()` se null, renderiza `<PlayScreen puzzle={puzzle} />`
- [x] 1.3 Criar `app/play/[date]/not-found.tsx` — página 404 customizada com mensagem e link para home
- [x] 1.4 Criar `app/loading.tsx` — skeleton de loading global (spinner ou pulse simples)

## 2. Componentes de shell

- [x] 2.1 Criar `components/TopBar.tsx` — logo "FutCopa", botões placeholder (Ajuda, Stats), toggle de tema via `useTheme()`
- [x] 2.2 Criar `components/CategoryBadge.tsx` — Server Component puro que exibe `category` e `description` do puzzle
- [x] 2.3 Criar `components/PyramidShell.tsx` — Client Component que renderiza pirâmide 1-2-3-4 slots com ranks visíveis (estado vazio, sem drag)
- [x] 2.4 Criar `components/PlayerQueue.tsx` — Client Component que exibe os 10 cards de jogadores em fila (sem drag, apenas visual)
- [x] 2.5 Criar `components/PlayScreen.tsx` — Client Component wrapper que recebe `puzzle: Puzzle`, compõe `TopBar` + `CategoryBadge` + `PyramidShell` + `PlayerQueue`

## 3. Verificação

- [x] 3.1 Rodar `npm run typecheck` sem erros
- [x] 3.2 Rodar `npm run dev` e navegar para `http://localhost:3000` — confirmar redirect para `/play/<hoje>`
- [x] 3.3 Navegar para `/play/2026-06-06` — confirmar que o puzzle carrega e os componentes de shell renderizam
- [x] 3.4 Navegar para `/play/9999-12-31` — confirmar página 404 customizada
