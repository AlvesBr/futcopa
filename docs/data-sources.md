# Estratégia de Coleta de Dados

## Princípio fundamental
> Toda coleta é OFFLINE. Os scripts rodam uma vez, geram os dados,
> e o jogo nunca chama APIs externas em runtime.

---

## Fonte 1 — openfootball/worldcup.json

**Cobre:** Copas 1930–2022 (fixtures, gols por jogador, placares)
**Custo:** Gratuito, sem autenticação
**Como acessar:**

```python
import requests

BASE = "https://raw.githubusercontent.com/openfootball/worldcup.json/master"

anos = [1930,1934,1938,1950,1954,1958,1962,1966,1970,
        1974,1978,1982,1986,1990,1994,1998,2002,2006,
        2010,2014,2018,2022]

for ano in anos:
    url = f"{BASE}/{ano}/worldcup.json"
    data = requests.get(url).json()
    # data["rounds"] → lista de rodadas
    # cada rodada tem "matches" → lista de jogos
    # cada jogo tem "score1", "score2", "goals1", "goals2"
    # goals = [{"name": "Ronaldo", "minute": 45}]
```

**Dados disponíveis:**
- Todos os jogos com placar
- Gols por jogador com minuto (em copas mais recentes)
- Grupos e fase eliminatória

---

## Fonte 2 — FBRef.com

**Cobre:** Stats detalhadas 2014–2022 (passes, chutes, faltas, ratings)
**Custo:** Gratuito, scraping
**Como acessar:**

```python
import pandas as pd

# Artilheiros Copa 2014
url = "https://fbref.com/en/comps/1/2014/stats/2014-FIFA-World-Cup-Stats"
tabelas = pd.read_html(url)
# tabelas[0] = stats de todos os jogadores

# Para estatísticas específicas por jogador
url_jogador = "https://fbref.com/en/players/{player_id}/worldcup"
```

**Dados disponíveis:**
- Gols, assistências, passes completados
- Chutes totais e no alvo
- Faltas cometidas e sofridas
- Cartões amarelos e vermelhos
- Minutos jogados

**Headers necessários (evitar bloqueio):**
```python
headers = {
    "User-Agent": "Mozilla/5.0 (research project)"
}
# Adicionar delay de 3s entre requests
import time; time.sleep(3)
```

---

## Fonte 3 — API-Football

**Cobre:** Stats modernas 2006–2026 com cobertura completa
**Custo:** Gratuito até 100 requests/dia
**Cadastro:** https://www.api-football.com

**IDs de liga relevantes:**
```
Copa do Mundo = 1
Champions League = 2
Premier League = 39
La Liga = 140
Serie A = 135
Bundesliga = 78
Ligue 1 = 61
```

**Endpoints utilizados:**

```python
import requests

API_KEY = "SUA_CHAVE_AQUI"
BASE = "https://v3.football.api-sports.io"
HEADERS = {"x-apisports-key": API_KEY}

# Verificar cota restante
requests.get(f"{BASE}/status", headers=HEADERS)

# Artilheiros por copa
requests.get(f"{BASE}/players/topscorers",
    params={"league": 1, "season": 2022},
    headers=HEADERS)

# Troféus de um jogador
requests.get(f"{BASE}/trophies",
    params={"player": 276},  # ID do jogador
    headers=HEADERS)

# Stats de um jogo específico
requests.get(f"{BASE}/fixtures/players",
    params={"fixture": 855744},
    headers=HEADERS)

# Buscar ID de um jogador
requests.get(f"{BASE}/players",
    params={"search": "Messi", "season": 2022},
    headers=HEADERS)
```

**Custo estimado por tarefa:**
| Tarefa | Requests |
|---|---|
| Artilheiros 6 copas (2002–2022) | 6 |
| Stats por jogo Copa 2022 | ~64 |
| Troféus de 10 jogadores | 10 |
| **Total para 30 puzzles** | **~150** (2 dias) |

---

## Fonte 4 — Wikipedia

**Cobre:** Recordes históricos, listas all-time, dados pré-1966
**Custo:** Gratuito
**Como acessar:**

```python
import pandas as pd

# Lê tabelas HTML diretamente
url = "https://en.wikipedia.org/wiki/FIFA_World_Cup_records_and_statistics"
tabelas = pd.read_html(url)

# URLs úteis:
# /wiki/FIFA_World_Cup_records_and_statistics
# /wiki/FIFA_World_Cup_top_goalscorers
# /wiki/List_of_FIFA_World_Cup_hat-tricks
# /wiki/FIFA_World_Cup_Golden_Ball_award
```

---

## Formato Final — players.json

```json
[
  {
    "id": "messi-arg",
    "name": "Lionel Messi",
    "country": "Argentina",
    "country_code": "AR",
    "photo_url": "https://...supabase.co/storage/.../messi.jpg",
    "born_year": 1987,
    "api_football_id": 154,
    "wikipedia_slug": "Lionel_Messi"
  }
]
```

## Formato Final — puzzles.json

```json
[
  {
    "id": "day-001",
    "date": "2024-06-04",
    "category": "Gols na Copa do Mundo (carreira)",
    "description": "Ordene os jogadores pelo número de gols marcados em Copas do Mundo ao longo da carreira",
    "difficulty": "normal",
    "players": [
      {
        "player_id": "klose-ger",
        "name": "Miroslav Klose",
        "photo_url": "...",
        "value": 16,
        "correct_rank": 1,
        "correct_level": 1
      },
      {
        "player_id": "ronaldo-bra",
        "name": "Ronaldo Nazário",
        "photo_url": "...",
        "value": 15,
        "correct_rank": 2,
        "correct_level": 2
      }
    ]
  }
]
```

**Campo `correct_level`:** nível correto na pirâmide (1–4).
Calculado automaticamente pelo `build_puzzles.py` com base no rank.

---

## Ordem de execução dos scripts

```bash
# 1. Baixar dados brutos das copas
python scripts/fetch_openfootball.py
# Output: data/raw/worldcup_*.json

# 2. Coletar stats do FBRef
python scripts/fetch_fbref.py
# Output: data/raw/fbref_*.csv

# 3. Coletar stats da API-Football (distribuir em 2 dias)
python scripts/fetch_api_football.py
# Output: data/raw/apifootball_*.json

# 4. Montar players.json consolidado
python scripts/build_players.py
# Output: data/players.json

# 5. Montar puzzles.json com os 30 dias
python scripts/build_puzzles.py
# Output: data/puzzles.json

# 6. Popular Supabase
python scripts/seed_supabase.py
# Lê data/puzzles.json e insere no banco
```
