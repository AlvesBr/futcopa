## ADDED Requirements

### Requirement: Cliente Supabase unificado
O sistema SHALL exportar dois construtores de cliente Supabase em `lib/supabase.ts`:
`createBrowserClient` (para Client Components) e `createServerClient` (para Server Components
e Route Handlers), nunca expondo a service role key no bundle do cliente.

#### Scenario: Uso em Server Component
- **WHEN** um Server Component importa `createServerClient` de `lib/supabase.ts`
- **THEN** o cliente usa `SUPABASE_URL` e `SUPABASE_ANON_KEY` com cookies do request
- **AND** a service role key não está presente no bundle enviado ao browser

#### Scenario: Uso em Client Component
- **WHEN** um Client Component importa `createBrowserClient` de `lib/supabase.ts`
- **THEN** o cliente usa apenas variáveis `NEXT_PUBLIC_*`
- **AND** é seguro incluir em código que roda no browser

### Requirement: Busca do puzzle diário com fallback
O sistema SHALL fornecer `getPuzzleOfDay(date: string): Promise<Puzzle | null>` em
`lib/getPuzzleOfDay.ts`, que busca o puzzle no Supabase e cai no JSON estático em caso
de erro ou data não encontrada no banco.

#### Scenario: Puzzle encontrado no Supabase
- **WHEN** `getPuzzleOfDay('2026-06-06')` é chamado
- **THEN** retorna o objeto `Puzzle` correspondente do banco
- **AND** o objeto inclui todos os campos tipados: `id`, `date`, `category`, `description`, `difficulty`, `players`

#### Scenario: Supabase indisponível — fallback JSON
- **WHEN** a query ao Supabase lança erro de rede
- **THEN** `getPuzzleOfDay` tenta encontrar a data em `data/puzzles.json`
- **AND** retorna o `Puzzle` do JSON se existir, ou `null` se não existir

#### Scenario: Data sem puzzle
- **WHEN** `getPuzzleOfDay` é chamado com uma data sem puzzle registrado (nem no banco, nem no JSON)
- **THEN** retorna `null`

### Requirement: Validação de resposta
O sistema SHALL fornecer `validateAnswer(rank: Rank, chosenLevel: Level): boolean` em
`lib/validateAnswer.ts`, usando o mapeamento `RANK_TO_LEVEL` de `lib/types.ts`.

#### Scenario: Resposta correta
- **WHEN** `validateAnswer(1, 1)` é chamado (rank 1 → nível 1)
- **THEN** retorna `true`

#### Scenario: Resposta incorreta
- **WHEN** `validateAnswer(1, 2)` é chamado (rank 1 não pertence ao nível 2)
- **THEN** retorna `false`

#### Scenario: Borda do mapeamento
- **WHEN** `validateAnswer(7, 4)` é chamado (ranks 7–10 → nível 4)
- **THEN** retorna `true`

### Requirement: Script de seed idempotente
O sistema SHALL fornecer `scripts/seed_puzzles.ts` que insere jogadores e puzzles no
Supabase via upsert, podendo ser re-executado sem duplicar dados.

#### Scenario: Primeira execução
- **WHEN** o script é executado com banco vazio
- **THEN** insere todos os jogadores únicos na tabela `players`
- **AND** insere todos os puzzles na tabela `puzzles` com datas corretas

#### Scenario: Re-execução (idempotente)
- **WHEN** o script é executado novamente com dados já presentes
- **THEN** atualiza os registros existentes sem criar duplicatas (upsert por `id`)

### Requirement: Fallback JSON estático
O sistema SHALL manter `data/puzzles.json` com os primeiros 7 puzzles no formato
do tipo `Puzzle[]`, para uso como fallback offline e em desenvolvimento local sem Supabase.

#### Scenario: Disponibilidade offline
- **WHEN** o app é iniciado sem variáveis de ambiente do Supabase configuradas
- **THEN** `getPuzzleOfDay` retorna dados de `data/puzzles.json` para as datas disponíveis
- **AND** o jogo funciona normalmente para essas datas
