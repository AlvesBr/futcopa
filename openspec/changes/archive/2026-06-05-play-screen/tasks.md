## 1. Estado de jogo e tipos

- [x] 1.1 Definir tipos internos do jogo em `components/PlayScreen.tsx`: `GamePhase`, `SlotEntry` (playerId, playerName, correct), estado completo do jogo
- [x] 1.2 Implementar `shuffleArray` (embaralhar fila) e `buildInitialSlots` (10 slots vazios) como helpers no arquivo
- [x] 1.3 Implementar `saveResult` e `loadResult` para localStorage com chave `puzzle_result_YYYY-MM-DD`

## 2. ModeSelector

- [x] 2.1 Criar `components/ModeSelector.tsx` — tela de seleção Normal/Fácil com botões distintos, persistência via localStorage (`fc-mode`)
- [x] 2.2 Integrar `ModeSelector` no `PlayScreen`: quando `phase === 'mode-select'`, renderizar `ModeSelector` em vez da pirâmide

## 3. Drag-and-drop com @dnd-kit

- [x] 3.1 Envolver `PlayScreen` com `DndContext` (sensors: PointerSensor + TouchSensor com delay), handler `onDragEnd`, `onDragOver`
- [x] 3.2 Transformar `PyramidShell.tsx` em controlled component: receber `slots`, `mode`, `helpActive`, `activePlayerLevel`, `dragOverRank`; usar `useDroppable` por slot
- [x] 3.3 Transformar `PlayerQueue.tsx` em controlled component: receber `queue`, `queueIndex`, `mode`; usar `useDraggable` no card ativo; outros cards com `opacity-50`
- [x] 3.4 Implementar `handleDrop(playerId, targetRank)` no `PlayScreen`: valida slot vazio, chama `validateAnswer`, atualiza `slots` e `queueIndex`, detecta `allDone`

## 4. Modo Fácil

- [x] 4.1 No `PlayScreen`, passar `activePlayerLevel` para `PyramidShell` quando `mode === 'easy'`
- [x] 4.2 No `PlayerQueue`, exibir badge `"📍 Nível X"` no card ativo quando `mode === 'easy'`
- [x] 4.3 No `PyramidShell`, durante drag ativo (`dragOverRank` definido), aplicar `ring-2 ring-primary` nos slots do nível correto no modo Fácil

## 5. Botão HELP

- [x] 5.1 Atualizar `components/TopBar.tsx`: receber props `onHelp`, `helpUsed`, `helpActive`; botão HELP com estado visual desabilitado quando `helpUsed`
- [x] 5.2 No `PlayScreen`, implementar `handleHelp`: abrir modal de confirmação → confirmar → `usedHelp = true`, `helpActive = true`
- [x] 5.3 Implementar timeout de 2s para resetar `helpActive = false` com cleanup no `useEffect`
- [x] 5.4 No `PyramidShell`, quando `helpActive` for true, aplicar estado `correct`/`incorrect` nos slots já preenchidos (sobrescreve temporariamente o estado visual)

## 6. ResultModal

- [x] 6.1 Criar `components/ResultModal.tsx`: usa `<Modal>`, exibe score `"X / 10"`, badge "(com dica 💡)" se `usedHelp`, mini-pirâmide 🟩/🟥, botão "Compartilhar" (desabilitado, tooltip "Em breve"), botão "Fechar"
- [x] 6.2 No `PlayScreen`, quando `phase === 'done'`, renderizar `ResultModal` com score e slots; salvar resultado em localStorage antes de mudar phase
- [x] 6.3 Implementar replay detection no `useEffect` do mount do `PlayScreen`: ler localStorage, se existir resultado → setar estado reconstruído e `phase: 'done'`

## 7. Verificação

- [x] 7.1 Rodar `npm run typecheck` sem erros
- [x] 7.2 Rodar `npm run build` sem erros
