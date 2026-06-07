## Context

O `ResultModal` existe e mostra score + pirâmide emoji, mas o botão "Compartilhar" está desabilitado e não há countdown nem stats. A Change 4 implementou o modal como placeholder. Esta change liga as três features que faltam: clipboard, countdown e stats.

Specs que guiam:
- `openspec/specs/results-sharing/spec.md` — modal 800ms, texto clipboard, stats comunidade, OG tags
- `openspec/specs/daily-puzzle/spec.md` — compartilhamento Wordle, countdown HH:MM:SS

## Goals / Non-Goals

**Goals:**
- Botão "Compartilhar" funcional: gera texto, copia para clipboard, mostra Toast "Copiado!"
- Countdown HH:MM:SS até meia-noite (próximo puzzle)
- Stats da comunidade: `total_plays`, `avg_score`, `perfect_scores` do Supabase `puzzle_stats`
- OG tags de texto dinâmicas por puzzle (title + description + twitter card)
- Modal abre com delay de 800ms após o último slot (já no spec)
- Insert em `user_results` ao completar: score, usedHelp, timeSpent

**Non-Goals:**
- Imagem OG gerada dinamicamente (Change 7)
- Auth/perfis de usuário (fora do escopo)
- Histórico de partidas anteriores

## Decisions

### Texto de compartilhamento — gerado em `ResultModal`, copiado via `navigator.clipboard`

**Decisão:** `buildShareText(date, category, slots, score, usedHelp): string` dentro de `ResultModal.tsx`. Formato:
```
⚽ FutCopa — 06/06/2026
🏆 Gols na Copa do Mundo

🟩
🟩🟩
🟩🟩🟥
🟥🟩🟩🟩

7/10 — sem dica
futcopa.vercel.app
```

Cópia via `navigator.clipboard.writeText(text).then(() => setShowToast(true))`. `Toast` com `variant="success"` e mensagem "Copiado!".

**Fallback:** `navigator.clipboard` pode não estar disponível (HTTP, browsers antigos). Neste caso, fallback para `document.execCommand('copy')` com `textarea` temporária. Se ambos falharem, mostrar Toast de erro "Não foi possível copiar".

**Alternativa:** `ClipboardItem` API — rejeitado por complexidade desnecessária para texto simples.

---

### Countdown — `useCountdown` hook em `ResultModal`

**Decisão:** Hook local `useCountdown()` dentro de `ResultModal.tsx` (não externo — só usado aqui). Calcula tempo até meia-noite do próximo dia em relação ao horário local:
```ts
function msUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setDate(midnight.getDate() + 1)
  midnight.setHours(0, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}
```
`setInterval(1000)` no `useEffect`, cleanup no return. Formata como `HH:MM:SS`.

**Alternativa:** Biblioteca de countdown (date-fns). Rejeitado — operação simples, não justifica dependência.

---

### Stats da comunidade — fetch client-side em `ResultModal`

**Decisão:** `ResultModal` recebe `puzzleDate: string` como prop e faz o fetch dentro de `useEffect` com `createBrowserClient()`:
```ts
const { data } = await supabase
  .from('puzzle_stats')
  .select('total_plays, avg_score, perfect_scores')
  .eq('puzzle_date', puzzleDate)
  .single()
```

Estados: `stats: PuzzleStats | null`, `statsLoading: boolean`. Se `data` for null ou erro: mostrar "—" nos valores (graceful degradation — stats não são críticas).

**Alternativa:** Buscar no Server Component e passar como prop. Rejeitado: stats mudam em tempo real conforme outros usuários jogam; fetch no client garante dado mais recente ao abrir o modal.

---

### Insert em `user_results` — no `PlayScreen` ao completar

**Decisão:** Em `handleDragEnd`, após `saveResult()` no localStorage, fazer insert no Supabase via `createBrowserClient()`. Insert é fire-and-forget (sem await bloqueante). Rastrear `startedAtRef = useRef(Date.now())` no `handleModeSelect`.

Se o insert falhar (sem Supabase configurado, offline): silencioso — o jogo não depende disso.

**Alternativa:** Salvar via Server Action. Rejeitado: requer auth ou CSRF token; o insert anônimo via client com RLS pública é suficiente para esta fase.

---

### 800ms delay — `setTimeout` em `handleDragEnd`

**Decisão:** Substituir `setPhase('done'); setShowResult(true)` por:
```ts
setPhase('done')
setTimeout(() => setShowResult(true), 800)
```
O `setPhase('done')` ocorre imediatamente (para parar o drag). O modal abre 800ms depois, dando tempo para a animação do último slot.

---

### OG Tags dinâmicas — `generateMetadata` no Server Component

**Decisão:** Estender `generateMetadata` em `app/play/[date]/page.tsx`:
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const puzzle = await getPuzzleOfDay(params.date)
  if (!puzzle) return { title: 'FutCopa' }
  return {
    title: `FutCopa — ${puzzle.category}`,
    description: puzzle.description ?? 'Você consegue ordenar os 10 maiores?',
    openGraph: {
      title: `FutCopa — ${puzzle.category}`,
      description: puzzle.description ?? 'Você consegue ordenar os 10 maiores?',
      type: 'website',
    },
    twitter: { card: 'summary', title: `FutCopa — ${puzzle.category}` },
  }
}
```

`getPuzzleOfDay` já é chamado pelo `page.tsx` — `generateMetadata` não faz double-fetch (Next.js deduplica `fetch` dentro do mesmo request).

## Risks / Trade-offs

- **`navigator.clipboard` e HTTPS:** Em desenvolvimento local (HTTP), `navigator.clipboard.writeText` pode falhar. Mitigação: fallback para `execCommand`.
- **Stats indisponíveis em dev:** Sem Supabase configurado, a seção de stats mostrará "—". O jogo funciona normalmente — stats são complementares.
- **`user_results` insert duplicado:** Se o usuário abre o puzzle em duas abas, pode inserir dois registros. Sem upsert por puzzleDate (a tabela não tem unique constraint nesse campo além do id). Aceitável — stats de média não são afetadas gravemente por duplicatas raras.
- **Countdown e fusos horários:** `setHours(0,0,0,0)` usa o fuso local do dispositivo. Se o usuário mudar de fuso, o countdown pode ser diferente. Aceitável — não é crítico.
