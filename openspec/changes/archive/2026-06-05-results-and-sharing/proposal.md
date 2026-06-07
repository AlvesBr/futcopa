## Why

O `ResultModal` existe mas mostra um placeholder "Compartilhar (em breve)". Esta change finaliza a experiência pós-jogo: texto de compartilhamento para clipboard, countdown até o próximo puzzle, estatísticas da comunidade via Supabase e OG tags dinâmicas por puzzle.

## What Changes

- **`components/ResultModal.tsx`** — habilitar botão de compartilhamento (clipboard API + toast "Copiado!"), adicionar countdown HH:MM:SS até meia-noite, adicionar seção de stats da comunidade (busca assíncrona em `puzzle_stats`)
- **`components/PlayScreen.tsx`** — adicionar delay de 800ms antes de abrir o modal após o último slot, rastrear `startedAt` para calcular `timeSpent`, inserir resultado em `user_results` (insert anônimo, RLS público)
- **`app/play/[date]/page.tsx`** — estender `generateMetadata` com `openGraph.title`, `openGraph.description` e `twitter.card` usando dados do puzzle (texto; imagem OG gerada fica para Change 7)

## Capabilities

### New Capabilities
<!-- Nenhuma capacidade nova -->

### Modified Capabilities
<!-- Nenhuma — results-sharing e daily-puzzle já especificam todo o comportamento; esta change implementa sem alterar requirements -->

## Impact

- **Modificados:** `components/ResultModal.tsx`, `components/PlayScreen.tsx`, `app/play/[date]/page.tsx`
- **Reutiliza:** `components/ui/Toast.tsx` (feedback "Copiado!"), `lib/supabase.ts` (`createBrowserClient`), `lib/types.ts` (`PuzzleStats`)
- **Sem novas dependências**
- **OG image gerada** fica para Change 7 (deploy-and-seo) — esta change entrega apenas tags de texto
- **`user_results` insert:** anônimo, sem auth; RLS já permite em produção
