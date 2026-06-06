## 1. Modal delay + rastreamento de tempo

- [x] 1.1 Em `components/PlayScreen.tsx`, adicionar `startedAtRef = useRef<number>(0)` e atribuir `Date.now()` em `handleModeSelect`
- [x] 1.2 Em `handleDragEnd`, substituir `setShowResult(true)` imediato por `setTimeout(() => setShowResult(true), 800)` (com cleanup de ref)
- [x] 1.3 Calcular `timeSpent = Math.round((Date.now() - startedAtRef.current) / 1000)` antes do `saveResult` e incluir no `SavedResult`

## 2. Insert em user_results

- [x] 2.1 Em `components/PlayScreen.tsx`, após `saveResult()`, fazer insert fire-and-forget em `user_results` via `createBrowserClient()` com `{ puzzle_date, score, used_help, time_spent }`
- [x] 2.2 Capturar erros silenciosamente (não bloquear o jogo se Supabase estiver ausente)

## 3. Texto de compartilhamento + clipboard

- [x] 3.1 Em `components/ResultModal.tsx`, adicionar `buildShareText(date, category, slots, score, usedHelp): string` que gera o texto no formato Wordle (pirâmide emoji + score + "sem dica"/"com dica 💡")
- [x] 3.2 Implementar `copyToClipboard(text: string): Promise<void>` com fallback `execCommand` se `navigator.clipboard` não estiver disponível
- [x] 3.3 Adicionar estado `showToast: boolean` no `ResultModal`; ao copiar com sucesso, `setShowToast(true)`; renderizar `<Toast>` com mensagem "Copiado!" e `variant="success"`
- [x] 3.4 Habilitar o botão "Compartilhar" (remover `disabled` e `opacity-50`), conectar ao `copyToClipboard` com Toast de erro em caso de falha

## 4. Countdown

- [x] 4.1 Em `components/ResultModal.tsx`, implementar hook `useCountdown(): string` que retorna `HH:MM:SS` calculando o tempo até a meia-noite do próximo dia no fuso local
- [x] 4.2 Adicionar seção visual no modal: "Próximo puzzle em HH:MM:SS" abaixo dos botões de ação

## 5. Stats da comunidade

- [x] 5.1 Em `components/ResultModal.tsx`, adicionar prop `puzzleDate: string`; usar `useEffect` para buscar `puzzle_stats` via `createBrowserClient()` com estado `stats` e `statsLoading`
- [x] 5.2 Renderizar seção de stats no modal: total de jogadas, pontuação média, % com 10/10; mostrar "—" enquanto carrega ou em erro

## 6. OG Tags dinâmicas

- [x] 6.1 Em `app/play/[date]/page.tsx`, estender `generateMetadata` para buscar o puzzle e retornar `title`, `description`, `openGraph` e `twitter.card` com dados reais do puzzle

## 7. Prop `puzzleDate` e `category` propagadas ao ResultModal

- [x] 7.1 Em `components/PlayScreen.tsx`, passar `puzzleDate={puzzle.date}` e `category={puzzle.category}` para `ResultModal`
- [x] 7.2 Atualizar a interface `ResultModalProps` para incluir `puzzleDate` e `category`

## 8. Verificação

- [x] 8.1 Rodar `npm run typecheck` sem erros
- [x] 8.2 Rodar `npm run build` sem erros
