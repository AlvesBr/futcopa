## Context

Todas as peças de infraestrutura estão prontas (tokens, primitivos, `lib/getPuzzleOfDay`, `lib/validateAnswer`, `data/puzzles.json`), mas nenhuma rota renderiza ainda. Esta change liga as partes: cria as rotas Next.js 14 App Router e os componentes de shell visual que a Change 4 (play-screen) vai preencher com lógica de drag-and-drop.

Specs que guiam esta implementação:
- `openspec/specs/daily-puzzle/spec.md` — roteamento, redirect, replay bloqueio
- `openspec/specs/puzzle-data-access/spec.md` — uso de `getPuzzleOfDay` no Server Component

## Goals / Non-Goals

**Goals:**
- Rota `/` que redireciona para `/play/<hoje>` ou exibe "indisponível"
- Rota `/play/[date]` SSR que carrega o puzzle e bloqueia replay via localStorage
- TopBar, CategoryBadge, PyramidShell, PlayerQueue como componentes de shell (sem drag ainda)
- 404 customizada e skeleton de loading global
- Confirmar que `app/layout.tsx` está correto (já existe)

**Non-Goals:**
- Drag-and-drop (Change 4)
- Validação de resposta em tempo real (Change 4)
- Modal de resultado e compartilhamento (Change 5)
- Contador regressivo (Change 5)
- Páginas de stats ou perfil

## Decisions

### Rota `/` — redirect via Server Component + `notFound()`

**Decisão:** `app/page.tsx` é um Server Component que chama `getPuzzleOfDay(todayDate())`. Se retornar `Puzzle`, faz `redirect('/play/<date>')`. Se retornar `null`, exibe inline "Puzzle indisponível".

**Alternativa considerada:** Client Component com `useRouter` + `useEffect`. Rejeitado: flash de tela em branco antes do redirect; o Server Component faz o redirect antes do HTML ser enviado.

---

### Rota `/play/[date]` — Server Component com `notFound()` e `Suspense`

**Decisão:** `app/play/[date]/page.tsx` é um Server Component (`async`). Valida o formato da data (`/^\d{4}-\d{2}-\d{2}$/`), chama `getPuzzleOfDay(date)`, chama `notFound()` se `null`. Passa o `Puzzle` como prop para o componente de jogo (Client Component na Change 4). O bloqueio de replay (`localStorage`) acontece no Client Component filho.

**Alternativa considerada:** Verificar replay no Server Component via cookies. Rejeitado: localStorage é o armazenamento escolhido (sem necessidade de conta/backend para estado de resultado); verificação no client é suficiente e mais simples.

---

### PyramidShell e PlayerQueue — "static shell" sem interatividade

**Decisão:** Nesta change, `PyramidShell` renderiza os 10 slots vazios com ranks visíveis e `PlayerQueue` renderiza os 10 cards de jogadores sem drag. Ambos são Client Components (precisarão de estado/drag na Change 4), mas só exibem dados estáticos agora.

**Alternativa considerada:** Esperar até a Change 4 para criar os componentes. Rejeitado: a rota `/play/[date]` precisa de uma tela visível para validar o fluxo end-to-end antes de adicionar drag-and-drop.

---

### TopBar — componente sem contexto de jogo

**Decisão:** `TopBar` recebe `title` e `category` como props simples. Botões de "Ajuda" e "Stats" são placeholders (onClick não-op) nesta phase. Toggle de tema usa `useTheme()` do `ThemeProvider` existente.

---

### CategoryBadge — componente server-safe

**Decisão:** `CategoryBadge` é um Server Component puro — recebe `category` e `description` como props. Sem estado, sem hooks.

---

### Replay detection — `useEffect` no Client Component raiz da tela de play

**Decisão:** Um `PlayScreen` (Client Component) recebe o `Puzzle` serializado como prop do Server Component. No `useEffect` inicial, lê `localStorage.getItem('puzzle_result_<date>')`. Se existir, exibe um aviso "Você já jogou este puzzle" com o score salvo. Se não existir, renderiza o shell do jogo normalmente.

**Esta lógica pertence à Change 4 (jogo completo)**, mas o `PlayScreen` precisa existir aqui como wrapper para que a Change 4 possa adicionar estado. Nesta change, o `PlayScreen` apenas passa os dados para `PyramidShell` e `PlayerQueue`.

## Risks / Trade-offs

- **Replay check parcial:** O `PlayScreen` nesta change não verifica replay — isso é implementado na Change 4. Risco: usuário poderia replay na Change 4 se o check não for adicionado. Mitigação: o spec `daily-puzzle` já define o contrato; a Change 4 implementará.
- **Serialização de `Puzzle` como prop:** O Server Component passa o objeto `Puzzle` inteiro para o Client Component via prop (serialização JSON automática do Next.js). Se o puzzle tiver campos não-serializáveis no futuro, isso quebrará. Mitigação: `lib/types.ts` define tipos simples (sem `Date`, só `string`/`number`).
- **`app/loading.tsx` global:** Um único skeleton global pode não se adequar a todas as rotas. Mitigação: rotas com loading específico podem adicionar seu próprio `loading.tsx` depois.
