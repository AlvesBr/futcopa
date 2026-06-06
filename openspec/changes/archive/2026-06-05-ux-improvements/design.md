## Context

Stack atual: @dnd-kit/core com `PointerSensor` + `TouchSensor`. O `DraggableCard` em `PlayerQueue.tsx` monta `listeners` e `attributes` do `useDraggable` no elemento raiz, mas não define `touch-action: none` — o browser trata o toque como scroll e cancela o evento antes de o @dnd-kit conseguir assumir o drag. É o problema documentado no FAQ oficial do @dnd-kit.

Layout: `PlayScreen` usa `min-h-screen flex flex-col bg-bg` sem nenhum container centrado. Em 1440px tudo fica espalhado. A pirâmide fica no centro mas visualmente parece "flutuando".

Fila: `PlayerQueue` renderiza todos os 10 players em `flex flex-wrap`. O ativo tem `border-primary`; os demais têm `opacity-40`. Mas como são todos cards do mesmo tamanho, a hierarquia visual é fraca — o usuário não entende imediatamente que só pode jogar o primeiro.

## Goals / Non-Goals

**Goals:**
- Drag-and-drop funciona em mobile (fix crítico)
- Tap-to-place como alternativa em mobile e desktop
- Layout desktop centrado e estruturado
- Fila de jogadores com hierarquia visual clara
- Slots com touch targets adequados (≥48px)

**Non-Goals:**
- Redesign do sistema de cores / tokens (já definido)
- Animações elaboradas (só transições CSS já existentes)
- Suporte a múltiplos jogadores simultâneos na fila (jogo é um por vez)

## Decisions

### Decisão 1: `touch-action: none` inline no elemento com listeners

**Escolhido:** Adicionar `style={{ touchAction: 'none' }}` diretamente no `div` que recebe `{...listeners}` em `DraggableCard`.

**Rationale:** É a correção canônica documentada no @dnd-kit. CSS via Tailwind (`touch-none`) funciona igualmente mas inline é mais explícito sobre a razão.

### Decisão 2: Tap-to-place via estado `selectedPlayerId` em PlayScreen

**Escolhido:** `PlayScreen` mantém `selectedPlayerId: string | null`. Click/tap no card ativo alterna seleção. Click/tap num slot vazio enquanto há seleção → chama `handlePlace(rank)` (mesma lógica de `handleDragEnd`). Drag também continua funcionando — as duas mecânicas coexistem.

**Alternativa rejeitada:** Implementar tap-to-place dentro do `DraggableCard` usando estado local. Rejeitada porque o estado de seleção precisa ser compartilhado com `PyramidShell` para highlight dos slots.

**Fluxo:**
```
tap card ativo → selectedPlayerId = player.player_id
tap slot vazio → handlePlace(rank) → selectedPlayerId = null
tap card ativo novamente → deseleciona (selectedPlayerId = null)
drag inicia → selectedPlayerId = null (drag tem prioridade)
```

### Decisão 3: Fila redesenhada — card único em destaque + fila compacta abaixo

**Escolhido:**
- Jogador atual: card grande, centralizado, com nome completo + avatar + valor se fácil. Tem borda `border-primary` e sombra. Touch target grande.
- Próximos jogadores: row horizontal de mini-avatares/círculos compactos (só iniciais) abaixo do card ativo. Sem nomes, sem interatividade. Indica quantos faltam visualmente.
- Counter "X / 10 posicionados" acima do card.

**Rationale:** Clareza imediata — o usuário vê "este é o jogador atual" sem ambiguidade. A fila de próximos dá contexto sem poluir.

### Decisão 4: Layout com `max-w-lg` centrado em wrapper único

**Escolhido:** Adicionar `<div className="w-full max-w-lg mx-auto flex flex-col flex-1">` dentro do `PlayScreen`, envolvendo pirâmide + fila. `TopBar` e `CategoryBadge` permanecem full-width (visual de app, não de card).

**Alternativa rejeitada:** `max-w` no `app/play/[date]/page.tsx` (wrapper SSR). Rejeitada porque `PlayScreen` é o componente que sabe do contexto de jogo; o page é apenas routing.

### Decisão 5: Slots 108×68px (mobile) escalando para 120×76px via `sm:`

**Escolhido:** Classes Tailwind `w-[108px] h-[68px] sm:w-[120px] sm:h-[76px]`. Número do rank passa de badge `w-5 h-5` para `w-6 h-6`.

**Rationale:** 108px largura acomoda nomes de até ~8 caracteres em `fc-caption`. 68px altura é touch target confortável. Em desktop o slot maior fica melhor proporcionalmente com o espaçamento da pirâmide.

## Risks / Trade-offs

- **[Gap da pirâmide em mobile]** Com slots maiores, a pirâmide nível 4 (4 slots) ocupa ~4×108+3×8px ≈ 456px. Cabe em iPhone SE (375px)? → Mitigation: reduzir `gap` de `gap-2` para `gap-1.5` na linha do nível 4, ou aplicar `gap-1` só no nível 4. Verificar no build.
- **[Tap vs Drag prioridade]** Se o usuário começa a arrastar enquanto há `selectedPlayerId`, o drag deve ter prioridade e limpar a seleção → Mitigation: `onDragStart` limpa `selectedPlayerId`.
- **[PyramidShell recebe selectedPlayerId]** Isso aumenta o acoplamento entre PlayScreen e PyramidShell → Mitigation: passar como prop opcional `selectedPlayerId?: string` — sem quebrar uso atual.
