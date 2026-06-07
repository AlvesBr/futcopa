# Setup do Supabase

Guia para criar o backend gratuito do WorldCup Pyramid e conectar o projeto.

## 1. Criar o projeto

1. Acesse https://app.supabase.com e faça login (plano **Free** basta).
2. **New project** → escolha uma organização, dê um nome (ex.: `worldcup-pyramid`),
   defina uma senha de banco forte e a região mais próxima dos jogadores. **Create**.
3. Aguarde o provisionamento (~2 min).

## 2. Rodar o schema

1. No projeto, abra **SQL Editor** → **New query**.
2. Cole **todo** o conteúdo de [`../supabase/schema.sql`](../supabase/schema.sql) e clique em **Run**.
3. O schema é **idempotente** (`create table if not exists`, `add column if not exists`,
   `drop policy if exists`), então é seguro reaplicar quando ele evoluir.
4. Confira em **Table Editor** que existem: `players`, `puzzles`, `user_results`, `reports`
   e a view `puzzle_stats`.

## 3. Pegar as chaves

Em **Settings → API**, copie:

| Valor | Onde usar |
|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend) |
| **service_role** | `SUPABASE_SERVICE_ROLE_KEY` (**apenas** scripts/seed; nunca no frontend) |

## 4. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores acima. O `.env.local` está no `.gitignore` — **não**
comite chaves. A `service_role` e a `API_FOOTBALL_KEY` ficam **só** localmente (scripts
Python offline), nunca na Vercel.

## 5. Segurança (RLS)

O schema já habilita Row Level Security:

- `players`, `puzzles`: leitura pública; escrita só com `service_role`.
- `user_results`: insert público anônimo + leitura pública (stats agregadas).
- `reports`: insert público anônimo; **leitura só com `service_role`** (moderação).

> Os dados são populados pelos scripts (change `seed-puzzle-data` / `data-pipeline-scripts`)
> usando a `service_role`. O frontend nunca chama APIs externas em runtime.
