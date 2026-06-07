"""
Download worldcup JSON files from openfootball/worldcup.json on GitHub.
Saves each edition to data/raw/worldcup_{year}.json.
Skips files that already exist locally.

Usage:
    python scripts/fetch_openfootball.py
"""

from __future__ import annotations

import json
import logging
import os
import sys

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

BASE_URL = "https://raw.githubusercontent.com/openfootball/worldcup.json/master"
RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")

YEARS = [
    1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970,
    1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006,
    2010, 2014, 2018, 2022,
]


def count_goals(rounds: list) -> tuple[int, int]:
    """Return (total_games, total_goals) from a list of rounds."""
    games = 0
    goals = 0
    for rnd in rounds:
        for match in rnd.get("matches", []):
            games += 1
            goals += match.get("score1", 0) or 0
            goals += match.get("score2", 0) or 0
    return games, goals


def has_player_goals(rounds: list) -> bool:
    for rnd in rounds:
        for match in rnd.get("matches", []):
            if match.get("goals1") or match.get("goals2"):
                return True
    return False


def fetch_year(year: int, session: requests.Session) -> None:
    dest = os.path.join(RAW_DIR, f"worldcup_{year}.json")
    if os.path.exists(dest):
        log.info("SKIP %s (already exists)", dest)
        return

    url = f"{BASE_URL}/{year}/worldcup.json"
    log.info("GET  %s", url)
    resp = session.get(url, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    rounds = data.get("rounds", [])
    games, goals = count_goals(rounds)
    if not has_player_goals(rounds):
        log.warning("Copa %d — sem dados de gols por jogador (placar disponível)", year)

    log.info("Copa %d — %d jogos, %d gols totais", year, games, goals)

    os.makedirs(RAW_DIR, exist_ok=True)
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    log.info("SAVE %s", dest)


def main() -> None:
    session = requests.Session()
    session.headers["User-Agent"] = "worldcup-pyramid/data-pipeline (research)"
    errors: list[int] = []

    for year in YEARS:
        try:
            fetch_year(year, session)
        except Exception as exc:
            log.error("Copa %d — erro: %s", year, exc)
            errors.append(year)

    if errors:
        log.error("Falhou para: %s", errors)
        sys.exit(1)
    log.info("Concluído. Arquivos em data/raw/worldcup_*.json")


if __name__ == "__main__":
    main()
