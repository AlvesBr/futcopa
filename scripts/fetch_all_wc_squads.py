"""
fetch_all_wc_squads.py
======================
Coleta elencos completos de TODAS as seleções de todas as Copas do Mundo (1970–2022).

Fontes (offline, sem API key):
  1. Wikipedia  — elencos completos de toda Copa 1970-2022
                  (nome, posição, data de nascimento, caps, gols)
  2. FBRef       — stats em partidas para Copas 2006-2022 (enriquecimento)

Pipeline:
  fetch_all_wc_squads.py  →  data/all_wc_squads.json
  build_ratings.py        →  data/cup_players_rated.json
  seed_copa_supabase.py   →  Supabase (upsert idempotente)

Uso:
    pip install pandas requests lxml python-dotenv supabase
    python scripts/fetch_all_wc_squads.py
    python scripts/fetch_all_wc_squads.py --years 2018 2022
    python scripts/fetch_all_wc_squads.py --no-fbref     # só Wikipedia
    python scripts/fetch_all_wc_squads.py --gen-sql      # gera SQL em vez de JSON

Cobertura máxima:
  - 13 edições (1970–2022)
  - até 32 seleções × 23 jogadores por Copa
  - potencial: ~400 squads · ~7.000 jogadores

Notas:
  - Respeita rate-limit: sleep entre requisições
  - Idempotente: ON CONFLICT DO NOTHING
  - Ratings são estimados (ver compute_rating); adicione overrides para lendas
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import time
import unicodedata
import uuid
from datetime import datetime
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
OUT_FILE = os.path.join(DATA_DIR, "all_wc_squads.json")

# ---------------------------------------------------------------------------
# Metadados fixos de edições
# ---------------------------------------------------------------------------
EDITIONS: list[dict[str, Any]] = [
    {"year": 1970, "host_country": "México",        "champion": "Brasil"},
    {"year": 1974, "host_country": "Alemanha",      "champion": "Alemanha"},
    {"year": 1978, "host_country": "Argentina",     "champion": "Argentina"},
    {"year": 1982, "host_country": "Espanha",       "champion": "Itália"},
    {"year": 1986, "host_country": "México",        "champion": "Argentina"},
    {"year": 1990, "host_country": "Itália",        "champion": "Alemanha"},
    {"year": 1994, "host_country": "EUA",           "champion": "Brasil"},
    {"year": 1998, "host_country": "França",        "champion": "França"},
    {"year": 2002, "host_country": "Japão/Coreia",  "champion": "Brasil"},
    {"year": 2006, "host_country": "Alemanha",      "champion": "Itália"},
    {"year": 2010, "host_country": "África do Sul", "champion": "Espanha"},
    {"year": 2014, "host_country": "Brasil",        "champion": "Alemanha"},
    {"year": 2018, "host_country": "Rússia",        "champion": "França"},
    {"year": 2022, "host_country": "Qatar",         "champion": "Argentina"},
]

# Fase alcançada por seleção em cada Copa (para avg_rating e pool de adversários)
# Fontes: Wikipedia, results oficiais FIFA
PHASES: dict[int, dict[str, str]] = {
    1970: {
        "BR": "CAMPEÃO", "IT": "VICE", "DE": "SEMI", "UY": "SEMI",
        "MX": "QUARTAS", "URSS": "QUARTAS", "PE": "QUARTAS", "BR2": "QUARTAS",
    },
    1974: {
        "DE": "CAMPEÃO", "NL": "VICE", "PL": "SEMI", "BR": "SEMI",
        "AR": "QUARTAS", "SE": "QUARTAS", "UY": "QUARTAS", "YU": "QUARTAS",
    },
    1978: {
        "AR": "CAMPEÃO", "NL": "VICE", "BR": "SEMI", "IT": "SEMI",
        "PL": "QUARTAS", "PE": "QUARTAS", "AU": "QUARTAS", "DE": "QUARTAS",
    },
    1982: {
        "IT": "CAMPEÃO", "DE": "VICE", "PL": "SEMI", "FR": "SEMI",
        "BR": "QUARTAS", "AR": "QUARTAS", "EN": "QUARTAS", "AU": "QUARTAS",
    },
    1986: {
        "AR": "CAMPEÃO", "DE": "VICE", "FR": "SEMI", "BE": "SEMI",
        "MX": "QUARTAS", "ES": "QUARTAS", "BR": "QUARTAS", "EN": "QUARTAS",
    },
    1990: {
        "DE": "CAMPEÃO", "AR": "VICE", "IT": "SEMI", "EN": "SEMI",
        "YU": "QUARTAS", "CS": "QUARTAS", "IE": "QUARTAS", "CR": "QUARTAS",
    },
    1994: {
        "BR": "CAMPEÃO", "IT": "VICE", "SE": "SEMI", "BG": "SEMI",
        "RO": "QUARTAS", "NL": "QUARTAS", "GER": "QUARTAS", "ES": "QUARTAS",
    },
    1998: {
        "FR": "CAMPEÃO", "BR": "VICE", "HR": "SEMI", "NL": "SEMI",
        "IT": "QUARTAS", "AR": "QUARTAS", "DE": "QUARTAS", "DK": "QUARTAS",
    },
    2002: {
        "BR": "CAMPEÃO", "DE": "VICE", "TR": "SEMI", "KR": "SEMI",
        "ES": "QUARTAS", "EN": "QUARTAS", "SN": "QUARTAS", "JP": "QUARTAS",
    },
    2006: {
        "IT": "CAMPEÃO", "FR": "VICE", "DE": "SEMI", "PT": "SEMI",
        "AR": "QUARTAS", "EN": "QUARTAS", "ES": "QUARTAS", "UA": "QUARTAS",
    },
    2010: {
        "ES": "CAMPEÃO", "NL": "VICE", "DE": "SEMI", "UY": "SEMI",
        "AR": "QUARTAS", "BR": "QUARTAS", "GH": "QUARTAS", "PY": "QUARTAS",
    },
    2014: {
        "DE": "CAMPEÃO", "AR": "VICE", "NL": "SEMI", "BR": "SEMI",
        "FR": "QUARTAS", "BE": "QUARTAS", "CO": "QUARTAS", "CR": "QUARTAS",
    },
    2018: {
        "FR": "CAMPEÃO", "HR": "VICE", "BE": "SEMI", "EN": "SEMI",
        "RU": "QUARTAS", "SE": "QUARTAS", "BR": "QUARTAS", "UY": "QUARTAS",
    },
    2022: {
        "AR": "CAMPEÃO", "FR": "VICE", "HR": "SEMI", "MA": "SEMI",
        "NL": "QUARTAS", "BR": "QUARTAS", "EN": "QUARTAS", "PT": "QUARTAS",
    },
}

FLAG_EMOJIS: dict[str, str] = {
    "AR": "🇦🇷", "BR": "🇧🇷", "DE": "🇩🇪", "FR": "🇫🇷", "IT": "🇮🇹",
    "ES": "🇪🇸", "EN": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "NL": "🇳🇱", "PT": "🇵🇹", "UY": "🇺🇾",
    "HR": "🇭🇷", "BE": "🇧🇪", "SE": "🇸🇪", "MX": "🇲🇽", "CO": "🇨🇴",
    "CL": "🇨🇱", "US": "🇺🇸", "NG": "🇳🇬", "CM": "🇨🇲", "SN": "🇸🇳",
    "MA": "🇲🇦", "ZA": "🇿🇦", "JP": "🇯🇵", "KR": "🇰🇷", "AU": "🇦🇺",
    "CH": "🇨🇭", "RU": "🇷🇺", "DK": "🇩🇰", "CZ": "🇨🇿", "UA": "🇺🇦",
    "TR": "🇹🇷", "EC": "🇪🇨", "GH": "🇬🇭", "IR": "🇮🇷", "PL": "🇵🇱",
    "RS": "🇷🇸", "CR": "🇨🇷", "TN": "🇹🇳", "ME": "🇲🇪", "PA": "🇵🇦",
    "IS": "🇮🇸", "EG": "🇪🇬", "PE": "🇵🇪", "SN": "🇸🇳", "QA": "🇶🇦",
    "WA": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "CA": "🇨🇦", "AU": "🇦🇺", "GH": "🇬🇭",
    "BG": "🇧🇬", "RO": "🇷🇴", "YU": "🇷🇸",
    "URSS": "🇷🇺",   # União Soviética
    "CS": "🇨🇿",    # Tchecoslováquia
    "GDR": "🇩🇪",   # Alemanha Oriental
    "IE": "🇮🇪",    # Irlanda
    "PY": "🇵🇾",    # Paraguai
}

COUNTRY_NAMES: dict[str, str] = {
    "AR": "Argentina", "BR": "Brasil", "DE": "Alemanha", "FR": "França",
    "IT": "Itália", "ES": "Espanha", "EN": "Inglaterra", "NL": "Holanda",
    "PT": "Portugal", "UY": "Uruguai", "HR": "Croácia", "BE": "Bélgica",
    "SE": "Suécia", "MX": "México", "CO": "Colômbia", "CL": "Chile",
    "US": "EUA", "NG": "Nigéria", "CM": "Camarões", "SN": "Senegal",
    "MA": "Marrocos", "ZA": "África do Sul", "JP": "Japão", "KR": "Coreia do Sul",
    "AU": "Austrália", "CH": "Suíça", "RU": "Rússia", "DK": "Dinamarca",
    "CZ": "República Tcheca", "UA": "Ucrânia", "TR": "Turquia",
    "EC": "Equador", "GH": "Gana", "IR": "Irã", "PL": "Polônia",
    "RS": "Sérvia", "CR": "Costa Rica", "TN": "Tunísia",
    "BG": "Bulgária", "RO": "Romênia", "YU": "Iugoslávia", "PY": "Paraguai",
    "IE": "Irlanda", "IS": "Islândia", "EG": "Egito", "PE": "Peru",
    "WA": "País de Gales", "CA": "Canadá", "QA": "Qatar",
    "URSS": "União Soviética", "CS": "Tchecoslováquia",
    "GDR": "Alemanha Oriental", "ME": "Montenegro",
}

# ---------------------------------------------------------------------------
# Overrides de rating para jogadores lendários
# (chave: "nome_normalizado|ano_copa")
# ---------------------------------------------------------------------------
RATING_OVERRIDES: dict[str, int] = {
    # 1970
    "pele|1970": 99, "jairzinho|1970": 92, "tostao|1970": 88, "gerson|1970": 88,
    "rivelino|1970": 87, "carlos alberto|1970": 86,
    "beckenbauer|1970": 92, "muller|1970": 94, "seeler|1970": 82,
    "riva|1970": 88, "mazzola|1970": 84,
    # 1974
    "beckenbauer|1974": 98, "muller|1974": 96, "netzer|1974": 88, "overath|1974": 87,
    "breitner|1974": 85, "maier|1974": 88,
    "cruyff|1974": 99, "neeskens|1974": 88, "rep|1974": 80, "rensenbrink|1974": 84,
    # 1978
    "kempes|1978": 92, "ardiles|1978": 84, "passarella|1978": 85,
    "rensenbrink|1978": 84, "neeskens|1978": 86, "krol|1978": 87,
    # 1982
    "zico|1982": 96, "socrates|1982": 94, "falcao|1982": 90, "junior|1982": 84,
    "platini|1982": 94, "rummenigge|1982": 90, "rossi|1982": 90,
    "schumacher|1982": 82, "briegel|1982": 83,
    # 1986
    "maradona|1986": 99, "valdano|1986": 82, "burruchaga|1986": 83,
    "platini|1986": 93, "schumacher|1986": 81, "rummenigge|1986": 85,
    "matthaus|1986": 92, "voller|1986": 82, "lineker|1986": 88,
    # 1990
    "maradona|1990": 92, "caniggia|1990": 87, "baggio|1990": 88,
    "schillaci|1990": 84, "klinsmann|1990": 85, "matthaus|1990": 95,
    "lineker|1990": 86, "gascoigne|1990": 86,
    # 1994
    "romario|1994": 96, "bebeto|1994": 89, "ronaldo|1994": 82,  # jovem Ronaldo
    "baggio|1994": 93, "baresi|1994": 92, "maldini|1994": 92, "costacurta|1994": 85,
    "stoichkov|1994": 88, "klinsmann|1994": 84,
    # 1998
    "zidane|1998": 96, "henry|1998": 85, "trezeguet|1998": 80,
    "ronaldo|1998": 93, "bebeto|1998": 85, "rivaldo|1998": 90, "cafu|1998": 84,
    "suker|1998": 88, "bilic|1998": 78,
    # 2002
    "ronaldo|2002": 97, "rivaldo|2002": 91, "ronaldinho|2002": 91, "cafu|2002": 83,
    "r carlos|2002": 86, "roberto carlos|2002": 86,
    "kahn|2002": 96, "ballack|2002": 93, "klose|2002": 85,
    "ahn|2002": 80, "hong|2002": 78,
    # 2006
    "zidane|2006": 96, "henry|2006": 91, "ribery|2006": 84, "malouda|2006": 77,
    "buffon|2006": 95, "cannavaro|2006": 95, "pirlo|2006": 92, "totti|2006": 88,
    "gattuso|2006": 83, "del piero|2006": 83, "toni|2006": 82,
    "ronaldo|2006": 92, "figo|2006": 88, "deco|2006": 84,
    "klose|2006": 84, "podolski|2006": 82, "schweinsteiger|2006": 80,
    "lampard|2006": 86, "gerrard|2006": 87, "rooney|2006": 85,
    "riquelme|2006": 88, "crespo|2006": 80,
    # 2010
    "iniesta|2010": 93, "xavi|2010": 92, "villa|2010": 88, "torres|2010": 84,
    "casillas|2010": 90, "puyol|2010": 85, "ramos|2010": 85, "pique|2010": 82,
    "sneijder|2010": 92, "robben|2010": 91, "van persie|2010": 86,
    "muller|2010": 88, "klose|2010": 84, "ozil|2010": 84,
    "messi|2010": 97, "tevez|2010": 84, "higuain|2010": 80,
    "suarez|2010": 86, "forlan|2010": 87,
    "drogba|2010": 85, "essien|2010": 82,
    "ronaldo|2010": 92, "nani|2010": 80,
    "rooney|2010": 85, "lampard|2010": 85, "gerrard|2010": 85,
    "fabiano|2010": 83, "robinho|2010": 83, "kaka|2010": 90,
    # 2014
    "messi|2014": 99, "di maria|2014": 90, "higuain|2014": 82,
    "neuer|2014": 95, "lahm|2014": 90, "muller|2014": 93, "klose|2014": 84,
    "kroos|2014": 91, "ozil|2014": 86, "schweinsteiger|2014": 84, "gotze|2014": 82,
    "neymar|2014": 93, "oscar|2014": 82, "hulk|2014": 80,
    "van persie|2014": 87, "robben|2014": 91, "sneijder|2014": 87,
    "suarez|2014": 90, "cavani|2014": 85,
    "iniesta|2014": 90, "xavi|2014": 88, "ramos|2014": 87, "fabregas|2014": 85,
    "james|2014": 88, "falcao|2014": 82,
    "hazard|2014": 87, "fellaini|2014": 79, "de bruyne|2014": 84,
    "ronaldo|2014": 92, "pepe|2014": 84,
    # 2018
    "mbappe|2018": 94, "griezmann|2018": 88, "pogba|2018": 86, "kante|2018": 88,
    "varane|2018": 88, "lloris|2018": 88,
    "modric|2018": 95, "rakitic|2018": 86, "mandzukic|2018": 83, "perisic|2018": 84,
    "messi|2018": 96, "mascherano|2018": 85,
    "de bruyne|2018": 92, "hazard|2018": 91, "lukaku|2018": 85,
    "kane|2018": 87, "dele|2018": 82, "pickford|2018": 82,
    "neymar|2018": 92, "coutinho|2018": 87, "firmino|2018": 85, "jesus|2018": 82,
    "ronaldo|2018": 93, "quaresma|2018": 79,
    "salah|2018": 89, "khedira|2018": 82, "kroos|2018": 91, "neuer|2018": 92,
    # 2022
    "messi|2022": 99, "alvarez|2022": 84, "di maria|2022": 84,
    "de paul|2022": 84, "enzo fernandez|2022": 83, "mac allister|2022": 82,
    "e martinez|2022": 88, "otamendi|2022": 84, "romero|2022": 85,
    "mbappe|2022": 98, "griezmann|2022": 86, "giroud|2022": 81,
    "tchouameni|2022": 84, "rabiot|2022": 79, "lloris|2022": 86,
    "modric|2022": 92, "brozovic|2022": 84, "perisic|2022": 84,
    "gvardiol|2022": 84,
    "hakimi|2022": 86, "bounou|2022": 84, "ziyech|2022": 82, "en nesyri|2022": 80,
    "neymar|2022": 91, "vinicius|2022": 91, "richarlison|2022": 83, "rodrygo|2022": 84,
    "van dijk|2022": 92, "de bruyne|2022": 93, "depay|2022": 85,
    "kane|2022": 88, "bellingham|2022": 86, "saka|2022": 84,
    "ronaldo|2022": 90, "felix|2022": 83, "bernardo|2022": 89,
    "pulisic|2022": 82, "neuer|2022": 90, "gnabry|2022": 83, "muller|2022": 84,
    "yoshida|2022": 79, "doan|2022": 80, "asano|2022": 78,
    "son|2022": 87,
    "dalic|2022": 75,  # técnico, não jogador — filtrar se aparecer
}

# Mapa Wikipedia-nome-de-seleção → código ISO do jogo
WIKI_TEAM_CODE: dict[str, str] = {
    "Argentina": "AR", "Brazil": "BR", "Germany": "DE", "West Germany": "DE",
    "France": "FR", "Italy": "IT", "Spain": "ES", "England": "EN",
    "Netherlands": "NL", "Portugal": "PT", "Uruguay": "UY", "Croatia": "HR",
    "Belgium": "BE", "Sweden": "SE", "Mexico": "MX", "Colombia": "CO",
    "Chile": "CL", "United States": "US", "Nigeria": "NG", "Cameroon": "CM",
    "Senegal": "SN", "Morocco": "MA", "South Africa": "ZA", "Japan": "JP",
    "South Korea": "KR", "Australia": "AU", "Switzerland": "CH", "Russia": "RU",
    "Denmark": "DK", "Czech Republic": "CZ", "Ukraine": "UA", "Turkey": "TR",
    "Ecuador": "EC", "Ghana": "GH", "Iran": "IR", "Poland": "PL",
    "Serbia": "RS", "Costa Rica": "CR", "Tunisia": "TN", "Bulgaria": "BG",
    "Romania": "RO", "Yugoslavia": "YU", "Paraguay": "PY", "Republic of Ireland": "IE",
    "Ireland": "IE", "Iceland": "IS", "Egypt": "EG", "Peru": "PE",
    "Wales": "WA", "Canada": "CA", "Qatar": "QA", "Saudi Arabia": "SA",
    "Soviet Union": "URSS", "Czechoslovakia": "CS", "East Germany": "GDR",
    "Hungary": "HU", "Scotland": "SCO", "Austria": "AT", "Algeria": "DZ",
    "El Salvador": "SV", "Haiti": "HT", "New Zealand": "NZ", "Honduras": "HN",
    "Bolivia": "BO", "Kuwait": "KW", "Cameroon": "CM", "Cuba": "CU",
    "North Korea": "KP", "Iraq": "IQ", "Canada": "CA",
    "Trinidad and Tobago": "TT", "Ivory Coast": "CI", "Togo": "TG",
    "Angola": "AO", "Serbia and Montenegro": "RS",
    "Slovakia": "SK", "Slovenia": "SI", "Honduras": "HN",
    "United Arab Emirates": "AE", "Greece": "GR", "Jamaica": "JM",
    "South Africa": "ZA", "Senegal": "SN", "Nigeria": "NG",
    "Burkina Faso": "BF", "Cape Verde": "CV",
}

# Mapa posição Wikipedia → posição do jogo
WIKI_POS_MAP: dict[str, list[str]] = {
    "GK": ["GOL"],
    "DF": ["ZAG"],
    "MF": ["MEI"],
    "FW": ["CA"],
    # variações encontradas no Wikipedia
    "G": ["GOL"], "D": ["ZAG"], "M": ["MEI"], "F": ["CA"],
}


def normalize(text: str) -> str:
    """Remove acentos e converte para lowercase para comparação."""
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower().strip()


def compute_rating(
    pos: str,
    caps: int,
    career_goals: int,
    tourn_goals: int,
    tourn_assists: int,
    minutes: int,
    name: str,
    year: int,
) -> int:
    """
    Estima um rating 65–99 baseado em métricas do jogador.

    Lógica:
     - Base por posição
     - Bônus por caps internacionais (experiência)
     - Bônus por gols na carreira (produção)
     - Bônus por performance no torneio
     - Override para lendas (RATING_OVERRIDES)
    """
    # Base por posição
    base = {"GOL": 73, "ZAG": 72, "LD": 72, "LE": 72, "MEI": 73, "CA": 75}.get(
        pos.split(",")[0].strip().upper(), 73
    )

    # Bônus de caps (máx +12)
    caps_bonus = min(caps // 15, 12) if caps else 0

    # Bônus de gols na carreira (só atac/meio, máx +8)
    is_attack = pos.upper() in ("CA", "PE", "PD", "MEI")
    goal_bonus = min(career_goals // 8, 8) if (career_goals and is_attack) else 0

    # Bônus de performance no torneio (máx +6)
    perf_bonus = min(tourn_goals * 2 + tourn_assists, 6)

    # Bônus de minutos jogados (indica titular, máx +3)
    min_bonus = 3 if minutes >= 450 else (1 if minutes >= 180 else 0)

    raw = base + caps_bonus + goal_bonus + perf_bonus + min_bonus

    # Clamp 65–92 (lendas chegam a 99 via override)
    rating = max(65, min(92, raw))

    # Override de lendas — tenta full name, depois sufixos (último sobrenome, etc.)
    # Ex: "Rodrigo De Paul" → tenta "rodrigo de paul|2022", depois "de paul|2022", depois "paul|2022"
    name_norm  = normalize(name)
    name_parts = name_norm.split()
    for length in range(len(name_parts), 0, -1):
        suffix = " ".join(name_parts[-length:])
        key = f"{suffix}|{year}"
        if key in RATING_OVERRIDES:
            rating = RATING_OVERRIDES[key]
            break

    return rating


# ---------------------------------------------------------------------------
# Scraper Wikipedia
# ---------------------------------------------------------------------------
WIKI_URL = "https://en.wikipedia.org/wiki/{year}_FIFA_World_Cup_squads"


def fetch_wikipedia_squads(year: int) -> list[dict]:
    """
    Scrapa a página Wikipedia '{year} FIFA World Cup squads'.
    Usa lxml.html para percorrer o DOM e associar h3 (nome do país) → table (elenco).
    Retorna lista de dicts: {country_code, country_name, flag_emoji, phase_reached, players[]}
    """
    try:
        import pandas as pd
        import requests
        from lxml import html as lxml_html
        from io import StringIO
    except ImportError as e:
        log.error("Dependência faltando: %s — instale com pip install pandas requests lxml", e)
        return []

    url = WIKI_URL.format(year=year)
    log.info("[%d] Wikipedia: %s", year, url)

    try:
        resp = requests.get(url, timeout=30, headers={"User-Agent": "FutCopa-DataBot/1.0 (futcopa.vercel.app)"})
        resp.raise_for_status()
    except Exception as e:
        log.warning("[%d] Erro ao buscar Wikipedia: %s", year, e)
        return []

    html_text = resp.text
    phases = PHASES.get(year, {})
    squads: dict[str, dict] = {}

    # --- Parsear DOM com lxml para associar heading → tabela ---
    try:
        tree = lxml_html.fromstring(html_text.encode("utf-8"))
    except Exception as e:
        log.warning("[%d] lxml.fromstring falhou: %s", year, e)
        return []

    # Estrutura Wikipedia (2018+): <div class="mw-heading mw-heading3"> + <table>
    # Estrutura Wikipedia (antes de 2018): <h3><span class="mw-headline"> + <table>
    from lxml import etree

    content = tree.find('.//*[@id="mw-content-text"]')
    if content is None:
        content = tree

    # Classe real: "mw-content-ltr mw-parser-output"
    parser_output = None
    for div in content.findall(".//div"):
        if "mw-parser-output" in div.get("class", ""):
            parser_output = div
            break
    if parser_output is None:
        parser_output = content

    current_team_name: str | None = None
    team_table_pairs: list[tuple[str, str]] = []  # (team_name, html_table_string)

    for elem in parser_output:
        tag = elem.tag if isinstance(elem.tag, str) else ""
        cls = elem.get("class", "")

        heading_text = ""

        # Caso 1: <div class="mw-heading mw-heading3"> (Wikipedia moderno 2016+)
        if tag == "div" and "mw-heading3" in cls:
            heading_text = re.sub(r"\s*\[edit\].*$", "", elem.text_content() or "").strip()

        # Caso 2: <h3> com span.mw-headline (Wikipedia legado)
        elif tag == "h3":
            span = elem.find('.//span[@class="mw-headline"]')
            if span is not None:
                heading_text = (span.text_content() or "").strip()

        if heading_text:
            if heading_text in WIKI_TEAM_CODE or any(
                normalize(heading_text) == normalize(k) for k in WIKI_TEAM_CODE
            ):
                current_team_name = heading_text
                log.debug("[%d] Seleção: %s", year, heading_text)

        elif tag == "table" and current_team_name is not None:
            try:
                tbl_html = etree.tostring(elem, encoding="unicode", method="html")
                team_table_pairs.append((current_team_name, tbl_html))
            except Exception:
                pass
            current_team_name = None

    log.info("[%d] %d pares (seleção, tabela) encontrados", year, len(team_table_pairs))

    for team_name, tbl_html in team_table_pairs:
        code = WIKI_TEAM_CODE.get(team_name) or _guess_code(team_name)
        if not code:
            log.debug("[%d] Código não encontrado para: %s", year, team_name)
            continue

        country_name = COUNTRY_NAMES.get(code, team_name)
        flag = FLAG_EMOJIS.get(code, "🏳")
        phase = phases.get(code, "FASE_GRUPOS")

        try:
            dfs = pd.read_html(StringIO(tbl_html))
            if not dfs:
                continue
            df = dfs[0]
        except Exception as e:
            log.debug("[%d] Erro ao parsear tabela de %s: %s", year, team_name, e)
            continue

        players = _parse_squad_table(df, year)
        if not players:
            continue

        if code not in squads:
            squads[code] = {
                "country_code": code,
                "country_name": country_name,
                "flag_emoji": flag,
                "phase_reached": phase,
                "players": [],
            }

        squads[code]["players"].extend(players)

    # Remover duplicatas de jogadores por nome
    for sq in squads.values():
        seen_names: set[str] = set()
        unique_players = []
        for p in sq["players"]:
            key = normalize(p["name"])
            if key not in seen_names:
                seen_names.add(key)
                unique_players.append(p)
        sq["players"] = unique_players

    # Calcular avg_rating do squad
    for sq in squads.values():
        if sq["players"]:
            ratings = [p["rating_computed"] for p in sq["players"]]
            sq["avg_rating"] = round(sum(ratings) / len(ratings))
        else:
            sq["avg_rating"] = 75

    return list(squads.values())


def _guess_code(name: str) -> str | None:
    """Tenta adivinhar o código do país pelo nome (case-insensitive)."""
    norm = normalize(name)
    for wiki_name, code in WIKI_TEAM_CODE.items():
        if normalize(wiki_name) == norm:
            return code
    return None


def _parse_squad_table(df: Any, year: int) -> list[dict]:
    """Parseia uma tabela pandas de squad do Wikipedia."""
    players = []
    col_map = {}

    for orig_col in df.columns:
        low = str(orig_col).lower()
        if "pos" in low and "pos" not in col_map:
            col_map["pos"] = orig_col
        elif "player" in low or "name" in low:
            col_map["name"] = orig_col
        elif "cap" in low:
            col_map["caps"] = orig_col
        elif "goal" in low and "club" not in low:
            col_map["goals"] = orig_col
        elif "dob" in low or "birth" in low or "date" in low:
            col_map["dob"] = orig_col
        elif "club" in low or "team" in low:
            col_map["club"] = orig_col
        elif "#" == str(orig_col).strip() or "no" == str(orig_col).strip().lower():
            col_map["number"] = orig_col

    if "pos" not in col_map or "name" not in col_map:
        return []

    for idx, row in df.iterrows():
        name_raw = str(row.get(col_map["name"], "")).strip()
        if not name_raw or name_raw in ("nan", "Player", "Name"):
            continue

        # Limpar nome: remove "[1]", "(captain)", "(c)", asteriscos etc.
        name = re.sub(r"\[.*?\]", "", name_raw)         # [1], [a]
        name = re.sub(r"\s*\(captain\)\s*", " ", name, flags=re.IGNORECASE)
        name = re.sub(r"\s*\(c\)\s*", " ", name, flags=re.IGNORECASE)
        name = re.sub(r"\s*\*+\s*", " ", name)           # asterisco de capitão
        name = name.strip()
        if not name:
            continue

        pos_raw = str(row.get(col_map["pos"], "MF")).strip().upper()
        positions = WIKI_POS_MAP.get(pos_raw, ["MEI"])

        try:
            caps = int(float(str(row.get(col_map.get("caps", ""), 0) or 0)))
        except (ValueError, TypeError):
            caps = 0

        try:
            career_goals = int(float(str(row.get(col_map.get("goals", ""), 0) or 0)))
        except (ValueError, TypeError):
            career_goals = 0

        try:
            number = int(float(str(row.get(col_map.get("number", ""), 0) or 0)))
        except (ValueError, TypeError):
            number = None

        rating = compute_rating(
            pos=positions[0] if positions else "MEI",
            caps=caps,
            career_goals=career_goals,
            tourn_goals=0,  # enriquecido pelo FBRef depois
            tourn_assists=0,
            minutes=0,
            name=name,
            year=year,
        )

        players.append({
            "squad_number": number,
            "name": name,
            "positions": positions,
            "rating_computed": rating,
            "caps": caps,
            "career_goals": career_goals,
            "goals": 0,
            "assists": 0,
            "minutes_played": None,
        })

    return players


# ---------------------------------------------------------------------------
# Enriquecimento FBRef (stats do torneio para Copas 2006-2022)
# ---------------------------------------------------------------------------
FBREF_SQUAD_URLS: dict[int, str] = {
    2006: "https://fbref.com/en/comps/1/2006/stats/2006-FIFA-World-Cup-Stats",
    2010: "https://fbref.com/en/comps/1/2010/stats/2010-FIFA-World-Cup-Stats",
    2014: "https://fbref.com/en/comps/1/2014/stats/2014-FIFA-World-Cup-Stats",
    2018: "https://fbref.com/en/comps/1/2018/stats/2018-FIFA-World-Cup-Stats",
    2022: "https://fbref.com/en/comps/1/2022/stats/2022-FIFA-World-Cup-Stats",
}


def enrich_with_fbref(squads: list[dict], year: int) -> list[dict]:
    """
    Enriquece os squads com stats do torneio via FBRef.
    Atualiza goals, assists, minutes_played e rating_computed.
    """
    if year not in FBREF_SQUAD_URLS:
        return squads

    try:
        import pandas as pd
    except ImportError:
        log.warning("pandas não disponível — pulando FBRef %d", year)
        return squads

    url = FBREF_SQUAD_URLS[year]
    log.info("[%d] FBRef stats: %s", year, url)
    time.sleep(5)  # rate limit FBRef

    try:
        tables = pd.read_html(url, header=1)
    except Exception as e:
        log.warning("[%d] FBRef falhou: %s", year, e)
        return squads

    df = None
    for t in tables:
        cols = [str(c) for c in t.columns]
        if "Player" in cols and "Squad" in cols:
            df = t
            break

    if df is None:
        return squads

    df = df[df["Player"] != "Player"].copy()
    df = df.dropna(subset=["Player"])

    # Construir lookup nome → stats
    stats_lookup: dict[str, dict] = {}
    for _, row in df.iterrows():
        name = re.sub(r"\[.*?\]", "", str(row.get("Player", ""))).strip()
        if not name or name == "nan":
            continue
        try:
            g   = int(float(str(row.get("Gls", 0) or 0)))
            a   = int(float(str(row.get("Ast", 0) or 0)))
            min_= int(float(str(row.get("Min", 0) or 0)))
        except (ValueError, TypeError):
            g = a = min_ = 0
        stats_lookup[normalize(name)] = {"goals": g, "assists": a, "minutes": min_}

    for sq in squads:
        for p in sq["players"]:
            key = normalize(p["name"])
            if key in stats_lookup:
                st = stats_lookup[key]
                p["goals"]        = st["goals"]
                p["assists"]      = st["assists"]
                p["minutes_played"] = st["minutes"] if st["minutes"] > 0 else p["minutes_played"]
                # Re-calcular rating com stats do torneio
                p["rating_computed"] = compute_rating(
                    pos=p["positions"][0] if p["positions"] else "MEI",
                    caps=p.get("caps", 0),
                    career_goals=p.get("career_goals", 0),
                    tourn_goals=st["goals"],
                    tourn_assists=st["assists"],
                    minutes=st["minutes"],
                    name=p["name"],
                    year=year,
                )

    return squads


# ---------------------------------------------------------------------------
# Gerador SQL
# ---------------------------------------------------------------------------

def squads_to_sql(all_editions: list[dict]) -> str:
    """Gera um arquivo SQL INSERT … ON CONFLICT DO NOTHING a partir do JSON."""
    lines = [
        "-- Auto-gerado por fetch_all_wc_squads.py",
        "-- Execute no Supabase: npx supabase db query --linked --file <arquivo>",
        "",
    ]

    for edition in all_editions:
        year = edition["year"]
        ed_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"edition-{year}"))

        lines.append(f"-- ===== Copa {year} =====")
        lines.append("INSERT INTO public.cup_editions (id, year, host_country, champion, created_at) VALUES")
        lines.append(
            f"  ('{ed_id}', {year}, "
            f"'{_sql_escape(edition['host_country'])}', "
            f"'{_sql_escape(edition['champion'])}', NOW())"
        )
        lines.append("ON CONFLICT (year) DO NOTHING;\n")

        for sq in edition.get("squads", []):
            sq_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"squad-{year}-{sq['country_code']}"))
            cc = sq["country_code"]
            lines.append(f"-- {sq['country_name']} {year}")
            lines.append(
                "INSERT INTO public.cup_squads "
                "(id, edition_id, country_code, country_name, flag_emoji, phase_reached, avg_rating, created_at) VALUES"
            )
            # Use subquery to get actual edition_id by year (handles pre-existing editions with different UUIDs)
            lines.append(
                f"  ('{sq_id}', (SELECT id FROM public.cup_editions WHERE year = {year}), '{cc}', "
                f"'{_sql_escape(sq['country_name'])}', "
                f"'{sq['flag_emoji']}', '{sq['phase_reached']}', "
                f"{sq.get('avg_rating', 75)}, NOW())"
            )
            lines.append("ON CONFLICT (edition_id, country_code) DO NOTHING;\n")

            if sq.get("players"):
                # Reference actual squad via (edition, country_code) to handle pre-existing squads with different UUIDs
                squad_ref = (
                    f"(SELECT id FROM public.cup_squads WHERE "
                    f"edition_id = (SELECT id FROM public.cup_editions WHERE year = {year}) "
                    f"AND country_code = '{cc}')"
                )
                lines.append(
                    "INSERT INTO public.cup_players "
                    "(id, squad_id, squad_number, name, positions, rating_computed, "
                    "rating_override, override_reason, photo_url, goals, assists, minutes_played, created_at) VALUES"
                )
                player_rows = []
                for i, p in enumerate(sq["players"]):
                    p_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"player-{year}-{cc}-{i}"))
                    pos_literal = "{" + ",".join(p["positions"]) + "}"
                    num = p.get("squad_number") if p.get("squad_number") else "NULL"
                    mins = p.get("minutes_played") if p.get("minutes_played") else "NULL"
                    player_rows.append(
                        f"  ('{p_id}', {squad_ref}, {num}, "
                        f"'{_sql_escape(p['name'])}', '{pos_literal}', "
                        f"{p['rating_computed']}, NULL, NULL, NULL, "
                        f"{p.get('goals', 0)}, {p.get('assists', 0)}, {mins}, NOW())"
                    )
                lines.append(",\n".join(player_rows))
                lines.append("ON CONFLICT (id) DO NOTHING;\n")

    return "\n".join(lines)


def _sql_escape(s: str) -> str:
    return s.replace("'", "''") if s else ""


# ---------------------------------------------------------------------------
# Pipeline principal
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Coleta elencos Copa do Mundo — máxima cobertura")
    parser.add_argument("--years", nargs="*", type=int,
                        help="Filtrar anos. Ex: --years 2018 2022. Default: todos 1970-2022")
    parser.add_argument("--no-fbref", action="store_true",
                        help="Pular enriquecimento FBRef (mais rápido, menos stats)")
    parser.add_argument("--gen-sql", action="store_true",
                        help="Gerar SQL em data/all_wc_squads.sql em vez de JSON")
    parser.add_argument("--delay", type=float, default=3.0,
                        help="Delay entre requisições em segundos (default: 3)")
    args = parser.parse_args()

    os.makedirs(DATA_DIR, exist_ok=True)

    target = [e for e in EDITIONS if args.years is None or e["year"] in args.years]
    result = []

    for edition in target:
        year = edition["year"]
        squads = fetch_wikipedia_squads(year)

        if not squads:
            log.warning("[%d] Nenhum squad coletado do Wikipedia", year)
        else:
            # Enriquecer com FBRef se disponível
            if not args.no_fbref and year in FBREF_SQUAD_URLS:
                squads = enrich_with_fbref(squads, year)

        if squads:
            result.append({**edition, "squads": squads})
            total_p = sum(len(s["players"]) for s in squads)
            log.info("[%d] %d seleções · %d jogadores coletados", year, len(squads), total_p)

        time.sleep(args.delay)

    total_sq = sum(len(e["squads"]) for e in result)
    total_pl = sum(len(s["players"]) for e in result for s in e["squads"])
    log.info("TOTAL: %d edições · %d seleções · %d jogadores", len(result), total_sq, total_pl)

    if args.gen_sql:
        sql_path = os.path.join(DATA_DIR, "all_wc_squads.sql")
        with open(sql_path, "w", encoding="utf-8") as f:
            f.write(squads_to_sql(result))
        log.info("SQL gerado em: %s", sql_path)
    else:
        with open(OUT_FILE, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        log.info("JSON gerado em: %s", OUT_FILE)

    print("\n=== PRÓXIMOS PASSOS ===")
    print("1. Revise: data/all_wc_squads.json (ou .sql)")
    print("2. Execute: python scripts/build_ratings.py (adiciona overrides manuais)")
    print("3. Execute: python scripts/seed_copa_supabase.py (push para Supabase)")
    print("   Ou: npx supabase db query --linked --file data/all_wc_squads.sql")


if __name__ == "__main__":
    main()
