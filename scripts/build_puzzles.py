"""
Generate data/puzzles.json with all 30 puzzle definitions.
Puzzle data is hardcoded from docs/puzzles.md (already curated + verified).
correct_level is calculated automatically from correct_rank via RANK_TO_LEVEL.
Dates are sequential starting 2026-06-06.

Usage:
    python scripts/build_puzzles.py
"""

from __future__ import annotations

import json
import logging
import os
from datetime import date, timedelta

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

OUTPUT = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles.json")
START_DATE = date(2026, 6, 6)

RANK_TO_LEVEL: dict[int, int] = {
    1: 1,
    2: 2, 3: 2,
    4: 3, 5: 3, 6: 3,
    7: 4, 8: 4, 9: 4, 10: 4,
}


def level(rank: int) -> int:
    return RANK_TO_LEVEL[rank]


# ---------------------------------------------------------------------------
# Puzzle definitions — each entry is (category, description, difficulty, source, players)
# players: list of (player_id, name, value, correct_rank)
# ---------------------------------------------------------------------------

PUZZLES_RAW: list[dict] = [
    # Dia 1
    {
        "category": "Gols marcados na Copa do Mundo (carreira total)",
        "description": "Ordene os artilheiros históricos da Copa do Mundo pelo total de gols marcados. O melhor fica no topo!",
        "difficulty": "normal",
        "source": "Wikipedia + openfootball",
        "players": [
            ("klose-ger",     "Miroslav Klose",    16, 1),
            ("ronaldo-bra",   "Ronaldo Nazário",   15, 2),
            ("muller-g-ger",  "Gerd Müller",       14, 3),
            ("fontaine-fra",  "Just Fontaine",     13, 4),
            ("messi-arg",     "Lionel Messi",      13, 5),
            ("pele-bra",      "Pelé",              12, 6),
            ("mbappe-fra",    "Kylian Mbappé",     12, 7),
            ("kocsis-hun",    "Sándor Kocsis",     11, 8),
            ("klinsmann-ger", "Jürgen Klinsmann",  11, 9),
            ("rahn-ger",      "Helmut Rahn",       10, 10),
        ],
    },
    # Dia 2
    {
        "category": "Artilheiros da Copa 2022 — Qatar",
        "description": "Quem fez mais gols no Qatar 2022? Do artilheiro ao que marcou menos neste top 10.",
        "difficulty": "normal",
        "source": "API-Football / openfootball 2022",
        "players": [
            ("mbappe-fra",    "Kylian Mbappé",     8,  1),
            ("messi-arg",     "Lionel Messi",      7,  2),
            ("giroud-fra",    "Olivier Giroud",    4,  3),
            ("alvarez-arg",   "Julián Álvarez",    4,  4),
            ("rashford-eng",  "Marcus Rashford",   3,  5),
            ("gakpo-ned",     "Cody Gakpo",        3,  6),
            ("valencia-ecu",  "Enner Valencia",    3,  7),
            ("taremi-irn",    "Mehdi Taremi",      3,  8),
            ("saka-eng",      "Bukayo Saka",       3,  9),
            ("delaet-bel",    "Ritchie De Laet",   2,  10),
        ],
    },
    # Dia 3
    {
        "category": "Artilheiros da Copa 2014 — Brasil",
        "description": "Quem foi mais artilheiro no Brasil 2014? Ordene do maior para o menor goleador.",
        "difficulty": "normal",
        "source": "openfootball 2014 + API-Football",
        "players": [
            ("rodriguez-col", "James Rodríguez",   6,  1),
            ("muller-t-ger",  "Thomas Müller",     5,  2),
            ("neymar-bra",    "Neymar",            4,  3),
            ("benzema-fra",   "Karim Benzema",     4,  4),
            ("vanpersie-ned", "Robin van Persie",  4,  5),
            ("hummels-ger",   "Mats Hummels",      3,  6),
            ("gotze-ger",     "Mario Götze",       3,  7),
            ("robben-ned",    "Arjen Robben",      3,  8),
            ("messi-arg",     "Lionel Messi",      4,  9),
            ("schurrle-ger",  "André Schürrle",    3,  10),
        ],
    },
    # Dia 4
    {
        "category": "Gols na Copa — Era Clássica (1958–1986)",
        "description": "Os maiores artilheiros da era clássica da Copa. Do topo à base da pirâmide!",
        "difficulty": "normal",
        "source": "Wikipedia",
        "players": [
            ("muller-g-ger",  "Gerd Müller",       14, 1),
            ("fontaine-fra",  "Just Fontaine",     13, 2),
            ("pele-bra",      "Pelé",              12, 3),
            ("kocsis-hun",    "Sándor Kocsis",     11, 4),
            ("klinsmann-ger", "Jürgen Klinsmann",  11, 5),
            ("eusebio-por",   "Eusébio",           9,  6),
            ("seeler-ger",    "Uwe Seeler",        9,  7),
            ("cubillas-per",  "Teófilo Cubillas",  10, 8),
            ("maradona-arg",  "Diego Maradona",    8,  9),
            ("rossi-ita",     "Paolo Rossi",       9,  10),
        ],
    },
    # Dia 5
    {
        "category": "Copas em que marcou pelo menos 1 gol",
        "description": "Quantas Copas diferentes cada jogador balançou a rede? Do recordista ao que marcou em menos edições.",
        "difficulty": "normal",
        "source": "Wikipedia",
        "players": [
            ("ronaldo-c-por", "Cristiano Ronaldo", 5, 1),
            ("klose-ger",     "Miroslav Klose",    4, 2),
            ("pele-bra",      "Pelé",              4, 3),
            ("seeler-ger",    "Uwe Seeler",        4, 4),
            ("messi-arg",     "Lionel Messi",      4, 5),
            ("ronaldo-bra",   "Ronaldo Nazário",   2, 6),
            ("muller-g-ger",  "Gerd Müller",       2, 7),
            ("modric-cro",    "Luka Modrić",       2, 8),
            ("neymar-bra",    "Neymar",            2, 9),
            ("henry-fra",     "Thierry Henry",     2, 10),
        ],
    },
    # Dia 6
    {
        "category": "Total de jogos disputados na Copa do Mundo",
        "description": "Quem jogou mais partidas em Copas do Mundo ao longo da carreira? Do recordista à base.",
        "difficulty": "normal",
        "source": "Wikipedia / Olympics.com",
        "players": [
            ("messi-arg",      "Lionel Messi",       26, 1),
            ("matthaus-ger",   "Lothar Matthäus",    25, 2),
            ("klose-ger",      "Miroslav Klose",     24, 3),
            ("ronaldo-c-por",  "Cristiano Ronaldo",  22, 4),
            ("maradona-arg",   "Diego Maradona",     21, 5),
            ("seeler-ger",     "Uwe Seeler",         21, 6),
            ("mascherano-arg", "Javier Mascherano",  20, 7),
            ("zmuda-pol",      "Władysław Żmuda",    21, 8),
            ("lato-pol",       "Grzegorz Lato",      20, 9),
            ("maldini-ita",    "Paolo Maldini",      23, 10),
        ],
    },
    # Dia 7
    {
        "category": "Países com mais Copas do Mundo disputadas (1930–2022)",
        "description": "Quantas vezes cada seleção esteve presente em Copas do Mundo? Do país mais veterano ao menos presente.",
        "difficulty": "easy",
        "source": "Wikipedia",
        "players": [
            ("selecao-bra", "Brasil",            22, 1),
            ("selecao-ger", "Alemanha",          20, 2),
            ("selecao-ita", "Itália",            18, 3),
            ("selecao-arg", "Argentina",         18, 4),
            ("selecao-mex", "México",            17, 5),
            ("selecao-fra", "França",            16, 6),
            ("selecao-esp", "Espanha",           16, 7),
            ("selecao-eng", "Inglaterra",        16, 8),
            ("selecao-bel", "Bélgica",           14, 9),
            ("selecao-yug", "Iugoslávia/Sérvia", 12, 10),
        ],
    },
    # Dia 8
    {
        "category": "Jogadores com mais Copas disputadas (edições)",
        "description": "Quem participou do maior número de edições da Copa do Mundo? Do veterano máximo à base.",
        "difficulty": "normal",
        "source": "Wikipedia",
        "players": [
            ("carbajal-mex",  "Antonio Carbajal",  5, 1),
            ("matthaus-ger",  "Lothar Matthäus",   5, 2),
            ("marquez-mex",   "Rafael Márquez",    5, 3),
            ("guardado-mex",  "Andrés Guardado",   5, 4),
            ("ronaldo-c-por", "Cristiano Ronaldo", 5, 5),
            ("messi-arg",     "Lionel Messi",      5, 6),
            ("lato-pol",      "Grzegorz Lato",     3, 7),
            ("pele-bra",      "Pelé",              4, 8),
            ("maradona-arg",  "Diego Maradona",    4, 9),
            ("maldini-ita",   "Paolo Maldini",     4, 10),
        ],
    },
    # Dia 9
    {
        "category": "Minutos jogados no Qatar 2022",
        "description": "Quem passou mais tempo em campo na Copa de 2022? Do jogador mais minutos ao menos.",
        "difficulty": "normal",
        "source": "Dados públicos consolidados",
        "players": [
            ("messi-arg",      "Lionel Messi",         690, 1),
            ("martinez-e-arg", "Emiliano Martínez",    690, 2),
            ("otamendi-arg",   "Nicolás Otamendi",     690, 3),
            ("mbappe-fra",     "Kylian Mbappé",        629, 4),
            ("modric-cro",     "Luka Modrić",          570, 5),
            ("bounou-mar",     "Yassine Bounou",       540, 6),
            ("livakovic-cro",  "Dominik Livaković",    510, 7),
            ("griezmann-fra",  "Antoine Griezmann",    508, 8),
            ("giroud-fra",     "Olivier Giroud",       496, 9),
            ("kane-eng",       "Harry Kane",           480, 10),
        ],
    },
    # Dia 10
    {
        "category": "Partidas disputadas como capitão em Copas do Mundo",
        "description": "Quem mais liderou sua seleção com a braçadeira de capitão na Copa? Do recorde à base.",
        "difficulty": "normal",
        "source": "Guinness World Records + Wikipedia",
        "players": [
            ("messi-arg",      "Lionel Messi",        19, 1),
            ("cannavaro-ita",  "Fabio Cannavaro",     18, 2),
            ("beckenbauer-ger","Franz Beckenbauer",   18, 3),
            ("casillas-esp",   "Iker Casillas",       17, 4),
            ("marquez-mex",    "Rafael Márquez",      17, 5),
            ("maradona-arg",   "Diego Maradona",      16, 6),
            ("moore-eng",      "Bobby Moore",         14, 7),
            ("matthaus-ger",   "Lothar Matthäus",     13, 8),
            ("cafu-bra",       "Cafu",                7,  9),
            ("deschamps-fra",  "Didier Deschamps",    6,  10),
        ],
    },
    # Dia 11
    {
        "category": "Países com mais títulos mundiais conquistados",
        "description": "Quais seleções levantaram mais vezes a taça da Copa do Mundo? Da mais campeã à menos.",
        "difficulty": "easy",
        "source": "Wikipedia",
        "players": [
            ("selecao-bra", "Brasil",    5, 1),
            ("selecao-ger", "Alemanha",  4, 2),
            ("selecao-ita", "Itália",    4, 3),
            ("selecao-arg", "Argentina", 3, 4),
            ("selecao-fra", "França",    2, 5),
            ("selecao-uru", "Uruguai",   2, 6),
            ("selecao-eng", "Inglaterra",1, 7),
            ("selecao-esp", "Espanha",   1, 8),
            ("selecao-ned", "Holanda",   0, 9),
            ("selecao-por", "Portugal",  0, 10),
        ],
    },
    # Dia 12
    {
        "category": "Jogadores com mais títulos mundiais",
        "description": "Quantas Copas do Mundo cada jogador venceu? Do tricampeão à base.",
        "difficulty": "normal",
        "source": "Wikipedia",
        "players": [
            ("pele-bra",       "Pelé",             3, 1),
            ("cafu-bra",       "Cafu",             2, 2),
            ("roberto-c-bra",  "Roberto Carlos",   1, 3),
            ("ronaldo-bra",    "Ronaldo Nazário",  2, 4),
            ("ronaldinho-bra", "Ronaldinho",       1, 5),
            ("zidane-fra",     "Zinedine Zidane",  1, 6),
            ("klose-ger",      "Miroslav Klose",   1, 7),
            ("messi-arg",      "Lionel Messi",     1, 8),
            ("mbappe-fra",     "Kylian Mbappé",    1, 9),
            ("modric-cro",     "Luka Modrić",      0, 10),
        ],
    },
    # Dia 13
    {
        "category": "Países com mais finais de Copa do Mundo disputadas",
        "description": "Quais seleções mais vezes jogaram a grande final? Da mais frequente à menos.",
        "difficulty": "normal",
        "source": "Wikipedia",
        "players": [
            ("selecao-ger",  "Alemanha",          8, 1),
            ("selecao-bra",  "Brasil",            7, 2),
            ("selecao-ita",  "Itália",            6, 3),
            ("selecao-arg",  "Argentina",         6, 4),
            ("selecao-fra",  "França",            3, 5),
            ("selecao-ned",  "Holanda",           3, 6),
            ("selecao-uru",  "Uruguai",           2, 7),
            ("selecao-eng",  "Inglaterra",        1, 8),
            ("selecao-esp",  "Espanha",           1, 9),
            ("selecao-tch",  "Tcheco/Hungria",    2, 10),
        ],
    },
    # Dia 14
    {
        "category": "Copa do Mundo e Champions League no mesmo ano",
        "description": "Quem conquistou Copa do Mundo e Champions League no mesmo ano civil? Ordene pelos maiores títulos combinados.",
        "difficulty": "normal",
        "source": "Wikipedia + artigos históricos verificados",
        "players": [
            ("cafu-bra",      "Cafu",            2002, 1),
            ("roberto-c-bra", "Roberto Carlos",  2002, 2),
            ("ronaldo-bra",   "Ronaldo Nazário", 2002, 3),
            ("ronaldinho-bra","Ronaldinho",      2002, 4),
            ("gilberto-bra",  "Gilberto Silva",  2002, 5),
            ("khedira-ger",   "Sami Khedira",    2014, 6),
            ("varane-fra",    "Raphaël Varane",  2018, 7),
            ("kroos-ger",     "Toni Kroos",      2014, 8),
            ("marcelo-bra",   "Marcelo",         0,    9),
            ("ramos-esp",     "Sergio Ramos",    0,    10),
        ],
    },
    # Dia 15
    {
        "category": "Bola de Ouro da Copa do Mundo (Golden Ball)",
        "description": "Quem ganhou o prêmio de melhor jogador da Copa? Ordene do mais recente ao mais antigo.",
        "difficulty": "normal",
        "source": "Wikipedia",
        "players": [
            ("messi-arg",    "Lionel Messi",        2022, 1),
            ("modric-cro",   "Luka Modrić",         2018, 2),
            ("muller-t-ger", "Thomas Müller",       2010, 3),
            ("zidane-fra",   "Zinedine Zidane",     2006, 4),
            ("ronaldo-bra",  "Ronaldo Nazário",     2002, 5),
            ("rivaldo-bra",  "Rivaldo",             1998, 6),
            ("romario-bra",  "Romário",             1994, 7),
            ("schillaci-ita","Salvatore Schillaci", 1990, 8),
            ("maradona-arg", "Diego Maradona",      1986, 9),
            ("rossi-ita",    "Paolo Rossi",         1982, 10),
        ],
    },
    # Dia 16
    {
        "category": "Gols mais rápidos da Copa do Mundo (em segundos)",
        "description": "Quem marcou mais rápido na história da Copa? Do gol relâmpago ao mais demorado do top 10.",
        "difficulty": "normal",
        "source": "Wikipedia — Fastest goals in World Cup history",
        "players": [
            ("sukur-tur",   "Hakan Şükür",    11,   1),
            ("masek-tch",   "Václav Mašek",   15,   2),
            ("lehner-ger",  "Ernst Lehner",   60,   3),
            ("ruiz-crc",    "Bryan Ruiz",     60,   4),
            ("dempsey-usa", "Clint Dempsey",  30,   5),
            ("fowler-eng",  "Robbie Fowler",  120,  6),
            ("baggio-ita",  "Roberto Baggio", 120,  7),
            ("klose-ger",   "Miroslav Klose", 180,  8),
            ("robben-ned",  "Arjen Robben",   240,  9),
            ("benzema-fra", "Karim Benzema",  300,  10),
        ],
    },
    # Dia 17
    {
        "category": "Países com mais gols em uma única Copa do Mundo",
        "description": "Qual seleção mais balançou as redes em uma única edição da Copa? Do recorde à base.",
        "difficulty": "normal",
        "source": "Wikipedia + openfootball",
        "players": [
            ("selecao-hun-1954", "Hungria 1954",   27, 1),
            ("selecao-ger-1954", "Alemanha 1954",  25, 2),
            ("selecao-fra-1958", "França 1958",    23, 3),
            ("selecao-bra-1970", "Brasil 1970",    19, 4),
            ("selecao-ger-2014", "Alemanha 2014",  18, 5),
            ("selecao-bra-2002", "Brasil 2002",    18, 6),
            ("selecao-ned-1978", "Holanda 1978",   15, 7),
            ("selecao-arg-1978", "Argentina 1978", 15, 8),
            ("selecao-uru-1950", "Uruguai 1950",   15, 9),
            ("selecao-ita-1938", "Itália 1938",    11, 10),
        ],
    },
    # Dia 18
    {
        "category": "Goleiros com mais jogos sem sofrer gol na Copa (Clean Sheets)",
        "description": "Quais goleiros mais vezes fecharam o gol em Copas do Mundo? Do recordista à base.",
        "difficulty": "normal",
        "source": "Wikipedia + FBRef",
        "players": [
            ("shilton-eng",  "Peter Shilton",   10, 1),
            ("maier-ger",    "Sepp Maier",      9,  2),
            ("buffon-ita",   "Gianluigi Buffon", 8, 3),
            ("barthez-fra",  "Fabien Barthez",  8,  4),
            ("kahn-ger",     "Oliver Kahn",     7,  5),
            ("neuer-ger",    "Manuel Neuer",    7,  6),
            ("banks-eng",    "Gordon Banks",    6,  7),
            ("casillas-esp", "Iker Casillas",   5,  8),
            ("martinez-e-arg","Emiliano Martínez",4, 9),
            ("bounou-mar",   "Yassine Bounou",  3,  10),
        ],
    },
    # Dia 19
    {
        "category": "Países com mais expulsões em Copas do Mundo",
        "description": "Quais seleções acumularam mais cartões vermelhos na história da Copa? Do mais indisciplinado ao menos.",
        "difficulty": "normal",
        "source": "Wikipedia",
        "players": [
            ("selecao-bra", "Brasil",    11, 1),
            ("selecao-arg", "Argentina", 10, 2),
            ("selecao-uru", "Uruguai",   9,  3),
            ("selecao-ger", "Alemanha",  8,  4),
            ("selecao-cmr", "Camarões",  8,  5),
            ("selecao-por", "Portugal",  7,  6),
            ("selecao-ned", "Holanda",   7,  7),
            ("selecao-ita", "Itália",    6,  8),
            ("selecao-col", "Colômbia",  6,  9),
            ("selecao-fra", "França",    5,  10),
        ],
    },
    # Dia 20
    {
        "category": "Maiores goleadas da Copa do Mundo (saldo de gols)",
        "description": "Quais foram as maiores goleadas da história da Copa? Do saldo mais devastador ao menor.",
        "difficulty": "normal",
        "source": "openfootball (todos os placares 1930–2022)",
        "players": [
            ("hungria-elsalvador-1982", "Hungria 10×1 El Salvador (1982)",  9, 1),
            ("hungria-coreia-1954",     "Hungria 9×0 Coreia (1954)",        9, 2),
            ("iugo-zaire-1974",         "Iugoslávia 9×0 Zaire (1974)",      9, 3),
            ("alemanha-arabia-2002",    "Alemanha 8×0 Arábia (2002)",       8, 4),
            ("suecia-cuba-1938",        "Suécia 8×0 Cuba (1938)",           8, 5),
            ("uruguai-bolivia-1950",    "Uruguai 8×0 Bolívia (1950)",       8, 6),
            ("alemanha-brasil-2014",    "Alemanha 7×1 Brasil (2014)",       6, 7),
            ("portugal-coreia-2010",    "Portugal 7×0 Coreia (2010)",       7, 8),
            ("brasil-elsalvador-1982",  "Brasil 5×1 El Salvador (1982)",    4, 9),
            ("franca-paraguai-1998",    "França 1×0 Paraguai (1998)",       1, 10),
        ],
    },
    # Dia 21
    {
        "category": "Rating médio por partida no Qatar 2022 (mín. 5 jogos)",
        "description": "Quem teve o melhor desempenho médio avaliado por partida no Qatar 2022? Do mais bem avaliado ao décimo.",
        "difficulty": "normal",
        "source": "API-Football /fixtures/players",
        "players": [
            ("messi-arg",      "Lionel Messi",       84, 1),
            ("mbappe-fra",     "Kylian Mbappé",      81, 2),
            ("modric-cro",     "Luka Modrić",        79, 3),
            ("bounou-mar",     "Yassine Bounou",     78, 4),
            ("livakovic-cro",  "Dominik Livaković",  77, 5),
            ("alvarez-arg",    "Julián Álvarez",     76, 6),
            ("hakimi-mar",     "Achraf Hakimi",      75, 7),
            ("griezmann-fra",  "Antoine Griezmann",  74, 8),
            ("amrabat-mar",    "Sofyan Amrabat",     73, 9),
            ("kane-eng",       "Harry Kane",         71, 10),
        ],
    },
    # Dia 22
    {
        "category": "Assistências no Qatar 2022",
        "description": "Quem mais distribuiu passes para gol no Qatar 2022? Do líder em assistências à base.",
        "difficulty": "normal",
        "source": "API-Football",
        "players": [
            ("messi-arg",       "Lionel Messi",          3, 1),
            ("griezmann-fra",   "Antoine Griezmann",     3, 2),
            ("mbappe-fra",      "Kylian Mbappé",         2, 3),
            ("macallister-arg", "Alexis Mac Allister",   2, 4),
            ("fernandez-arg",   "Enzo Fernández",        2, 5),
            ("amrabat-mar",     "Sofyan Amrabat",        1, 6),
            ("hakimi-mar",      "Achraf Hakimi",         1, 7),
            ("modric-cro",      "Luka Modrić",           1, 8),
            ("giroud-fra",      "Olivier Giroud",        1, 9),
            ("alvarez-arg",     "Julián Álvarez",        1, 10),
        ],
    },
    # Dia 23
    {
        "category": "Passes completados na Copa da Rússia 2018",
        "description": "Quem mais acertou passes no Mundial de 2018? Do maestro do meio-campo à base.",
        "difficulty": "normal",
        "source": "FBRef.com — pandas.read_html()",
        "players": [
            ("kroos-ger",     "Toni Kroos",          316, 1),
            ("modric-cro",    "Luka Modrić",         298, 2),
            ("rakitic-cro",   "Ivan Rakitić",        271, 3),
            ("debruyne-bel",  "Kevin De Bruyne",     265, 4),
            ("busquets-esp",  "Sergio Busquets",     248, 5),
            ("thiago-esp",    "Thiago Alcântara",    231, 6),
            ("kante-fra",     "N'Golo Kanté",        196, 7),
            ("pogba-fra",     "Paul Pogba",          188, 8),
            ("casemiro-bra",  "Casemiro",            175, 9),
            ("xhaka-sui",     "Granit Xhaka",        168, 10),
        ],
    },
    # Dia 24
    {
        "category": "Defesas de goleiros no Qatar 2022 (Total de Saves)",
        "description": "Quais goleiros mais defenderam no Qatar 2022? Do guardião com mais defesas ao décimo.",
        "difficulty": "normal",
        "source": "Squawka / FBRef",
        "players": [
            ("livakovic-cro",  "Dominik Livaković",     26, 1),
            ("martinez-e-arg", "Emiliano Martínez",     23, 2),
            ("szczesny-pol",   "Wojciech Szczęsny",     19, 3),
            ("bounou-mar",     "Yassine Bounou",        19, 4),
            ("pickford-eng",   "Jordan Pickford",       17, 5),
            ("lloris-fra",     "Hugo Lloris",           15, 6),
            ("neuer-ger",      "Manuel Neuer",          14, 7),
            ("alisson-bra",    "Alisson",               12, 8),
            ("alsheeb-qat",    "Saad Al-Sheeb",         10, 9),
            ("courtois-bel",   "Thibaut Courtois",       8, 10),
        ],
    },
    # Dia 25
    {
        "category": "Finalizações no Alvo no Brasil 2014 (Shots on Target)",
        "description": "Quem mais chutou no gol no Brasil 2014? Do maior finalizador ao décimo.",
        "difficulty": "normal",
        "source": "FBRef.com",
        "players": [
            ("muller-t-ger",  "Thomas Müller",      10, 1),
            ("rodriguez-col", "James Rodríguez",    9,  2),
            ("benzema-fra",   "Karim Benzema",      8,  3),
            ("messi-arg",     "Lionel Messi",       8,  4),
            ("vanpersie-ned", "Robin van Persie",   7,  5),
            ("neymar-bra",    "Neymar",             7,  6),
            ("robben-ned",    "Arjen Robben",       6,  7),
            ("suarez-uru",    "Luis Suárez",        5,  8),
            ("higuain-arg",   "Gonzalo Higuaín",    5,  9),
            ("gotze-ger",     "Mario Götze",        4,  10),
        ],
    },
    # Dia 26
    {
        "category": "Idade do artilheiro em cada Copa (do mais jovem ao mais velho)",
        "description": "Qual era a idade do artilheiro quando ganhou a Chuteira de Ouro? Do mais jovem ao mais experiente.",
        "difficulty": "normal",
        "source": "Wikipedia + cálculo por data de nascimento",
        "players": [
            ("pele-bra",      "Pelé (1958)",          17, 1),
            ("thomas-m-ger",  "Thomas Müller (2010)", 20, 2),
            ("james-col",     "James Rodríguez (2014)",22,3),
            ("mbappe-fra",    "Kylian Mbappé (2022)", 23, 4),
            ("eusebio-por",   "Eusébio (1966)",       24, 5),
            ("muller-g-ger",  "Gerd Müller (1970)",   24, 6),
            ("kane-eng",      "Harry Kane (2018)",    24, 7),
            ("fontaine-fra",  "Just Fontaine (1958)", 25, 8),
            ("ronaldo-bra",   "Ronaldo Nazário (2002)",25,9),
            ("klose-ger",     "Miroslav Klose (2006)",27, 10),
        ],
    },
    # Dia 27
    {
        "category": "Países com mais expulsões em uma única Copa do Mundo",
        "description": "Qual seleção mais perdeu jogadores por expulsão em uma única edição da Copa?",
        "difficulty": "normal",
        "source": "Wikipedia + openfootball",
        "players": [
            ("nigeria-1998",   "Nigéria 1998",   3, 1),
            ("camaroes-1998",  "Camarões 1998",  3, 2),
            ("brasil-2006",    "Brasil 2006",    3, 3),
            ("franca-1998",    "França 1998",    2, 4),
            ("portugal-2006",  "Portugal 2006",  2, 5),
            ("uruguai-2010",   "Uruguai 2010",   2, 6),
            ("holanda-2010",   "Holanda 2010",   2, 7),
            ("colombia-2014",  "Colômbia 2014",  2, 8),
            ("equador-2006",   "Equador 2006",   1, 9),
            ("chile-2014",     "Chile 2014",     1, 10),
        ],
    },
    # Dia 28
    {
        "category": "Faltas sofridas em uma única Copa do Mundo",
        "description": "Quem foi mais fouled (sofreu mais faltas) em uma única edição da Copa? Do mais perseguido ao menos.",
        "difficulty": "normal",
        "source": "SportsHistori.com + registros Opta",
        "players": [
            ("maradona-1986", "Maradona (1986)", 53, 1),
            ("maradona-1990", "Maradona (1990)", 50, 2),
            ("maradona-1982", "Maradona (1982)", 36, 3),
            ("ortega-1998",   "Ariel Ortega (1998)",33,4),
            ("ardiles-1978",  "Ossie Ardiles (1978)",32,5),
            ("jairzinho-1974","Jairzinho (1974)", 30, 6),
            ("cruyff-1974",   "Johan Cruyff (1974)",30,7),
            ("kempes-1978",   "Kempes (1978)",    29, 8),
            ("robben-2014",   "Arjen Robben (2014)",28,9),
            ("toni-2006",     "Luca Toni (2006)", 28, 10),
        ],
    },
    # Dia 29
    {
        "category": "Edições da Copa do Mundo com mais gols no total",
        "description": "Quais Copas produziram mais gols? Da edição mais goleadora à décima.",
        "difficulty": "normal",
        "source": "openfootball (calculável direto dos JSONs 1930–2022)",
        "players": [
            ("copa-2022",  "Qatar 2022",         172, 1),
            ("copa-1998",  "França 1998",         171, 2),
            ("copa-2014",  "Brasil 2014",         171, 3),
            ("copa-2002",  "Coreia/Japão 2002",   161, 4),
            ("copa-1954",  "Suíça 1954",          140, 5),
            ("copa-1982",  "Espanha 1982",        146, 6),
            ("copa-2018",  "Rússia 2018",         169, 7),
            ("copa-1958",  "Suécia 1958",         126, 8),
            ("copa-1990",  "Itália 1990",         115, 9),
            ("copa-1970",  "México 1970",         95,  10),
        ],
    },
    # Dia 30
    {
        "category": "Hat-tricks na Copa do Mundo — gols totais na edição",
        "description": "Jogadores famosos por hat-tricks na Copa, ordenados pelo total de gols que marcaram naquela edição.",
        "difficulty": "normal",
        "source": "Wikipedia — Hat-tricks in FIFA World Cup",
        "players": [
            ("fontaine-fra",  "Just Fontaine (1958)",       13, 1),
            ("kocsis-hun",    "Sándor Kocsis (1954)",       11, 2),
            ("muller-g-ger",  "Gerd Müller (1970)",         10, 3),
            ("klose-ger",     "Miroslav Klose (2002)",       5, 4),
            ("ronaldo-bra",   "Ronaldo Nazário (2002)",      8, 5),
            ("ronaldo-c-por", "Cristiano Ronaldo (2018)",    4, 6),
            ("mbappe-fra",    "Kylian Mbappé (2022)",       12, 7),
            ("hurst-eng",     "Geoff Hurst (1966)",          4, 8),
            ("laszlo-hun",    "Laszlo Kiss (1982)",          3, 9),
            ("eusebio-por",   "Eusébio (1966)",              9, 10),
        ],
    },
]


def build_puzzles() -> list[dict]:
    puzzles = []
    for i, raw in enumerate(PUZZLES_RAW):
        day = i + 1
        puzzle_date = START_DATE + timedelta(days=i)
        puzzle_id = f"puzzle-{puzzle_date.isoformat()}"

        players = []
        for player_id, name, value, rank in raw["players"]:
            players.append({
                "player_id": player_id,
                "name": name,
                "value": value,
                "correct_rank": rank,
                "correct_level": level(rank),
            })

        puzzles.append({
            "id": puzzle_id,
            "date": puzzle_date.isoformat(),
            "category": raw["category"],
            "description": raw["description"],
            "difficulty": raw["difficulty"],
            "source": raw["source"],
            "players": players,
        })

        log.debug("Dia %02d  %s  %s", day, puzzle_date.isoformat(), raw["category"][:40])

    return puzzles


def main() -> None:
    puzzles = build_puzzles()

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(puzzles, f, ensure_ascii=False, indent=2)

    log.info("Gerados %d puzzles → %s", len(puzzles), OUTPUT)
    log.info("Datas: %s → %s", puzzles[0]["date"], puzzles[-1]["date"])


if __name__ == "__main__":
    main()
