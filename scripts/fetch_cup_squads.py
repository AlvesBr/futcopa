"""
Coleta elencos históricos das Copas do Mundo 1966–2022.

Fontes:
  - FBRef (pandas.read_html) para Copas 2006–2022: stats completas
  - openfootball (GitHub raw JSON) para estrutura de torneios
  - Dados embutidos (fallback) para Copas 1966–2002

Gera: data/cup_squads.json com estrutura normalizada para o Copa dos Sonhos.

Uso:
    python scripts/fetch_cup_squads.py
    python scripts/fetch_cup_squads.py --years 2018 2022
    python scripts/fetch_cup_squads.py --fbref-only
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import time
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATA_DIR  = os.path.join(os.path.dirname(__file__), "..", "data")
OUT_FILE  = os.path.join(DATA_DIR, "cup_squads.json")

# ---------------------------------------------------------------------------
# Estrutura de edições: metadados fixos
# ---------------------------------------------------------------------------
EDITIONS: list[dict[str, Any]] = [
    {"year": 1966, "host_country": "Inglaterra",   "champion": "Inglaterra"},
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

# Mapa de fase alcançada por seleção (usado para bônus de rating e pool de adversários)
# Copas modernas são populadas pelo scraper; antigas usam este fallback
PHASE_FALLBACK: dict[int, dict[str, str]] = {
    1970: {
        "BR": "CAMPEÃO", "IT": "VICE", "DE": "SEMI", "UY": "SEMI",
        "MX": "QUARTAS", "SV": "QUARTAS", "URS": "QUARTAS", "PE": "QUARTAS",
        "BE": "FASE_GRUPOS", "BG": "FASE_GRUPOS", "CS": "FASE_GRUPOS",
        "IL": "FASE_GRUPOS", "MA": "FASE_GRUPOS", "RO": "FASE_GRUPOS",
    },
    1986: {
        "AR": "CAMPEÃO", "DE": "VICE", "FR": "SEMI", "BE": "SEMI",
        "ES": "QUARTAS", "MX": "QUARTAS", "BR": "QUARTAS", "EN": "QUARTAS",
    },
    1998: {
        "FR": "CAMPEÃO", "BR": "VICE", "HR": "SEMI", "NL": "SEMI",
        "AR": "QUARTAS", "IT": "QUARTAS", "DE": "QUARTAS", "DK": "QUARTAS",
    },
}

FLAG_EMOJIS: dict[str, str] = {
    "AR": "🇦🇷", "BR": "🇧🇷", "DE": "🇩🇪", "FR": "🇫🇷", "IT": "🇮🇹",
    "ES": "🇪🇸", "EN": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "NL": "🇳🇱", "PT": "🇵🇹", "UY": "🇺🇾",
    "HR": "🇭🇷", "BE": "🇧🇪", "SE": "🇸🇪", "MX": "🇲🇽", "CO": "🇨🇴",
    "CL": "🇨🇱", "US": "🇺🇸", "NG": "🇳🇬", "CM": "🇨🇲", "SN": "🇸🇳",
    "MA": "🇲🇦", "ZA": "🇿🇦", "JP": "🇯🇵", "KR": "🇰🇷", "AU": "🇦🇺",
    "CH": "🇨🇭", "RU": "🇷🇺", "DK": "🇩🇰", "CZ": "🇨🇿", "UA": "🇺🇦",
    "TR": "🇹🇷", "MX": "🇲🇽", "EC": "🇪🇨", "GH": "🇬🇭", "IR": "🇮🇷",
    "PL": "🇵🇱", "RS": "🇷🇸", "CR": "🇨🇷", "AL": "🇦🇱", "TN": "🇹🇳",
    "URS": "🇷🇺",  # União Soviética → Russia flag fallback
    "CS": "🇷🇸",   # Tchecoslováquia → Serbia flag fallback
    "DE": "🇩🇪",   # DDR / RFA unificados como Alemanha
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
    "RS": "Sérvia", "CR": "Costa Rica",
    "URS": "União Soviética", "CS": "Tchecoslováquia",
}

# ---------------------------------------------------------------------------
# Posições FBRef → siglas do jogo
# ---------------------------------------------------------------------------
FBREF_POS_MAP: dict[str, list[str]] = {
    "GK": ["GOL"],
    "DF": ["ZAG"],
    "DF,MF": ["ZAG", "MEI"],
    "MF,DF": ["MEI", "ZAG"],
    "MF": ["MEI"],
    "MF,FW": ["MEI", "CA"],
    "FW,MF": ["CA", "MEI"],
    "FW": ["CA"],
}


def map_position(fbref_pos: str) -> list[str]:
    """Converte posição do FBRef para lista de posições do jogo."""
    return FBREF_POS_MAP.get(fbref_pos.strip().upper(), ["MEI"])


# ---------------------------------------------------------------------------
# Scraper FBRef (2006–2022)
# ---------------------------------------------------------------------------
FBREF_SQUAD_URLS: dict[int, str] = {
    2006: "https://fbref.com/en/comps/1/2006/stats/2006-FIFA-World-Cup-Stats",
    2010: "https://fbref.com/en/comps/1/2010/stats/2010-FIFA-World-Cup-Stats",
    2014: "https://fbref.com/en/comps/1/2014/stats/2014-FIFA-World-Cup-Stats",
    2018: "https://fbref.com/en/comps/1/2018/stats/2018-FIFA-World-Cup-Stats",
    2022: "https://fbref.com/en/comps/1/2022/stats/2022-FIFA-World-Cup-Stats",
}


def fetch_fbref_squads(year: int) -> list[dict]:
    """
    Faz scraping do FBRef para obter elencos e stats de uma Copa.
    Retorna lista de squads com players.
    Depende de: pandas, requests, lxml ou html5lib.
    """
    try:
        import pandas as pd
    except ImportError:
        log.warning("pandas não instalado — pulando FBRef para %d", year)
        return []

    url = FBREF_SQUAD_URLS.get(year)
    if not url:
        return []

    log.info("Buscando FBRef %d: %s", year, url)
    time.sleep(4)  # respeitar rate limit do FBRef

    try:
        tables = pd.read_html(url, header=1)
    except Exception as e:
        log.warning("Erro ao ler FBRef %d: %s", year, e)
        return []

    # FBRef retorna múltiplas tabelas; a primeira tabela de stats gerais é a que queremos
    df = None
    for t in tables:
        if "Player" in t.columns and "Squad" in t.columns:
            df = t
            break

    if df is None:
        log.warning("Tabela de jogadores não encontrada no FBRef %d", year)
        return []

    # Limpar cabeçalhos duplicados do pandas multi-index
    df = df[df["Player"] != "Player"].copy()
    df = df.dropna(subset=["Player", "Squad"])

    squads: dict[str, dict] = {}

    for _, row in df.iterrows():
        squad_name = str(row.get("Squad", "")).strip()
        if not squad_name or squad_name == "nan":
            continue

        if squad_name not in squads:
            squads[squad_name] = {"country_name": squad_name, "players": []}

        try:
            goals   = int(float(str(row.get("Gls", 0) or 0)))
            assists = int(float(str(row.get("Ast", 0) or 0)))
            minutes = int(float(str(row.get("Min", 0) or 0)))
        except (ValueError, TypeError):
            goals = assists = minutes = 0

        pos_raw = str(row.get("Pos", "MF")).strip()
        positions = map_position(pos_raw)

        player: dict[str, Any] = {
            "squad_number": None,
            "name": str(row.get("Player", "")).strip(),
            "positions": positions,
            "goals": goals,
            "assists": assists,
            "minutes_played": minutes if minutes > 0 else None,
        }
        squads[squad_name]["players"].append(player)

    return list(squads.values())


# ---------------------------------------------------------------------------
# Dados embutidos para Copas 1966–2002 (sample — expandir manualmente)
# ---------------------------------------------------------------------------
EMBEDDED_DATA: dict[int, list[dict]] = {
    1970: [
        {
            "country_code": "BR",
            "country_name": "Brasil",
            "phase_reached": "CAMPEÃO",
            "players": [
                {"squad_number": 1,  "name": "Félix",     "positions": ["GOL"],       "goals": 0, "assists": 0, "minutes_played": 630},
                {"squad_number": 2,  "name": "C. Alberto", "positions": ["LD"],         "goals": 1, "assists": 2, "minutes_played": 630},
                {"squad_number": 3,  "name": "Everaldo",  "positions": ["LE"],         "goals": 0, "assists": 0, "minutes_played": 540},
                {"squad_number": 4,  "name": "Piazza",    "positions": ["ZAG", "MEI"], "goals": 0, "assists": 0, "minutes_played": 450},
                {"squad_number": 5,  "name": "Brito",     "positions": ["ZAG"],        "goals": 0, "assists": 0, "minutes_played": 630},
                {"squad_number": 6,  "name": "Clodoaldo", "positions": ["MEI"],        "goals": 1, "assists": 1, "minutes_played": 540},
                {"squad_number": 7,  "name": "Jairzinho", "positions": ["PD", "CA"],   "goals": 7, "assists": 3, "minutes_played": 630},
                {"squad_number": 8,  "name": "Gérson",    "positions": ["MEI"],        "goals": 1, "assists": 4, "minutes_played": 540},
                {"squad_number": 9,  "name": "Tostão",    "positions": ["CA"],         "goals": 4, "assists": 5, "minutes_played": 540},
                {"squad_number": 10, "name": "Pelé",      "positions": ["CA"],         "goals": 4, "assists": 7, "minutes_played": 540},
                {"squad_number": 11, "name": "Rivelino",  "positions": ["PE", "MEI"],  "goals": 3, "assists": 2, "minutes_played": 630},
            ],
        },
        {
            "country_code": "IT",
            "country_name": "Itália",
            "phase_reached": "VICE",
            "players": [
                {"squad_number": 1,  "name": "Albertosi", "positions": ["GOL"],       "goals": 0, "assists": 0, "minutes_played": 540},
                {"squad_number": 5,  "name": "Facchetti",  "positions": ["LE"],        "goals": 0, "assists": 1, "minutes_played": 540},
                {"squad_number": 6,  "name": "Bertini",    "positions": ["MEI"],       "goals": 0, "assists": 0, "minutes_played": 360},
                {"squad_number": 7,  "name": "Domenghini", "positions": ["PD"],        "goals": 1, "assists": 1, "minutes_played": 360},
                {"squad_number": 9,  "name": "Boninsegna", "positions": ["CA"],        "goals": 2, "assists": 1, "minutes_played": 450},
                {"squad_number": 10, "name": "Mazzola",    "positions": ["MEI", "CA"], "goals": 2, "assists": 3, "minutes_played": 450},
                {"squad_number": 11, "name": "Riva",       "positions": ["PE", "CA"],  "goals": 4, "assists": 2, "minutes_played": 540},
                {"squad_number": 2,  "name": "Burgnich",   "positions": ["LD", "ZAG"], "goals": 1, "assists": 0, "minutes_played": 540},
                {"squad_number": 3,  "name": "Cera",       "positions": ["ZAG"],       "goals": 0, "assists": 0, "minutes_played": 540},
                {"squad_number": 4,  "name": "Rosato",     "positions": ["ZAG"],       "goals": 0, "assists": 0, "minutes_played": 360},
                {"squad_number": 8,  "name": "De Sisti",   "positions": ["MEI"],       "goals": 0, "assists": 1, "minutes_played": 360},
            ],
        },
        {
            "country_code": "DE",
            "country_name": "Alemanha",
            "phase_reached": "SEMI",
            "players": [
                {"squad_number": 1,  "name": "Maier",       "positions": ["GOL"],       "goals": 0, "assists": 0, "minutes_played": 630},
                {"squad_number": 5,  "name": "Beckenbauer", "positions": ["ZAG", "MEI"],"goals": 2, "assists": 3, "minutes_played": 630},
                {"squad_number": 9,  "name": "Müller",      "positions": ["CA"],        "goals": 10,"assists": 2, "minutes_played": 630},
                {"squad_number": 13, "name": "Seeler",      "positions": ["CA"],        "goals": 3, "assists": 2, "minutes_played": 540},
                {"squad_number": 7,  "name": "Held",        "positions": ["PD", "CA"],  "goals": 2, "assists": 1, "minutes_played": 450},
                {"squad_number": 3,  "name": "Schnellinger","positions": ["LE"],        "goals": 1, "assists": 0, "minutes_played": 540},
                {"squad_number": 4,  "name": "Vogts",       "positions": ["LD"],        "goals": 0, "assists": 0, "minutes_played": 450},
                {"squad_number": 2,  "name": "Schulz",      "positions": ["ZAG"],       "goals": 0, "assists": 0, "minutes_played": 540},
                {"squad_number": 8,  "name": "Overath",     "positions": ["MEI"],       "goals": 2, "assists": 2, "minutes_played": 540},
                {"squad_number": 10, "name": "Grabowski",   "positions": ["PE", "PD"],  "goals": 0, "assists": 2, "minutes_played": 360},
                {"squad_number": 11, "name": "Libuda",      "positions": ["PD"],        "goals": 0, "assists": 1, "minutes_played": 270},
            ],
        },
    ],
    1986: [
        {
            "country_code": "AR",
            "country_name": "Argentina",
            "phase_reached": "CAMPEÃO",
            "players": [
                {"squad_number": 1,  "name": "Pumpido",   "positions": ["GOL"],       "goals": 0, "assists": 0, "minutes_played": 630},
                {"squad_number": 2,  "name": "Cuciuffo",  "positions": ["LD"],        "goals": 0, "assists": 0, "minutes_played": 450},
                {"squad_number": 3,  "name": "Olarticoechea","positions": ["LE"],     "goals": 0, "assists": 1, "minutes_played": 630},
                {"squad_number": 4,  "name": "Ruggeri",   "positions": ["ZAG"],       "goals": 1, "assists": 0, "minutes_played": 630},
                {"squad_number": 5,  "name": "Brown",     "positions": ["ZAG"],       "goals": 1, "assists": 0, "minutes_played": 630},
                {"squad_number": 6,  "name": "Burruchaga", "positions": ["MEI"],      "goals": 1, "assists": 3, "minutes_played": 540},
                {"squad_number": 7,  "name": "Valdano",   "positions": ["CA", "PE"],  "goals": 3, "assists": 3, "minutes_played": 630},
                {"squad_number": 8,  "name": "Giusti",    "positions": ["MEI"],       "goals": 0, "assists": 1, "minutes_played": 540},
                {"squad_number": 9,  "name": "Batista",   "positions": ["MEI"],       "goals": 0, "assists": 0, "minutes_played": 360},
                {"squad_number": 10, "name": "Maradona",  "positions": ["MEI", "CA"], "goals": 5, "assists": 5, "minutes_played": 630},
                {"squad_number": 11, "name": "Enrique",   "positions": ["PE"],        "goals": 0, "assists": 1, "minutes_played": 270},
            ],
        },
    ],
    1998: [
        {
            "country_code": "FR",
            "country_name": "França",
            "phase_reached": "CAMPEÃO",
            "players": [
                {"squad_number": 1,  "name": "Barthez",    "positions": ["GOL"],       "goals": 0, "assists": 0, "minutes_played": 690},
                {"squad_number": 2,  "name": "Thuram",     "positions": ["LD", "ZAG"], "goals": 2, "assists": 0, "minutes_played": 690},
                {"squad_number": 3,  "name": "Lizarazu",   "positions": ["LE"],        "goals": 0, "assists": 1, "minutes_played": 600},
                {"squad_number": 4,  "name": "Desailly",   "positions": ["ZAG", "MEI"],"goals": 0, "assists": 0, "minutes_played": 540},
                {"squad_number": 5,  "name": "Blanc",      "positions": ["ZAG"],       "goals": 1, "assists": 0, "minutes_played": 600},
                {"squad_number": 6,  "name": "Deschamps",  "positions": ["MEI"],       "goals": 0, "assists": 0, "minutes_played": 690},
                {"squad_number": 7,  "name": "Petit",      "positions": ["MEI"],       "goals": 1, "assists": 1, "minutes_played": 600},
                {"squad_number": 8,  "name": "Djorkaeff",  "positions": ["MEI", "PD"], "goals": 1, "assists": 2, "minutes_played": 450},
                {"squad_number": 10, "name": "Zidane",     "positions": ["MEI"],       "goals": 2, "assists": 5, "minutes_played": 630},
                {"squad_number": 20, "name": "Trezeguet",  "positions": ["CA"],        "goals": 1, "assists": 1, "minutes_played": 360},
                {"squad_number": 12, "name": "Henry",      "positions": ["PE", "CA"],  "goals": 3, "assists": 2, "minutes_played": 540},
            ],
        },
        {
            "country_code": "BR",
            "country_name": "Brasil",
            "phase_reached": "VICE",
            "players": [
                {"squad_number": 1,  "name": "Taffarel",   "positions": ["GOL"],       "goals": 0, "assists": 0, "minutes_played": 690},
                {"squad_number": 2,  "name": "Cafu",       "positions": ["LD"],        "goals": 0, "assists": 2, "minutes_played": 690},
                {"squad_number": 3,  "name": "R. Carlos",  "positions": ["LE"],        "goals": 0, "assists": 2, "minutes_played": 690},
                {"squad_number": 4,  "name": "Aldair",     "positions": ["ZAG"],       "goals": 0, "assists": 0, "minutes_played": 600},
                {"squad_number": 5,  "name": "César Sampaio","positions": ["ZAG","MEI"],"goals": 2,"assists": 0, "minutes_played": 450},
                {"squad_number": 6,  "name": "Júnior Baiano","positions": ["ZAG"],     "goals": 0, "assists": 0, "minutes_played": 540},
                {"squad_number": 8,  "name": "Dunga",      "positions": ["MEI"],       "goals": 0, "assists": 0, "minutes_played": 690},
                {"squad_number": 20, "name": "Rivaldo",    "positions": ["MEI", "PE"], "goals": 3, "assists": 3, "minutes_played": 630},
                {"squad_number": 10, "name": "Ronaldo",    "positions": ["CA"],        "goals": 4, "assists": 3, "minutes_played": 630},
                {"squad_number": 9,  "name": "Bebeto",     "positions": ["CA"],        "goals": 3, "assists": 2, "minutes_played": 540},
                {"squad_number": 7,  "name": "Émerson",    "positions": ["MEI"],       "goals": 0, "assists": 0, "minutes_played": 360},
            ],
        },
    ],
}


# ---------------------------------------------------------------------------
# Processamento principal
# ---------------------------------------------------------------------------

def build_squads_for_edition(edition: dict, use_fbref: bool = True) -> dict:
    """Monta o dict de uma edição com todos os squads."""
    year = edition["year"]
    log.info("Processando Copa %d…", year)

    squads = []

    # Tentar FBRef para Copas modernas
    if use_fbref and year in FBREF_SQUAD_URLS:
        fbref_squads = fetch_fbref_squads(year)
        if fbref_squads:
            # FBRef não retorna country_code; usar dados de fase do fallback quando disponível
            phases = PHASE_FALLBACK.get(year, {})
            for sq in fbref_squads:
                cname = sq["country_name"]
                # Tentar mapear nome → code (simplificado; ampliar se necessário)
                code = next((k for k, v in COUNTRY_NAMES.items() if v == cname), cname[:2].upper())
                squads.append({
                    "country_code": code,
                    "country_name": cname,
                    "flag_emoji": FLAG_EMOJIS.get(code, "🏳"),
                    "phase_reached": phases.get(code, "FASE_GRUPOS"),
                    "players": sq["players"],
                })
            return {**edition, "squads": squads}

    # Fallback: dados embutidos
    embedded = EMBEDDED_DATA.get(year, [])
    for sq in embedded:
        code = sq.get("country_code", "??")
        squads.append({
            "country_code": code,
            "country_name": sq.get("country_name", COUNTRY_NAMES.get(code, code)),
            "flag_emoji": FLAG_EMOJIS.get(code, "🏳"),
            "phase_reached": sq.get("phase_reached", "FASE_GRUPOS"),
            "players": sq["players"],
        })

    if not squads:
        log.warning("Copa %d: nenhum dado disponível — edição omitida.", year)
        return None  # type: ignore

    return {**edition, "squads": squads}


def main(years: list[int] | None = None, fbref_only: bool = False) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)

    target_editions = [e for e in EDITIONS if years is None or e["year"] in years]
    result = []

    for edition in target_editions:
        data = build_squads_for_edition(edition, use_fbref=not fbref_only)
        if data:
            result.append(data)

    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    total_squads  = sum(len(e.get("squads", [])) for e in result)
    total_players = sum(len(sq["players"]) for e in result for sq in e.get("squads", []))
    log.info(
        "Gerado %s — %d edições | %d seleções | %d jogadores",
        OUT_FILE, len(result), total_squads, total_players,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Coleta elencos Copa do Mundo")
    parser.add_argument("--years", nargs="*", type=int, help="Ex: --years 2018 2022")
    parser.add_argument("--fbref-only", action="store_true", help="Só usar FBRef (sem embedded)")
    args = parser.parse_args()
    main(years=args.years, fbref_only=args.fbref_only)
