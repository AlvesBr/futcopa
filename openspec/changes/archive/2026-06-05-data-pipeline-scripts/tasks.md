## 1. Infraestrutura

- [x] 1.1 Criar `requirements.txt` com dependências Python: `requests`, `pandas`, `lxml`, `python-dotenv`
- [x] 1.2 Criar `data/raw/.gitkeep` para garantir que o diretório esteja no repositório

## 2. Scripts de Coleta

- [x] 2.1 Criar `scripts/fetch_openfootball.py` — baixa `worldcup_{ano}.json` para cada copa 1930–2022 do GitHub openfootball; pula arquivo se já existir em `data/raw/`; loga gols e jogos por copa; trata copas sem dados de gols por jogador com warning
- [x] 2.2 Criar `scripts/fetch_fbref.py` — scraping via `pandas.read_html()` das URLs de stats do FBRef (2014, 2018, 2022); delay ≥3s entre requests; máximo 20 requests por sessão; continua para próxima URL em caso de erro; salva CSVs em `data/raw/fbref_{ano}_stats.csv`
- [x] 2.3 Criar `scripts/fetch_api_football.py` — verifica cota via `/status` antes de rodar (avisa e pede confirmação se `requests_remaining < 20`); pula endpoints já em cache em `data/raw/`; coleta artilheiros por copa (leagueId=1) e stats de fixtures; salva em `data/raw/apifootball_{endpoint}_{params}.json`

## 3. Scripts de Build

- [x] 3.1 Criar `scripts/build_players.py` — extrai jogadores únicos do payload hardcoded dos 30 puzzles; deduplica por `player_id`; gera `data/players.json` com campos: `id`, `name`, `country`, `country_code`, `photo_url` (null), `born_year` (null se desconhecido)
- [x] 3.2 Criar `scripts/build_puzzles.py` — codifica as definições dos 30 puzzles (dias 1–30 de `docs/puzzles.md`) como estrutura Python; calcula `correct_level` automaticamente via RANK_TO_LEVEL (1→1, 2-3→2, 4-6→3, 7-10→4); atribui datas sequenciais a partir de 2026-06-06; gera IDs `"day-001"` a `"day-030"`; escreve `data/puzzles.json` completo (sobrescreve)

## 4. Validação TypeScript

- [x] 4.1 Criar `scripts/validate_puzzles.ts` — valida `data/puzzles.json`: (a) cada puzzle tem exatamente 10 players, (b) `correct_level` de cada player bate com RANK_TO_LEVEL do `correct_rank`, (c) datas são únicas e formato YYYY-MM-DD, (d) avisa (sem falhar) se values duplicados dentro do mesmo puzzle; imprime resumo e sai com `process.exit(1)` se houver erros

## 5. Verificação

- [x] 5.1 Executar `python scripts/build_puzzles.py` e confirmar que `data/puzzles.json` tem 30 puzzles com datas 2026-06-06 a 2026-07-05
- [x] 5.2 Executar `npm run validate:puzzles` (via `tsx scripts/validate_puzzles.ts`) e confirmar saída sem erros
