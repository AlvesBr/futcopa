"""
Collect World Cup statistics from API-Football v3 (free tier: 100 req/day).
Verifies quota before running; skips endpoints already cached locally.
Saves responses to data/raw/apifootball_{endpoint}_{params}.json.

Requires API_FOOTBALL_KEY in environment or .env file.

Usage:
    python scripts/fetch_api_football.py
"""

from __future__ import annotations

import json
import logging
import os
import sys
import time

import requests
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

BASE = "https://v3.football.api-sports.io"
RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
WORLD_CUP_LEAGUE_ID = 1
DELAY_SECONDS = 1  # polite delay between requests

ENDPOINTS: list[dict] = [
    # Top scorers per World Cup edition
    {"endpoint": "players/topscorers", "params": {"league": WORLD_CUP_LEAGUE_ID, "season": 2022}},
    {"endpoint": "players/topscorers", "params": {"league": WORLD_CUP_LEAGUE_ID, "season": 2018}},
    {"endpoint": "players/topscorers", "params": {"league": WORLD_CUP_LEAGUE_ID, "season": 2014}},
    {"endpoint": "players/topscorers", "params": {"league": WORLD_CUP_LEAGUE_ID, "season": 2010}},
    {"endpoint": "players/topscorers", "params": {"league": WORLD_CUP_LEAGUE_ID, "season": 2006}},
    {"endpoint": "players/topscorers", "params": {"league": WORLD_CUP_LEAGUE_ID, "season": 2002}},
]


def cache_filename(endpoint: str, params: dict) -> str:
    slug = endpoint.replace("/", "_")
    param_str = "_".join(f"{k}{v}" for k, v in sorted(params.items()))
    return f"apifootball_{slug}_{param_str}.json"


def check_quota(session: requests.Session) -> int:
    resp = session.get(f"{BASE}/status", timeout=30)
    resp.raise_for_status()
    data = resp.json()
    remaining = data.get("response", {}).get("requests", {}).get("current", None)
    limit = data.get("response", {}).get("requests", {}).get("limit_day", 100)
    used = data.get("response", {}).get("requests", {}).get("current", 0)
    remaining_val = limit - used
    log.info("Cota API-Football: %d/%d usados, %d restantes hoje", used, limit, remaining_val)
    return remaining_val


def fetch_endpoint(endpoint: str, params: dict, session: requests.Session) -> None:
    filename = cache_filename(endpoint, params)
    dest = os.path.join(RAW_DIR, filename)

    if os.path.exists(dest):
        log.info("SKIP %s (cache local existe)", filename)
        return

    url = f"{BASE}/{endpoint}"
    log.info("GET  %s  params=%s", url, params)
    resp = session.get(url, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    if data.get("errors"):
        log.error("Erro da API: %s", data["errors"])
        return

    os.makedirs(RAW_DIR, exist_ok=True)
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    results = len(data.get("response", []))
    log.info("SAVE %s (%d resultados)", filename, results)


def main() -> None:
    api_key = os.getenv("API_FOOTBALL_KEY")
    if not api_key:
        log.error("API_FOOTBALL_KEY não encontrada. Defina no .env ou no ambiente.")
        sys.exit(1)

    session = requests.Session()
    session.headers.update({"x-apisports-key": api_key})

    os.makedirs(RAW_DIR, exist_ok=True)

    # Check quota
    try:
        remaining = check_quota(session)
    except Exception as exc:
        log.error("Falha ao verificar cota: %s", exc)
        sys.exit(1)

    if remaining < 20:
        log.warning(
            "Apenas %d requests restantes hoje (< 20). Prosseguir pode esgotar a cota.",
            remaining,
        )
        answer = input("Continuar mesmo assim? (s/N) ").strip().lower()
        if answer != "s":
            log.info("Abortado pelo usuário.")
            sys.exit(0)

    # Count how many new requests will be needed
    pending = [
        ep for ep in ENDPOINTS
        if not os.path.exists(os.path.join(RAW_DIR, cache_filename(ep["endpoint"], ep["params"])))
    ]
    log.info("%d endpoints pendentes (não cacheados)", len(pending))

    errors = []
    for i, ep in enumerate(ENDPOINTS):
        if i > 0:
            time.sleep(DELAY_SECONDS)
        try:
            fetch_endpoint(ep["endpoint"], ep["params"], session)
        except Exception as exc:
            log.error("Falha em %s %s: %s", ep["endpoint"], ep["params"], exc)
            errors.append(ep)

    if errors:
        log.error("Falharam %d endpoints:", len(errors))
        for ep in errors:
            log.error("  %s %s", ep["endpoint"], ep["params"])
        sys.exit(1)

    log.info("Concluído. Arquivos em data/raw/apifootball_*.json")


if __name__ == "__main__":
    main()
