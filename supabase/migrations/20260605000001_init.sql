-- WorldCup Pyramid — Schema Supabase
-- Executar no SQL Editor do Supabase

-- ============================================
-- TABELA: players
-- ============================================
create table if not exists players (
  id            text primary key,          -- ex: "messi-arg"
  name          text not null,
  country       text not null,
  country_code  text,                       -- ISO 2 letras: "AR", "BR"
  photo_url     text,
  born_year     int,
  api_football_id int,                      -- ID na API-Football
  wikipedia_slug  text,                     -- para links e scraping
  created_at    timestamptz default now()
);

-- Atribuição da imagem (obrigatória quando há photo_url; ex.: Wikimedia Commons).
-- Idempotente para permitir reaplicar o schema com segurança.
alter table players add column if not exists photo_credit      text;
alter table players add column if not exists photo_license     text;
alter table players add column if not exists photo_source_url  text;

-- ============================================
-- TABELA: puzzles
-- ============================================
create table if not exists puzzles (
  id            uuid primary key default gen_random_uuid(),
  date          date unique not null,       -- chave do puzzle diário
  category      text not null,             -- ex: "Gols na Copa do Mundo"
  description   text,                      -- instrução para o usuário
  difficulty    text default 'normal'
    check (difficulty in ('easy', 'normal')),
  players       jsonb not null,            -- array ordenado de jogadores
  -- Estrutura de players (jsonb):
  -- [{
  --   player_id: string,
  --   name: string,
  --   photo_url: string,
  --   value: number,         ← valor da categoria
  --   correct_rank: number,  ← posição correta (1–10)
  --   correct_level: number  ← nível correto na pirâmide (1–4)
  -- }]
  source        text,                      -- fonte dos dados
  created_at    timestamptz default now()
);

-- Index para busca por data (mais comum)
create index if not exists puzzles_date_idx on puzzles(date);

-- ============================================
-- TABELA: user_results
-- ============================================
create table if not exists user_results (
  id            uuid primary key default gen_random_uuid(),
  puzzle_id     uuid references puzzles(id) on delete cascade,
  puzzle_date   date not null,             -- desnormalizado para queries rápidas
  score         int not null               -- 0 a 10
    check (score >= 0 and score <= 10),
  used_help     boolean default false,
  time_spent    int,                       -- segundos
  share_text    text,                      -- texto gerado para compartilhar
  created_at    timestamptz default now()
);

-- Index para analytics
create index if not exists user_results_puzzle_date_idx on user_results(puzzle_date);
create index if not exists user_results_score_idx on user_results(score);

-- ============================================
-- TABELA: reports
-- Reporte de erro de dado em um puzzle (torcedor exigente). Insert anônimo público,
-- leitura restrita ao service role (moderação).
-- ============================================
create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  puzzle_date   date not null,
  player_id     text,                        -- opcional: jogador específico do report
  reason        text not null,               -- categoria/curto motivo
  details       text,                        -- descrição livre
  created_at    timestamptz default now()
);

create index if not exists reports_puzzle_date_idx on reports(puzzle_date);

-- ============================================
-- VIEW: puzzle_stats
-- Stats agregadas por puzzle para exibir após o jogo
-- ============================================
create or replace view puzzle_stats as
select
  puzzle_date,
  count(*)                                    as total_plays,
  round(avg(score), 1)                        as avg_score,
  count(*) filter (where score = 10)          as perfect_scores,
  count(*) filter (where used_help = true)    as used_help_count,
  round(avg(time_spent))                      as avg_time_seconds
from user_results
group by puzzle_date;

-- ============================================
-- ROW LEVEL SECURITY
-- Habilitar RLS para produção
-- ============================================

-- puzzles: leitura pública, escrita apenas service role
alter table puzzles enable row level security;

create policy "puzzles_public_read"
  on puzzles for select
  using (true);

-- players: leitura pública
alter table players enable row level security;

create policy "players_public_read"
  on players for select
  using (true);

-- user_results: inserção pública (anônimo), leitura pública agregada
alter table user_results enable row level security;

create policy "user_results_insert"
  on user_results for insert
  with check (true);

create policy "user_results_public_read"
  on user_results for select
  using (true);

-- reports: inserção pública (anônima); SEM leitura pública (apenas service role modera).
-- drop/create para idempotência (Postgres não tem CREATE POLICY IF NOT EXISTS).
alter table reports enable row level security;

drop policy if exists "reports_public_insert" on reports;
create policy "reports_public_insert"
  on reports for insert
  with check (true);
