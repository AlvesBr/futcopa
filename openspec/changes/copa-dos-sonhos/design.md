## Context

O WorldCup Pyramid já possui Next.js 14 (App Router), Supabase, scripts Python e um design system com tokens. A Copa dos Sonhos é adicionada como modo independente — rotas próprias, modelo de dados próprio, sem tocar na lógica do puzzle diário existente.

Referência de produto: https://7a0.com.br — mecânicas mapeadas diretamente via inspeção do site.

## Goals / Non-Goals

**Goals:**
- Draft de 11 jogadores de seleções/Copas históricas distintas, com formação visual e box score em tempo real
- Simulação de torneio (grupos + knockout, 7 jogos) com gols por minuto e SEED determinístico
- Modo Clássico (ratings visíveis) e Almanaque (ratings ocultos)
- Re-sorteio: 3 tentativas por pick (seleção ou Copa independentemente)
- Card de campanha compartilhável

**Non-Goals:**
- Contas de usuário ou histórico persistido (estado via localStorage/sessionStorage)
- Multiplayer ou confronto entre usuários
- Dados em tempo real (coleta sempre offline via Python)
- Modo online de pesquisa de jogadores (sem autocomplete livre)

## Decisions

### D1 — Rota separada, não modal

**Decisão:** Copa dos Sonhos vive em `app/copa-dos-sonhos/` com páginas próprias (`/draft` e `/simulacao`), não como modal sobre o Pyramid.

**Alternativa considerada:** Modal/overlay dentro da home existente.

**Rationale:** Permite URL compartilhável com SEED (`/simulacao?seed=ABC`), não polui o roteamento do puzzle diário e isola o estado de jogo.

---

### D2 — Estado de draft em sessionStorage, não Supabase

**Decisão:** O estado da sessão de draft (time montado, picks feitos, re-rolls restantes) é mantido em `sessionStorage` no cliente.

**Alternativa considerada:** Persistir no Supabase para histórico futuro.

**Rationale:** O modo não requer login. Persistência no banco seria prematura (fase 1). O SEED da simulação é suficiente para reproduzir/compartilhar.

---

### D3 — Simulação 100% determinística via SEED

**Decisão:** Toda a campanha (sorteio de adversários, gols, minutos) é gerada por um PRNG seedado (ex: `mulberry32`). O SEED é codificado na URL da página de simulação.

**Alternativa considerada:** Simulação no servidor (Supabase Edge Function).

**Rationale:** Sem custo de servidor, offline-friendly, e o resultado é reproduzível ao compartilhar o link.

---

### D4 — Tabelas novas, sem alterar schema existente

**Decisão:** Criar `cup_editions`, `cup_squads` e `cup_players` como tabelas independentes. Não reutilizar a tabela `players` existente (que é do puzzle diário).

**Rationale:** Modelo de dados diferente (rating numérico, posições múltiplas como array, squad_number). Evita acoplamento e permite evoluir independentemente.

---

### D5 — Ratings normalizados 60–99

**Decisão:** Todos os jogadores recebem rating entre 60 e 99, calculado offline pelo script `build_ratings.py` com base em participações, gols, caps e fontes históricas (FBRef, openfootball).

**Alternativa considerada:** Rating binário (titular/reserva).

**Rationale:** Rating numérico permite box score de ataque/defesa e diferenciação estratégica entre jogadores. Escala 60–99 evita extremos e é familiar (estilo FIFA).

---

### D6 — Posições como array de strings

**Decisão:** `positions: text[]` no Supabase (ex: `['LD', 'MD']`). A primeira posição é a principal.

**Rationale:** Multi-posição é central para a mecânica de atribuição de slot. Array simples é suficiente; sem necessidade de tabela relacional de posições.

---

### D7 — Engine de simulação em TypeScript puro (client-side)

**Decisão:** A engine de simulação roda no browser, sem chamada ao servidor. Algoritmo: rating médio de ataque vs rating médio de defesa adversária → probabilidade de gol por minuto.

**Rationale:** Latência zero, sem custo de API, funciona offline. A simulação não precisa ser "justa" — precisa ser divertida e coerente com os ratings.

### D8 — Rating é sempre por edição de Copa, nunca por carreira

**Decisão:** Não existe "rating global" de jogador no sistema. Messi tem um `cup_player` distinto para cada Copa em que participou, cada um com seu próprio `rating` calculado com base na performance naquele torneio específico.

**Rationale:** Reflete a realidade do esporte — um jogador em diferentes momentos da carreira tem capacidades distintas. Messi 2006 (19 anos, fase de grupos) é fundamentalmente diferente de Messi 2022 (Copa conquistada, líder incontestável). Isso também aumenta a profundidade estratégica do draft.

