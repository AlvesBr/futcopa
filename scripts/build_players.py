"""
Consolidate all unique players from the 30 puzzle definitions and write data/players.json.
Player IDs come from build_puzzles.py PUZZLE_DATA; deduplication is by player_id.

Usage:
    python scripts/build_players.py
    # (run AFTER build_puzzles.py has written data/puzzles.json, or standalone
    #  using the same PUZZLE_DATA source imported below)
"""

from __future__ import annotations

import json
import logging
import os
import sys

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

PUZZLES_JSON = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles.json")
PLAYERS_JSON = os.path.join(os.path.dirname(__file__), "..", "data", "players.json")

# country_code lookup by country name (used when generating players.json)
COUNTRY_CODES: dict[str, str] = {
    "Alemanha": "DE",
    "Argentina": "AR",
    "Bélgica": "BE",
    "Brasil": "BR",
    "Camarões": "CM",
    "Chile": "CL",
    "Colômbia": "CO",
    "Costa Rica": "CR",
    "Croácia": "HR",
    "Equador": "EC",
    "Espanha": "ES",
    "EUA": "US",
    "França": "FR",
    "Holanda": "NL",
    "Hungria": "HU",
    "Inglaterra": "GB",
    "Irã": "IR",
    "Itália": "IT",
    "Marrocos": "MA",
    "México": "MX",
    "Nigéria": "NG",
    "Peru": "PE",
    "Polônia": "PL",
    "Portugal": "PT",
    "Rússia": "RU",
    "Suécia": "SE",
    "Suíça": "CH",
    "Turquia": "TR",
    "Uruguai": "UY",
    # meta / combined
    "Iugoslávia/Sérvia": "RS",
    "Catar": "QA",
}


def main() -> None:
    if not os.path.exists(PUZZLES_JSON):
        log.error("%s não encontrado. Execute build_puzzles.py primeiro.", PUZZLES_JSON)
        sys.exit(1)

    with open(PUZZLES_JSON, encoding="utf-8") as f:
        puzzles: list[dict] = json.load(f)

    seen: dict[str, dict] = {}
    for puzzle in puzzles:
        for p in puzzle["players"]:
            pid = p["player_id"]
            if pid not in seen:
                name: str = p["name"]
                # Derive country from player_id suffix (e.g. "klose-ger" → suffix "ger")
                # We rely on name uniqueness per player_id; country stored separately.
                seen[pid] = {
                    "id": pid,
                    "name": name,
                    "country": None,   # populated below if available
                    "country_code": None,
                    "photo_url": None,
                    "born_year": None,
                }

    # Enrich country from puzzle metadata (players don't carry country in JSON)
    # We derive it from the player_id prefix convention where possible.
    # For seleções (selecao-*), the name IS the country.
    for pid, entry in seen.items():
        if pid.startswith("selecao-"):
            entry["country"] = entry["name"]
            suffix = pid.replace("selecao-", "").upper()
            # Try to map known suffixes
            code_map = {v.lower(): v for v in COUNTRY_CODES.values()}
            entry["country_code"] = code_map.get(suffix, suffix)

    players = sorted(seen.values(), key=lambda p: p["id"])
    log.info("%d jogadores únicos extraídos", len(players))

    os.makedirs(os.path.dirname(PLAYERS_JSON), exist_ok=True)
    with open(PLAYERS_JSON, "w", encoding="utf-8") as f:
        json.dump(players, f, ensure_ascii=False, indent=2)
    log.info("SAVE %s", PLAYERS_JSON)


if __name__ == "__main__":
    main()
