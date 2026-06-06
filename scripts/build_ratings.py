"""
Calcula ratings 60–99 por jogador × campanha usando duas camadas:
  1. Score bruto por grupo de posição (participação + contribuição + torneio)
  2. Normalização por percentil global dentro do grupo posicional

Lê:  data/cup_squads.json  (gerado por fetch_cup_squads.py)
Gera: data/cup_players_rated.json

Uso:
    python scripts/build_ratings.py
    python scripts/build_ratings.py --min-players-per-squad 8
"""

from __future__ import annotations

import argparse
import json
import logging
import os
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATA_DIR    = os.path.join(os.path.dirname(__file__), "..", "data")
IN_FILE     = os.path.join(DATA_DIR, "cup_squads.json")
OUT_FILE    = os.path.join(DATA_DIR, "cup_players_rated.json")

RATING_MIN = 60
RATING_MAX = 99

# Pontos de bônus por fase alcançada pelo time
PHASE_BONUS: dict[str, float] = {
    "CAMPEÃO":     12.0,
    "VICE":         9.0,
    "SEMI":         7.0,
    "QUARTAS":      5.0,
    "OITAVAS":      3.0,
    "FASE_GRUPOS":  1.0,
}

# Máximo de minutos possíveis por fase (para normalizar participação)
MAX_MINUTES_BY_PHASE: dict[str, int] = {
    "CAMPEÃO":     690,   # 7 jogos × ~90 min + tempo extra ocasional
    "VICE":        690,
    "SEMI":        540,   # 6 jogos
    "QUARTAS":     450,   # 5 jogos
    "OITAVAS":     360,   # 4 jogos
    "FASE_GRUPOS": 270,   # 3 jogos
}

# Grupos de posição: define qual fórmula e teto de contribuição usar
POS_GROUP: dict[str, str] = {
    "GOL": "gol",
    "LD": "defensor", "LE": "defensor", "ZAG": "defensor",
    "MEI": "meia", "MD": "meia", "ME": "meia",
    "PD": "atacante", "PE": "atacante", "CA": "atacante",
}


def pos_group(positions: list[str]) -> str:
    """Retorna o grupo da posição principal."""
    primary = positions[0] if positions else "MEI"
    return POS_GROUP.get(primary.upper(), "meia")


def raw_score(player: dict, squad: dict) -> float:
    """
    Calcula o score bruto de um jogador na sua campanha.
    Quanto maior o score, melhor o rating normalizado.
    """
    phase       = squad.get("phase_reached", "FASE_GRUPOS")
    max_minutes = MAX_MINUTES_BY_PHASE.get(phase, 270)
    minutes     = player.get("minutes_played") or 0
    goals       = player.get("goals", 0)
    assists     = player.get("assists", 0)
    group       = pos_group(player.get("positions", ["MEI"]))

    # Participação: quanto tempo jogou em relação ao máximo possível
    min_ratio = min(minutes / max_minutes, 1.0) if max_minutes > 0 else 0.0

    # Bônus de torneio: fase alcançada pelo time
    torneio = PHASE_BONUS.get(phase, 1.0)

    if group == "gol":
        # Goleiro: participação domina; torneio ligeiramente ampliado
        part    = min_ratio * 40.0
        contrib = 0.0
        t_bonus = torneio * 1.2
    elif group == "defensor":
        # Defensor: participação importante; contribuição ofensiva menor
        part    = min_ratio * 35.0
        contrib = min(goals * 3.0 + assists * 2.0, 12.0)
        t_bonus = torneio
    elif group == "meia":
        # Meia: equilíbrio entre participação e contribuição
        part    = min_ratio * 30.0
        contrib = min(goals * 2.0 + assists * 2.0, 20.0)
        t_bonus = torneio
    else:  # atacante
        # Atacante: contribuição ofensiva tem mais peso
        part    = min_ratio * 25.0
        contrib = min(goals * 3.5 + assists * 1.5, 28.0)
        t_bonus = torneio

    return part + contrib + t_bonus


def normalize_to_60_99(scores: list[float]) -> list[int]:
    """
    Normaliza lista de scores para inteiros no intervalo [60, 99]
    usando percentil dentro do grupo.
    """
    if not scores:
        return []
    n = len(scores)
    if n == 1:
        return [80]  # único jogador no grupo → rating médio

    sorted_scores = sorted(scores)
    result = []
    for score in scores:
        # Posição na lista ordenada (0-based)
        rank = sorted_scores.index(score)
        # Empates: usar média de posições
        all_ranks = [i for i, s in enumerate(sorted_scores) if s == score]
        rank = sum(all_ranks) / len(all_ranks)

        percentil = rank / (n - 1)  # 0.0 → 1.0
        rating = round(RATING_MIN + percentil * (RATING_MAX - RATING_MIN))
        result.append(max(RATING_MIN, min(RATING_MAX, rating)))

    return result


