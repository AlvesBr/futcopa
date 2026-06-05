# WorldCup Pyramid — Contexto do Projeto

## O que é
Jogo diário de ranquear 10 jogadores numa pirâmide de 4 níveis por categoria
(ex: gols na Copa, minutos jogados). Inspirado no Futbol11 Pyramid.
Referência: https://futbol11.netlify.app/futbol11-pyramid

## Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Banco de dados:** Supabase (PostgreSQL)
- **Coleta de dados:** Scripts Python (execução offline)
- **Drag-and-drop:** @dnd-kit/core
- **Deploy:** Vercel
- **Imagens:** Supabase Storage

## Estrutura de Pastas
```
worldcup-pyramid/
├── app/
│   ├── page.tsx                  ← Home (lista puzzles recentes)
│   ├── play/[date]/page.tsx      ← Puzzle do dia
│   ├── results/page.tsx          ← Resultado após jogar
│   └── layout.tsx
├── components/
│   ├── Pyramid.tsx               ← Componente da pirâmide
│   ├── PlayerCard.tsx            ← Card arrastável
│   ├── CategoryBadge.tsx         ← Exibe categoria do dia
│   └── ResultModal.tsx           ← Modal acerto/erro
├── lib/
│   ├── supabase.ts               ← Client Supabase
│   ├── getPuzzleOfDay.ts         ← Lógica puzzle diário
│   └── validateAnswer.ts         ← Verifica posições
├── scripts/                      ← Python, execução offline
│   ├── fetch_openfootball.py
│   ├── fetch_fbref.py
│   ├── fetch_api_football.py
│   └── build_puzzles.py
├── data/                         ← JSONs gerados pelos scripts
│   ├── players.json
│   └── puzzles.json
├── supabase/
│   └── schema.sql
├── docs/
│   ├── puzzles.md                ← 30 puzzles planejados com dados
│   └── data-sources.md           ← Fontes e estratégia de coleta
├── CLAUDE.md                     ← Este arquivo
└── openspec/                     ← Specs e changes do OpenSpec
```

## Mecânica da Pirâmide
```
        [ 1 ]          ← Nível 1 — topo (melhor valor)
      [ 2 ][ 3 ]       ← Nível 2
   [ 4 ][ 5 ][ 6 ]     ← Nível 3
 [ 7 ][ 8 ][ 9 ][10]   ← Nível 4 — base (pior valor)
```
- 10 jogadores por puzzle, ordenados pelo valor da categoria
- Jogadores aparecem um por um em fila aleatória
- Usuário arrasta cada jogador para um slot da pirâmide
- Ao soltar, o jogo valida se o nível está correto

## Regras do Jogo
- **Modo Fácil:** revela qual nível pertence antes de posicionar
- **Modo Normal:** sem dicas de nível
- **Botão HELP:** usável 1x por partida — revela quais estão corretos
- **Puzzle diário:** 1 por dia, sem replay (bloqueado via localStorage)
- **Pontuação:** acertos / 10 slots

## Modelo de Dados (Supabase)

### Tabela: players
```sql
id          uuid primary key
name        text not null
country     text
photo_url   text
born_year   int
created_at  timestamptz default now()
```

### Tabela: puzzles
```sql
id          uuid primary key
date        date unique not null        ← chave do puzzle diário
category    text not null               ← ex: "Gols na Copa do Mundo"
description text                        ← instrução para o usuário
players     jsonb not null              ← [{player_id, name, value, correct_rank}]
difficulty  text default 'normal'       ← 'easy' | 'normal'
created_at  timestamptz default now()
```

### Tabela: user_results (opcional — fase 2)
```sql
id          uuid primary key
puzzle_id   uuid references puzzles(id)
score       int                         ← 0–10
used_help   boolean default false
time_spent  int                         ← segundos
created_at  timestamptz default now()
```

## Fontes de Dados (Coleta OFFLINE)

| Fonte | Cobre | Como acessar |
|---|---|---|
| openfootball/worldcup.json | Copas 1930–2022 (fixtures, gols) | GitHub raw, sem auth |
| FBRef.com | Stats 2014–2022 | pandas.read_html() |
| API-Football (free) | Stats detalhadas 2006–2026 | 100 req/dia, coleta pontual |
| Wikipedia | Recordes históricos, listas | Scraping ou manual |
| Guinness World Records | Recordes específicos | Manual |

## Princípio Crítico de Dados
> Coleta de dados é SEMPRE offline.
> Os scripts Python geram JSONs ou populam o Supabase diretamente.
> **Nunca** chamar APIs externas no runtime do jogo.

## Configuração de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...    ← apenas nos scripts Python
API_FOOTBALL_KEY=...             ← apenas nos scripts Python
```

## Comandos Úteis
```bash
# Desenvolvimento
npm run dev

# Coleta de dados (rodar uma vez)
python scripts/fetch_openfootball.py
python scripts/fetch_fbref.py
python scripts/build_puzzles.py

# Deploy
vercel deploy
```

## Decisões Técnicas Tomadas
- **@dnd-kit** em vez de react-beautiful-dnd (mais moderno, melhor suporte a touch/mobile)
- **Supabase** em vez de Firebase (PostgreSQL, melhor para queries relacionais)
- **Next.js App Router** para ter SSR no puzzle diário (bom para SEO e OG tags de compartilhamento)
- **JSON estático** como fallback se Supabase estiver fora do ar
- Puzzle identificado pela **data** (YYYY-MM-DD) na URL e no banco

## Referências
- Jogo original: https://futbol11.netlify.app/futbol11-pyramid
- openfootball: https://github.com/openfootball/worldcup.json
- FBRef: https://fbref.com
- API-Football docs: https://www.api-football.com/documentation-v3
- 30 puzzles planejados: docs/puzzles.md
