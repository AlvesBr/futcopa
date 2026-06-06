## Why

O jogo está funcionalmente correto mas inutilizável em mobile: o drag-and-drop nunca ativa porque falta `touch-action: none` no elemento arrastável — o browser intercepta todos os toques como scroll. No desktop, a ausência de `max-width` consistente deixa o layout sem estrutura em telas largas. A fila de jogadores mostra todos os 10 de uma vez (os outros opacos), criando ambiguidade sobre quem pode ser jogado. O conjunto torna a experiência ruim nas duas plataformas.

## What Changes

- **`components/PlayerQueue.tsx`** — redesenhar: jogador atual em card grande e destacado no centro, próximos como mini-cards abaixo; mecânica de tap-to-select como alternativa ao drag (toca o card → fica "selecionado"; toca um slot → coloca)
- **`components/PyramidShell.tsx`** — slots maiores (min 108×68px), label do rank mais legível, estado `selected` visível quando tap-to-place está ativo
- **`components/PlayScreen.tsx`** — adicionar `touch-action: none` via inline style no DraggableCard; aumentar `TouchSensor` delay para 250ms; adicionar estado `selectedPlayerId` para tap-to-place; centralizar tela com `max-w-lg mx-auto`
- **`app/play/[date]/page.tsx`** (wrapper) — adicionar container centrado com `max-w-lg` para desktop

## Capabilities

### New Capabilities
<!-- Nenhuma — tap-to-place é mecânica alternativa ao drag, não novo requisito de jogo -->

### Modified Capabilities
- `pyramid-game`: adicionar cenário de interação por tap como alternativa ao drag em mobile

## Impact

- **Modificados:** `PlayScreen.tsx`, `PlayerQueue.tsx`, `PyramidShell.tsx`
- **Sem novas dependências**
- **Sem mudança em lógica de validação** — `handleDragEnd` e a lógica de `correct_level` não mudam; tap-to-place chama a mesma função de validação via novo `handleTapPlace`