def build_ratings(data: list[dict], min_players_per_squad: int = 8) -> list[dict]:
    """
    Processa todos os squads, calcula ratings e retorna estrutura pronta para o banco.
    """
    # Passo 1: Coletar todos os scores por grupo posicional
    all_players: list[dict] = []   # cada item tem squad info + player + score

    for edition in data:
        year    = edition["year"]
        squads  = edition.get("squads", [])

        for squad in squads:
            players = squad.get("players", [])
            if len(players) < min_players_per_squad:
                log.warning(
                    "%s %d — apenas %d jogadores (mínimo %d), pulando",
                    squad.get("country_name"), year, len(players), min_players_per_squad
                )
                continue

            for player in players:
                score = raw_score(player, squad)
                group = pos_group(player.get("positions", ["MEI"]))
                all_players.append({
                    "edition_year":   year,
                    "country_code":   squad.get("country_code", "??"),
                    "country_name":   squad.get("country_name", "?"),
                    "flag_emoji":     squad.get("flag_emoji", "🏳"),
                    "phase_reached":  squad.get("phase_reached", "FASE_GRUPOS"),
                    "squad_number":   player.get("squad_number"),
                    "name":           player.get("name", ""),
                    "positions":      player.get("positions", ["MEI"]),
                    "goals":          player.get("goals", 0),
                    "assists":        player.get("assists", 0),
                    "minutes_played": player.get("minutes_played"),
                    "rating_override": player.get("rating_override"),
                    "override_reason": player.get("override_reason"),
                    "_score": score,
                    "_group": group,
                })

    # Passo 2: Normalizar por grupo posicional
    groups = ["gol", "defensor", "meia", "atacante"]
    for group in groups:
        group_players = [p for p in all_players if p["_group"] == group]
        scores        = [p["_score"] for p in group_players]
        ratings       = normalize_to_60_99(scores)

        for player, rating in zip(group_players, ratings):
            player["rating_computed"] = rating

    # Passo 3: Calcular avg_rating por squad (média dos 11 maiores ratings)
    # Agrupa por (edition_year, country_code)
    squad_key_to_players: dict[tuple, list[dict]] = {}
    for p in all_players:
        key = (p["edition_year"], p["country_code"])
        squad_key_to_players.setdefault(key, []).append(p)

    squad_avg_ratings: dict[tuple, int] = {}
    for key, players in squad_key_to_players.items():
        top11 = sorted(
            [p.get("rating_computed", 75) for p in players], reverse=True
        )[:11]
        squad_avg_ratings[key] = round(sum(top11) / len(top11)) if top11 else 75

    # Passo 4: Montar output final
    output: list[dict] = []
    for edition in data:
        year   = edition["year"]
        squads = edition.get("squads", [])
        out_squads = []

        for squad in squads:
            key  = (year, squad.get("country_code", "??"))
            players_out = []

            for p in squad_key_to_players.get(key, []):
                rating_computed = p.get("rating_computed", 75)
                rating_override = p.get("rating_override")
                rating_final    = rating_override if rating_override is not None else rating_computed

                players_out.append({
                    "squad_number":    p["squad_number"],
                    "name":            p["name"],
                    "positions":       p["positions"],
                    "goals":           p["goals"],
                    "assists":         p["assists"],
                    "minutes_played":  p["minutes_played"],
                    "rating_computed": rating_computed,
                    "rating_override": rating_override,
                    "override_reason": p.get("override_reason"),
                    "rating":          rating_final,
                })

            if not players_out:
                continue

            out_squads.append({
                "country_code": squad.get("country_code", "??"),
                "country_name": squad.get("country_name", "?"),
                "flag_emoji":   squad.get("flag_emoji", "🏳"),
                "phase_reached": squad.get("phase_reached", "FASE_GRUPOS"),
                "avg_rating":   squad_avg_ratings.get(key, 75),
                "players":      players_out,
            })

        output.append({
            "year":         year,
            "host_country": edition.get("host_country", ""),
            "champion":     edition.get("champion", ""),
            "squads":       out_squads,
        })

    return output


def validate(data: list[dict]) -> None:
    """Valida critérios mínimos de qualidade."""
    editions_ok = len(data) >= 1
    all_ratings_ok = all(
        RATING_MIN <= p["rating"] <= RATING_MAX
        for e in data
        for sq in e.get("squads", [])
        for p in sq.get("players", [])
    )
    log.info("Edições: %d | Ratings dentro de 60–99: %s", len(data), all_ratings_ok)
    if not editions_ok:
        log.error("FALHA: nenhuma edição gerada")
    if not all_ratings_ok:
        log.error("FALHA: ratings fora do intervalo 60–99")


def main(min_players_per_squad: int = 8) -> None:
    if not os.path.exists(IN_FILE):
        log.error("Arquivo %s não encontrado. Execute fetch_cup_squads.py primeiro.", IN_FILE)
        return

    with open(IN_FILE, encoding="utf-8") as f:
        raw = json.load(f)

    rated = build_ratings(raw, min_players_per_squad=min_players_per_squad)
    validate(rated)

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(rated, f, ensure_ascii=False, indent=2)

    total_squads  = sum(len(e.get("squads", [])) for e in rated)
    total_players = sum(len(sq["players"]) for e in rated for sq in e.get("squads", []))
    log.info(
        "Gerado %s — %d edições | %d squads | %d jogadores com rating",
        OUT_FILE, len(rated), total_squads, total_players,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Calcula ratings dos jogadores das Copas")
    parser.add_argument("--min-players-per-squad", type=int, default=8)
    args = parser.parse_args()
    main(min_players_per_squad=args.min_players_per_squad)
