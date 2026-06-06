## 1. Fix Crítico Mobile

- [x] 1.1 Em `PlayScreen.tsx`: aumentar `TouchSensor` delay de `100` para `250`ms
- [x] 1.2 Em `PlayerQueue.tsx` (`DraggableCard`): adicionar `style={{ touchAction: 'none' }}` no `div` que recebe `{...listeners}` e `{...attributes}`

## 2. Tap-to-Place

- [x] 2.1 Em `PlayScreen.tsx`: adicionar estado `selectedPlayerId: string | null` (inicial `null`); limpar em `handleDragStart` e após `handlePlace`
- [x] 2.2 Em `PlayScreen.tsx`: criar `handlePlace(rank: Rank)` — mesma lógica de `handleDragEnd` mas usando `selectedPlayerId` em vez de `active.id`; chamar quando slot é clicado com seleção ativa
- [x] 2.3 Em `PlayScreen.tsx`: passar `selectedPlayerId` e `onSelectPlayer` para `PlayerQueue`; passar `selectedPlayerId` e `onSlotClick` para `PyramidShell`
- [x] 2.4 Em `PlayerQueue.tsx`: o card ativo ao ser clicado/tocado alterna `selectedPlayerId` (set se não selecionado, null se já selecionado); exibir anel `ring-2 ring-primary` quando selecionado
- [x] 2.5 Em `PyramidShell.tsx`: slot vazio clicado com `selectedPlayerId != null` chama `onSlotClick(rank)`; exibir estado visual `selected-hint` (anel pulsante) em slots vazios quando há seleção ativa

## 3. Layout Desktop

- [x] 3.1 Em `PlayScreen.tsx`: envolver pirâmide + fila num `<div className="w-full max-w-lg mx-auto flex flex-col flex-1 items-center">` dentro do `DndContext`

## 4. Slots Maiores

- [x] 4.1 Em `PyramidShell.tsx` (`DroppableSlot`): aumentar de `w-[84px] h-[56px]` para `w-[100px] h-[64px] sm:w-[112px] sm:h-[72px]`; badge do rank de `w-5 h-5` para `w-6 h-6 text-[11px]`
- [x] 4.2 Em `PyramidShell.tsx`: reduzir `gap` do nível 4 para `gap-1.5` (evitar overflow em telas estreitas) — usar `data-level` ou condicional no map

## 5. Fila de Jogadores Redesenhada

- [x] 5.1 Em `PlayerQueue.tsx`: remover o `flex-wrap` atual; substituir por layout de dois blocos — (a) card grande do jogador atual com nome completo + avatar, (b) row de mini-avatares dos próximos (apenas `Avatar size={24}` sem nome, não interativos)
- [x] 5.2 Em `PlayerQueue.tsx`: mover o counter `"X / 10 posicionados"` para acima do card atual; adicionar instrução contextual curta ("Arraste ou toque para posicionar")

## 6. Verificação

- [x] 6.1 Executar `npm run build` e confirmar build sem erros
- [x] 6.2 Testar no Chrome DevTools mobile (iPhone SE 375px) — confirmar que drag inicia e tap-to-place funciona
- [x] 6.3 Testar em desktop (1280px+) — confirmar que o layout está centrado e a pirâmide não estica
