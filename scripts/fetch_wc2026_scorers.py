"""
fetch_wc2026_scorers.py

Busca artilheiros, assistências e minutos jogados da Copa do Mundo 2026
via API-Football e gera entradas de puzzle para data/puzzles.json.

Uso:
    python scripts/fetch_wc2026_scorers.py
    python scripts/fetch_wc2026_scorers.py --dry-run    # só mostra o JSON
    python scripts/fetch_wc2026_scorers.py --seed       # também seed no Supabase
    python scripts/fetch_wc2026_scorers.py --dates 2026-07-07,2026-07-08
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import time
import uuid
from datetime import date, timedelta
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

BASE = "https://v3.football.api-sports.io"
RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
PUZZLES_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles.json")

WORLD_CUP_LEAGUE_ID = 1
SEASON_2026 = 2026
DELAY = 1.2  # segundos entre requests (free tier)

RANK_TO_LEVEL: dict[int, int] = {
    1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 4, 8: 4, 9: 4, 10: 4,
}


def slugify(name: str) -> str:
    """Gera player_id a partir do nome."""
    import unicodedata, re
    nfkd = unicodedata.normalize("NFKD", name)
    ascii_str = nfkd.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_str.lower()).strip("-")
    return slug


def get_headers() -> dict[str, str]:
    key = os.getenv("API_FOOTBALL_KEY")
    if not key:
        raise EnvironmentError("API_FOOTBALL_KEY não encontrado. Adicione ao .env")
    return {
        "x-rapidapi-key": key,
        "x-rapidapi-host": "v3.football.api-sports.io",
    }


def check_quota(session: requests.Session) -> int:
    resp = session.get(f"{BASE}/status", headers=get_headers(), timeout=10)
    resp.raise_for_status()
    data = resp.json()
    remaining = data["response"]["requests"]["current"]
    limit = data["response"]["requests"]["limit_day"]
    log.info("Quota: %d/%d usados hoje", remaining, limit)
    return limit - remaining


def fetch_endpoint(session: requests.Session, endpoint: str, params: dict) -> list[dict]:
    """Busca endpoint e retorna lista de response items, com cache local."""
    os.makedirs(RAW_DIR, exist_ok=True)
    slug = endpoint.replace("/", "_")
    param_str = "_".join(f"{k}{v}" for k, v in sorted(params.items()))
    cache_file = os.path.join(RAW_DIR, f"wc2026_{slug}_{param_str}.json")

    if os.path.exists(cache_file):
        log.info("Cache hit: %s", cache_file)
        with open(cache_file, encoding="utf-8") as f:
            return json.load(f)

    log.info("Fetching %s %s", endpoint, params)
    time.sleep(DELAY)
    resp = session.get(
        f"{BASE}/{endpoint}",
        headers=get_headers(),
        params=params,
        timeout=15,
    )
    resp.raise_for_status()
    items = resp.json().get("response", [])
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    log.info("Salvou %d itens em %s", len(items), cache_file)
    return items


def build_scorers_puzzle(items: list[dict], puzzle_date: str) -> dict:
    """Gera puzzle de artilheiros a partir dos dados da API."""
    # Filtra top 10 jogadores com gols > 0
    scored = [
        p for p in items
        if p.get("statistics") and p["statistics"][0]["goals"]["total"] is not None
        and p["statistics"][0]["goals"]["total"] > 0
    ]
    top10 = scored[:10]
    if len(top10) < 10:
        log.warning("Apenas %d artilheiros com gols — puzzle pode ter menos de 10", len(top10))

    players = []
    for rank, item in enumerate(top10, start=1):
        info = item["player"]
        stats = item["statistics"][0]
        goals = stats["goals"]["total"]
        team = stats["team"]["name"] if stats.get("team") else ""
        country = info.get("nationality", "")
        name = info["name"]
        player_id = f"wc2026-scorer-{slugify(name)}"

        players.append({
            "player_id": player_id,
            "name": f"{name} ({team})",
            "value": goals,
            "correct_rank": rank,
            "correct_level": RANK_TO_LEVEL[rank],
        })

    return {
        "id": f"puzzle-{puzzle_date}",
        "date": puzzle_date,
        "category": "Artilheiros da Copa do Mundo 2026",
        "description": "Quem fez mais gols na Copa 2026? Ordene do artilheiro ao que marcou menos neste top 10.",
        "difficulty": "normal",
        "source": "API-Football 2026",
        "players": players,
    }


def build_assists_puzzle(items: list[dict], puzzle_date: str) -> dict:
    """Gera puzzle de assistências."""
    assisted = [
        p for p in items
        if p.get("statistics") and p["statistics"][0]["goals"]["assists"] is not None
        and p["statistics"][0]["goals"]["assists"] > 0
    ]
    top10 = assisted[:10]

    players = []
    for rank, item in enumerate(top10, start=1):
        info = item["player"]
        stats = item["statistics"][0]
        assists = stats["goals"]["assists"]
        team = stats["team"]["name"] if stats.get("team") else ""
        name = info["name"]
        player_id = f"wc2026-assist-{slugify(name)}"

        players.append({
            "player_id": player_id,
            "name": f"{name} ({team})",
            "value": assists,
            "correct_rank": rank,
            "correct_level": RANK_TO_LEVEL[rank],
        })

    return {
        "id": f"puzzle-{puzzle_date}",
        "date": puzzle_date,
        "category": "Assistências na Copa do Mundo 2026",
        "description": "Quem deu mais assistências na Copa 2026? Do maior garçom ao que passou menos.",
        "difficulty": "normal",
        "source": "API-Football 2026",
        "players": players,
    }


def build_minutes_puzzle(items: list[dict], puzzle_date: str) -> dict:
    """Gera puzzle de minutos jogados."""
    with_minutes = [
        p for p in items
        if p.get("statistics") and p["statistics"][0]["games"]["minutes"] is not None
        and p["statistics"][0]["games"]["minutes"] > 0
    ]
    # Ordena por minutos desc
    with_minutes.sort(key=lambda p: p["statistics"][0]["games"]["minutes"], reverse=True)
    top10 = with_minutes[:10]

    players = []
    for rank, item in enumerate(top10, start=1):
        info = item["player"]
        stats = item["statistics"][0]
        minutes = stats["games"]["minutes"]
        team = stats["team"]["name"] if stats.get("team") else ""
        name = info["name"]
        player_id = f"wc2026-minutes-{slugify(name)}"

        players.append({
            "player_id": player_id,
            "name": f"{name} ({team})",
            "value": minutes,
            "correct_rank": rank,
            "correct_level": RANK_TO_LEVEL[rank],
        })

    return {
        "id": f"puzzle-{puzzle_date}",
        "date": puzzle_date,
        "category": "Minutos jogados na Copa do Mundo 2026",
        "description": "Quem ficou mais tempo em campo na Copa 2026? Do mais presente ao menos.",
        "difficulty": "normal",
        "source": "API-Football 2026",
        "players": players,
    }


def fetch_all_players(session: requests.Session) -> list[dict]:
    """Busca todos os top players (paginado) para ter dados completos."""
    all_players: list[dict] = []
    for page in range(1, 4):  # Até 3 páginas (free tier)
        items = fetch_endpoint(
            session,
            "players/topscorers",
            {"league": WORLD_CUP_LEAGUE_ID, "season": SEASON_2026, "page": page},
        )
        if not items:
            break
        all_players.extend(items)
        log.info("Página %d: +%d jogadores (total: %d)", page, len(items), len(all_players))
        if len(items) < 20:  # última página
            break
    return all_players


def update_puzzles_json(new_puzzles: list[dict]) -> int:
    """Adiciona puzzles ao data/puzzles.json (evita duplicatas por data)."""
    with open(PUZZLES_FILE, encoding="utf-8") as f:
        existing = json.load(f)

    existing_dates = {p["date"] for p in existing}
    added = 0
    for pz in new_puzzles:
        if pz["date"] in existing_dates:
            log.info("Data %s já existe — pulando", pz["date"])
            continue
        existing.append(pz)
        existing_dates.add(pz["date"])
        added += 1
        log.info("Adicionado puzzle %s: %s", pz["date"], pz["category"])

    # Salva ordenado por data
    existing.sort(key=lambda p: p["date"])
    with open(PUZZLES_FILE, "w", encoding="utf-8") as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    return added


def seed_supabase(puzzles: list[dict]) -> None:
    """Faz upsert dos puzzles no Supabase."""
    try:
        from supabase import create_client
    except ImportError:
        log.error("supabase-py não instalado. Execute: pip install supabase")
        return

    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        log.error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados")
        return

    sb = create_client(url, key)
    for pz in puzzles:
        row = {
            "id": str(uuid.uuid4()),
            "date": pz["date"],
            "category": pz["category"],
            "description": pz.get("description"),
            "difficulty": pz.get("difficulty", "normal"),
            "players": pz["players"],
            "source": pz.get("source"),
        }
        result = sb.table("puzzles").upsert(row, on_conflict="date").execute()
        log.info("Supabase upsert %s: %s", pz["date"], "ok" if not result.error else result.error)


def next_available_dates(n: int, start: str | None = None) -> list[str]:
    """Retorna N datas ainda não usadas em puzzles.json, a partir de start."""
    with open(PUZZLES_FILE, encoding="utf-8") as f:
        existing = {p["date"] for p in json.load(f)}

    if start:
        d = date.fromisoformat(start)
    else:
        # Próxima data após a última existente
        last = max(existing) if existing else date.today().isoformat()
        d = date.fromisoformat(last) + timedelta(days=1)

    result = []
    while len(result) < n:
        iso = d.isoformat()
        if iso not in existing:
            result.append(iso)
        d += timedelta(days=1)
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Gera puzzles da Copa 2026 via API-Football")
    parser.add_argument("--dry-run", action="store_true", help="Só exibe o JSON, não salva")
    parser.add_argument("--seed", action="store_true", help="Faz seed no Supabase também")
    parser.add_argument("--dates", help="Datas separadas por vírgula ex: 2026-07-07,2026-07-08,2026-07-09")
    args = parser.parse_args()

    session = requests.Session()

    # Verifica quota
    try:
        remaining = check_quota(session)
        if remaining < 5:
            log.error("Quota insuficiente (%d requests restantes). Abortando.", remaining)
            sys.exit(1)
    except Exception as e:
        log.warning("Não conseguiu checar quota: %s", e)

    # Busca todos os jogadores da Copa 2026
    log.info("=== Buscando artilheiros Copa 2026 ===")
    all_players = fetch_all_players(session)

    if not all_players:
        log.error("Nenhum dado retornado. Verifique se a Copa 2026 já tem dados na API.")
        log.info("Dica: O torneio pode não ter dados até começar. Tente mais tarde.")
        sys.exit(1)

    # Define datas para os puzzles
    if args.dates:
        dates = args.dates.split(",")
    else:
        dates = next_available_dates(3)

    log.info("Datas dos puzzles: %s", dates)

    # Garante 3 datas
    while len(dates) < 3:
        d = date.fromisoformat(dates[-1]) + timedelta(days=1)
        dates.append(d.isoformat())

    # Gera os 3 puzzles
    puzzles = [
        build_scorers_puzzle(all_players, dates[0]),
        build_assists_puzzle(all_players, dates[1]),
        build_minutes_puzzle(all_players, dates[2]),
    ]

    if args.dry_run:
        print(json.dumps(puzzles, ensure_ascii=False, indent=2))
        return

    # Atualiza puzzles.json
    added = update_puzzles_json(puzzles)
    log.info("=== %d puzzles adicionados ao puzzles.json ===", added)

    if args.seed:
        log.info("=== Fazendo seed no Supabase ===")
        seed_supabase(puzzles)

    log.info("Concluído!")


if __name__ == "__main__":
    main()
