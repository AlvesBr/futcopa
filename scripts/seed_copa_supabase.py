"""
Popula as tabelas cup_editions, cup_squads e cup_players no Supabase
a partir de data/cup_players_rated.json (gerado por build_ratings.py).

Usa upsert para ser idempotente — pode ser re-executado sem duplicatas.

Uso:
    python scripts/seed_copa_supabase.py
    python scripts/seed_copa_supabase.py --dry-run
    python scripts/seed_copa_supabase.py --years 2018 2022
"""

from __future__ import annotations

import argparse
import json
import logging
import os

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
IN_FILE  = os.path.join(DATA_DIR, "cup_players_rated.json")


def get_supabase_client():
    """Cria client Supabase com SERVICE_ROLE_KEY (acesso total)."""
    try:
        from supabase import create_client
    except ImportError:
        raise RuntimeError("Instale: pip install supabase")

    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise RuntimeError(
            "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY "
            "nas variáveis de ambiente ou no .env.local"
        )
    return create_client(url, key)


def load_env() -> None:
    """Carrega .env.local se existir."""
    env_file = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def seed(years: list[int] | None, dry_run: bool) -> None:
    load_env()
    if not dry_run:
        sb = get_supabase_client()

    with open(IN_FILE, encoding="utf-8") as f:
        data: list[dict] = json.load(f)

    if years:
        data = [e for e in data if e["year"] in years]

    total_editions = total_squads = total_players = 0

    for edition in data:
        year = edition["year"]

        # ── cup_editions ──────────────────────────────────────────────
        edition_row = {
            "year":         year,
            "host_country": edition["host_country"],
            "champion":     edition["champion"],
        }
        log.info("[%d] Upsert cup_editions…", year)
        if not dry_run:
            resp = sb.table("cup_editions").upsert(edition_row, on_conflict="year").execute()
            edition_id = resp.data[0]["id"]
        else:
            edition_id = f"dry-{year}"
        total_editions += 1

        for squad in edition.get("squads", []):
            # ── cup_squads ─────────────────────────────────────────────
            squad_row = {
                "edition_id":   edition_id,
                "country_code": squad["country_code"],
                "country_name": squad["country_name"],
                "flag_emoji":   squad["flag_emoji"],
                "phase_reached": squad["phase_reached"],
                "avg_rating":   squad["avg_rating"],
            }
            log.info("  [%s %d] Upsert cup_squads…", squad["country_code"], year)
            if not dry_run:
                resp = sb.table("cup_squads").upsert(
                    squad_row, on_conflict="edition_id,country_code"
                ).execute()
                squad_id = resp.data[0]["id"]
            else:
                squad_id = f"dry-{squad['country_code']}-{year}"
            total_squads += 1

            # ── cup_players ────────────────────────────────────────────
            players_rows = []
            for p in squad.get("players", []):
                players_rows.append({
                    "squad_id":        squad_id,
                    "squad_number":    p.get("squad_number"),
                    "name":            p["name"],
                    "positions":       p["positions"],
                    "rating_computed": p["rating_computed"],
                    "rating_override": p.get("rating_override"),
                    "override_reason": p.get("override_reason"),
                    "goals":           p.get("goals", 0),
                    "assists":         p.get("assists", 0),
                    "minutes_played":  p.get("minutes_played"),
                })

            if players_rows:
                log.info("    %d jogadores…", len(players_rows))
                if not dry_run:
                    # Upsert em lotes de 50 para evitar timeout
                    for i in range(0, len(players_rows), 50):
                        batch = players_rows[i:i+50]
                        sb.table("cup_players").upsert(batch).execute()
                total_players += len(players_rows)

    log.info(
        "%sPopulado: %d edições | %d squads | %d jogadores",
        "[DRY RUN] " if dry_run else "",
        total_editions, total_squads, total_players,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Copa dos Sonhos no Supabase")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem escrever no banco")
    parser.add_argument("--years", nargs="*", type=int, help="Filtrar por ano ex: --years 2018 2022")
    args = parser.parse_args()

    if not os.path.exists(IN_FILE):
        log.error("%s não encontrado. Execute build_ratings.py primeiro.", IN_FILE)
        return

    seed(years=args.years, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
