## Context

O `PlayScreen` atual é um Client Component estático que recebe um `Puzzle` serializado do Server Component pai e exibe `PyramidShell` + `PlayerQueue` sem nenhuma interatividade. `@dnd-kit/core` já está instalado. Os tipos `Rank`, `Level`, `RANK_TO_LEVEL`, `levelForRank` e `validateAnswer` já existem e são testáveis.

Specs que guiam esta implementação:
- `openspec/specs/pyramid-game/spec.md` — drag-and-drop, fila, validação, HELP, resultado
- `openspec/specs/game-modes/spec.md` — modo Normal/Fácil, persistência, HELP behavior
- `openspec/specs/daily-puzzle/spec.md` — replay detection, save em localStorage

## Goals / Non-Goals

**Goals:**
- Jogo completo e funcional: arrastar/clicar para posicionar 10 jogadores, ver feedback imediato, receber pontuação final
- Modo Normal (sem dicas) e Modo Fácil (badge de nível + highlight dos slots corretos ao arrastar)
- HELP: 1x por partida, modal de confirmação, slots corretos/incorretos piscam 2s
- Replay detection e save em localStorage
- Modal de resultado com score e pirâmide resumida

**Non-Goals:**
- Texto de compartilhamento para clipboard (Change 5)
- Countdown até próximo puzzle (Change 5)
- Stats da comunidade via Supabase (Change 5)
- OG tags dinâmicas (Change 7)

## Decisions

### Estado de jogo centralizado em `PlayScreen`

**Decisão:** `PlayScreen` é o único dono do estado de jogo:
```ts
type GamePhase = 'mode-select' | 'playing' | 'done'

interface SlotState {
  playerId: string | null
  playerName: string | null
  correct: boolean | null // null = não validado ainda
}

state: {
  phase: GamePhase
  mode: 'normal' | 'easy'
  queue: PuzzlePlayer[]        // embaralhada no início
  queueIndex: number           // jogador ativo = queue[queueIndex]
  slots: Record<number, SlotState>  // key = rank (1-10)
  usedHelp: boolean
  helpActive: boolean          // true durante os 2s de animação
  score: number                // acertos confirmados
}
```

`PyramidShell`, `PlayerQueue`, `ModeSelector` e `ResultModal` são **controlled components** — recebem estado e callbacks como props. Sem `useReducer` por enquanto; `useState` é suficiente para este volume de estado.

**Alternativa considerada:** Estado distribuído em cada componente filho. Rejeitado: a validação de nível precisa saber qual jogador foi arrastado E em qual slot foi solto — essa correlação só existe no componente pai.

---

### Drag-and-drop com `@dnd-kit/core` — DndContext + useDraggable + useDroppable

**Decisão:** Usar a API de baixo nível do `@dnd-kit/core` (não `@dnd-kit/sortable`, que é para listas reordenáveis):
- `DndContext` envolve `PlayScreen` inteiro com `onDragEnd` handler
- `useDraggable({ id: player.player_id })` nos cards da fila
- `useDroppable({ id: \`slot-${rank}\` })` em cada `Slot` da pirâmide
- `onDragEnd`: extrair `active.id` (player_id) e `over.id` (slot-N), chamar `handleDrop(playerId, rank)`

**Alternativa considerada:** Drag-and-drop HTML nativo. Rejeitado: péssimo suporte em mobile touch; `@dnd-kit` tem suporte nativo a touch.

---

### Fila com jogador ativo — "um por um" vs. "todos visíveis"

**Decisão:** A fila exibe todos os 10 cards, mas apenas o primeiro não-posicionado (`queue[queueIndex]`) tem estado `active` (borda dourada, cursor de grab). Os demais ficam visíveis com opacidade reduzida (`opacity-50`). Isso é mais claro visualmente do que esconder os outros.

Ao soltar um card em slot válido (vazio), `queueIndex` avança para o próximo card não-posicionado.

---

### Feedback de acerto/erro — imediato vs. ao final

**Decisão:** Feedback **imediato** ao posicionar. O slot muda de estado `filled` para `correct` ou `incorrect` na mesma ação de `onDragEnd`. Usa `validateAnswer(rank, chosenLevel)` de `lib/validateAnswer.ts`.