**Impacto no schema:** `cup_players.rating` é calculado por `(squad_id, player_name)` — a combinação seleção + Copa é a chave de identidade do jogador no sistema.

---

### D9 — Home refatorada como hub de modos com Pyramid como hero

**Decisão:** `app/page.tsx` deixa de ser um redirect automático e passa a ser uma hub page com dois níveis: bloco hero (Pyramid, puzzle do dia em destaque) e grid secundário (demais modos). Novos modos são registrados em `lib/gameModes.ts`.

**Alternativa considerada:** Manter redirect para o puzzle diário e adicionar link de volta para a hub.

**Rationale:** O Pyramid é o produto de hábito diário — merece destaque permanente. Mas tratar todos os modos como iguais (dois cards lado a lado) apagaria o diferencial do puzzle diário. A home com hero + grid secundário escala para N modos sem mudança estrutural: adicionar um modo = uma entrada no array de `gameModes`.

---

### D10 — SEED com sub-streams independentes por domínio

**Decisão:** O SEED principal é derivado em múltiplos sub-PRNGs, um por domínio de evento, usando XOR com constantes fixas: `mulberry32(seed ^ 0x01)` para adversários, `^ 0x02` para gols, `^ 0x03` para minutos, `^ 0x04` para pênaltis. Cada domínio consome seu próprio stream sem afetar os outros.

**Alternativa considerada:** Um único PRNG global com sequência fixa de chamadas.

**Rationale:** Um único stream é frágil — inserir um novo tipo de evento (ex: cartões) no meio da sequência corrompe todos os SEEDs existentes retroativamente. Sub-streams isolados permitem adicionar novos domínios sem quebrar campanhas já geradas. O SEED identifica a run do usuário; não é mecanismo de replay para terceiros (um link compartilhado não reproduz a campanha para quem tem time diferente).

**Implementação de referência:**
```typescript
// lib/simulation/prng.ts
export function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildRngs(seed: number) {
  return {
    adversarios: mulberry32(seed ^ 0x01),
    gols:        mulberry32(seed ^ 0x02),
    minutos:     mulberry32(seed ^ 0x03),
    penaltis:    mulberry32(seed ^ 0x04),
    // Novos domínios futuros: ^ 0x05, ^ 0x06 ... sem quebrar os anteriores
  };
}
```

---

### D11 — SEED como identificador de run, não mecanismo de replay

**Decisão:** O SEED compartilhado num link (`/simulacao?seed=ABC123`) identifica a run do usuário — adversários sorteados, estrutura da campanha. Não reproduz o resultado exato para quem tem um time diferente, pois os gols dependem dos ratings dos jogadores do time montado.

**Alternativa considerada:** Codificar o time completo na URL para replay perfeito.

**Rationale:** Codificar o time na URL tornaria a URL ilegível e manipulável. O SEED cumpre o papel de "identificador único da sua campanha" — permite o usuário dizer "joguei com SEED #ABC123 e cheguei à final". Isso é suficiente para o valor social de compartilhamento sem a complexidade de um replay completo.

---

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Dados históricos incompletos (Copas antigas) | Focar em 1966–2022; marcar edições sem dados como indisponíveis |
| Rating subjetivo pode parecer "errado" para fãs | Documentar critérios claramente; permitir ajuste manual nos JSONs |
| sessionStorage perdida ao fechar aba | Aceitar como comportamento esperado (modo arcade, não salva progresso) |
| Simulação desequilibrada (time fraco nunca vence) | Adicionar fator de variância mínimo; testar distribuição de resultados |
| Escopo de coleta de dados subestimado (~4000 elencos) | Scripts incrementais por Copa; rodar em lotes; fallback JSON estático |

## Migration Plan

1. Criar tabelas novas via migração Supabase (sem alterar existentes)
2. Rodar scripts Python para popular dados (offline, uma vez)
3. Deploy das novas rotas Next.js (sem feature flag — rotas novas não quebram existentes)
4. Rollback: remover rotas `app/copa-dos-sonhos/` e dropar tabelas (dados isolados)

## Open Questions

- **Quantas edições de Copa incluir no lançamento?** Proposta: 1966–2022 (15 edições). Copas anteriores têm dados muito escassos.
- **Algoritmo de rating para jogadores pré-1966?** Não se aplica ao MVP.
- **O card compartilhável deve incluir foto dos jogadores?** Depende da disponibilidade de fotos no Supabase Storage (já existe para o Pyramid).
- **Limite de runs por dia?** Por ora ilimitado — não há mecanismo de rate limiting no plano gratuito.
