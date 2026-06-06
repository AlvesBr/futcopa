## Why

O shell visual da tela de jogo existe (Change 3), mas está completamente estático — nenhum card se move, nenhum slot aceita input. Esta change transforma o `PlayScreen` num jogo funcional: drag-and-drop com `@dnd-kit/core`, validação em tempo real ao soltar cada card, modo fácil/normal, botão HELP e modal de pontuação ao completar os 10 slots.

## What Changes

- Transformar `components/PlayScreen.tsx` — gerenciador de estado completo do jogo (fila embaralhada, slots preenchidos, acertos, HELP usado, fase: `mode-select | playing | done`)
- Transformar `components/PyramidShell.tsx` — receptor de drag-and-drop com estados visuais por slot (empty/active/filled/correct/incorrect) e highlight de nível no modo Fácil
- Transformar `components/PlayerQueue.tsx` — drag source com jogador ativo destacado; fila avança após cada posicionamento
- Criar `components/ModeSelector.tsx` — tela de seleção Normal/Fácil exibida antes da fila aparecer; persiste escolha em localStorage
- Expandir `components/TopBar.tsx` — habilitar botão HELP (estado disponível/desabilitado, modal de confirmação)
- Criar `components/ResultModal.tsx` — usa `Modal` de `components/ui/`, exibe score (X/10), pirâmide resumida com cores de acerto/erro, "com dica 💡" se HELP usado, botão de compartilhamento (placeholder para Change 5)
- Implementar detecção de replay: ao montar `PlayScreen`, verificar `localStorage.getItem('puzzle_result_YYYY-MM-DD')` e exibir `ResultModal` com resultado anterior se existir
- Salvar resultado em localStorage ao completar: `{ score, usedHelp, completedAt, slots }`

## Capabilities

### New Capabilities
<!-- Nenhuma capacidade nova — esta change implementa specs existentes -->

### Modified Capabilities
<!-- Nenhuma — pyramid-game, game-modes e daily-puzzle já especificam todo o comportamento necessário -->

## Impact

- **Modificados:** `components/PlayScreen.tsx`, `components/PyramidShell.tsx`, `components/PlayerQueue.tsx`, `components/TopBar.tsx`
- **Novos:** `components/ModeSelector.tsx`, `components/ResultModal.tsx`
- **Reutiliza:** `components/ui/Modal.tsx`, `lib/validateAnswer.ts`, `lib/types.ts` (RANK_TO_LEVEL, SLOTS_PER_LEVEL, levelForRank), `@dnd-kit/core` (já instalado)
- **Sem novas dependências**
- **Base para Change 5 (results-and-sharing):** o `ResultModal` ficará pronto para receber lógica de texto de compartilhamento, countdown e stats