**Alternativa considerada:** Revelar acertos só ao final. Rejeitado: spec `pyramid-game` diz "marcar o slot com indicador visual de acerto/erro" — implica imediato; além disso é mais divertido.

---

### Modo Fácil — badge no card ativo + highlight de slots ao arrastar

**Decisão:**
1. **Badge estático:** quando `mode === 'easy'`, o card ativo exibe `"📍 Nível X"` onde X é `queue[queueIndex].correct_level`
2. **Highlight ao arrastar:** o `DragOverlay` + `over.id` permitem saber durante o drag qual slot está sob o cursor. No modo Fácil, os slots do nível correto recebem classe `ring-2 ring-primary` enquanto o drag está ativo
3. Implementado via `onDragOver` do `DndContext` para atualizar `dragOverSlot` em estado local

---

### HELP — modal de confirmação + animação de 2s

**Decisão:**
1. Clique em "HELP" (no `TopBar`, recebe `onHelp` e `helpUsed` como props) abre `Modal` de confirmação
2. Ao confirmar: `usedHelp = true`, `helpActive = true`
3. `useEffect` com `setTimeout(2000)` reseta `helpActive = false`
4. Durante `helpActive`: slots com `correct = true` recebem estado `correct` (já tem estilo verde), slots com `correct = false` recebem `incorrect`. Slots `null` (não preenchidos) não mudam.

---

### ResultModal — componente dedicado, não reutiliza nada de `Modal` diretamente

**Decisão:** Criar `components/ResultModal.tsx` que internamente usa `<Modal>` de `components/ui/Modal.tsx`. Recebe `score`, `slots`, `usedHelp`, `onClose`. Exibe:
- Score em destaque: `"7 / 10"`
- Badge "(com dica 💡)" se `usedHelp`
- Mini-pirâmide: 4 linhas de emojis 🟩/🟥 (placeholder visual para Change 5)
- Botão "Compartilhar" desabilitado com tooltip "Em breve" (Change 5)
- Botão "Fechar"

---

### Replay detection — `useEffect` no mount do `PlayScreen`

**Decisão:** `useEffect(() => { const saved = localStorage.getItem(...); if (saved) setPhase('done') ... }, [])` no mount. Se dado existe, popula o estado e pula direto para `phase: 'done'` mostrando `ResultModal` com o score salvo.

**Save ao completar:** quando o último slot é preenchido (todos os 10 `queueIndex` avançados), `handleDrop` detecta `allDone` e chama `saveResult()` antes de `setPhase('done')`.

---

### `PyramidShell` e `PlayerQueue` — viram controlled components com props

**Decisão:** Ambos perdem seus estados internos (que eram vazios) e passam a receber:

`PyramidShell`:
```ts
interface PyramidShellProps {
  slots: Record<number, SlotState>
  mode: 'normal' | 'easy'
  helpActive: boolean
  activePlayerLevel?: Level  // nível correto do jogador ativo (modo Fácil)
  dragOverRank?: number      // slot sob o cursor durante drag (modo Fácil)
}
```

`PlayerQueue`:
```ts
interface PlayerQueueProps {
  queue: PuzzlePlayer[]
  queueIndex: number
  mode: 'normal' | 'easy'
  isDragging: boolean  // true durante drag ativo
}
```

## Risks / Trade-offs

- **Touch em mobile:** `@dnd-kit` tem suporte a touch via `TouchSensor`, mas o comportamento pode diferir de desktop. Risco: UX ruim em mobile. Mitigação: configurar `TouchSensor` com `activationConstraint: { delay: 100, tolerance: 8 }` para evitar conflito com scroll.
- **Animação HELP com `setTimeout`:** se o componente desmontar antes dos 2s, o `setTimeout` tentará setar estado em componente desmontado. Mitigação: limpar o timeout com `useEffect` cleanup.
- **`DragOverlay` e SSR:** `@dnd-kit` usa `createPortal`, que não funciona em SSR. `PlayScreen` já é Client Component (`'use client'`), então sem problema.
- **Estado de `helpActive` e `correct: null`:** slots não preenchidos durante HELP não mudam visual (correto pelo spec). Mas se o HELP é ativado com slots parcialmente preenchidos, os slots `null` ficam em `empty/active` — não há ambiguidade.
