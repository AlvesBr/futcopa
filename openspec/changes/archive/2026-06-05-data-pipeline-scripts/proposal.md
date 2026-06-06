## Why

Os scripts Python estão documentados mas não existem. O `data/puzzles.json` tem apenas os 7 primeiros puzzles (criados manualmente no seed-puzzle-data). Esta change entrega o pipeline completo: coleta de dados brutos das fontes externas, consolidação de jogadores, geração dos 30 puzzles e validação do schema.

## What Changes

- Criar `requirements.txt` — dependências Python (`requests`, `pandas`, `lxml`, `python-dotenv`)
- Criar `data/raw/.gitkeep` — estrutura de diretório para arquivos brutos
- Criar `scripts/fetch_openfootball.py` — baixa todos os `worldcup_{ano}.json` do GitHub openfootball (sem auth, grátis); gera `data/raw/worldcup_*.json`
- Criar `scripts/fetch_fbref.py` — scraping via `pandas.read_html` das stats do FBRef 2014–2022; respeita delay ≥3s; gera `data/raw/fbref_*.csv`
- Criar `scripts/fetch_api_football.py` — coleta artilheiros/stats via API-Football v3; verifica cota antes de rodar; pula endpoints já cacheados em `data/raw/`; gera `data/raw/apifootball_*.json`
- Criar `scripts/build_players.py` — consolida jogadores únicos de todos os raw files; gera `data/players.json`
- Criar `scripts/build_puzzles.py` — codifica as definições dos 30 puzzles (de `docs/puzzles.md`), calcula `correct_level` automaticamente, expande o `data/puzzles.json` de 7 para 30 puzzles; datas começam em 2026-06-06
- Criar `scripts/validate_puzzles.ts` — valida schema de `data/puzzles.json`: 10 jogadores por puzzle, `correct_level` correto para cada rank, datas únicas, sem values duplicados não-documentados

## Capabilities

### New Capabilities
<!-- Nenhuma -->

### Modified Capabilities
<!-- Nenhuma — data-pipeline já especifica todos os requirements; esta change implementa sem alterar spec -->

## Impact

- **Novos arquivos:** `requirements.txt`, `data/raw/.gitkeep`, todos os scripts Python, `scripts/validate_puzzles.ts`
- **Modificado:** `data/puzzles.json` — expandido de 7 para 30 puzzles
- **Sem impacto no frontend** — scripts são offline; o jogo lê o mesmo `data/puzzles.json`
- **Sem novas dependências Node.js** — `validate_puzzles.ts` usa somente `node:fs` e `node:path`; Python deps ficam em `requirements.txt`
