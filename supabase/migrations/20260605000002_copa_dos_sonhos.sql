-- Copa dos Sonhos — Schema Supabase
-- Tabelas independentes do puzzle diário (Pyramid)

-- ============================================
-- TABELA: cup_editions
-- Uma linha por edição da Copa do Mundo (ex: Copa 1998)
-- ============================================
create table if not exists cup_editions (
  id            uuid primary key default gen_random_uuid(),
  year          int  not null unique,          -- ex: 1998
  host_country  text not null,                 -- ex: "França"
  champion      text not null,                 -- ex: "França"
  created_at    timestamptz default now()
);

-- ============================================
-- TABELA: cup_squads
-- Uma linha por seleção × edição (ex: Brasil na Copa 2002)
-- ============================================
create table if not exists cup_squads (
  id            uuid primary key default gen_random_uuid(),
  edition_id    uuid not null references cup_editions(id) on delete cascade,
  country_code  text not null,                 -- ISO-2: "BR", "AR"
  country_name  text not null,                 -- ex: "Brasil"
  flag_emoji    text not null,                 -- ex: "🇧🇷"
  phase_reached text not null default 'FASE_GRUPOS',
    -- valores: CAMPEÃO | VICE | SEMI | QUARTAS | OITAVAS | FASE_GRUPOS
  avg_rating    int  not null default 75,      -- média dos 11 maiores ratings; usado no pool de adversários
  created_at    timestamptz default now(),
  unique(edition_id, country_code)
);

-- ============================================
-- TABELA: cup_players
-- Um jogador por seleção × edição (rating por campanha, nunca por carreira)
-- Ex: Messi 2006 e Messi 2022 são dois cup_players distintos
-- ============================================
create table if not exists cup_players (
  id               uuid primary key default gen_random_uuid(),
  squad_id         uuid not null references cup_squads(id) on delete cascade,
  squad_number     int,                        -- número da camisa
  name             text not null,
  positions        text[] not null,            -- ex: ['CA', 'PE']; primeira = posição principal
  rating_computed  int  not null check(rating_computed between 60 and 99),
  rating_override  int  check(rating_override between 60 and 99),
    -- override manual para casos históricos que a fórmula não captura bem (ex: Maradona 1982)
  override_reason  text,                       -- justificativa do override
  photo_url        text,
  -- stats brutos usados no cálculo (preservados para auditoria e re-normalização)
  goals            int not null default 0,
  assists          int not null default 0,
  minutes_played   int,                        -- null se não disponível (Copas antigas)
  created_at       timestamptz default now()
);

-- View: rating efetivo = override se existir, senão computed
create or replace view cup_players_with_rating as
  select
    *,
    coalesce(rating_override, rating_computed) as rating
  from cup_players;

-- Índices úteis para as queries do draft
create index if not exists idx_cup_squads_edition   on cup_squads(edition_id);
create index if not exists idx_cup_squads_avg_rating on cup_squads(avg_rating);
create index if not exists idx_cup_players_squad     on cup_players(squad_id);
