"""
Scrape player statistics from FBRef for World Cup editions (2014, 2018, 2022).
Uses pandas.read_html() with a 3-second delay between requests.
Saves CSVs to data/raw/fbref_{year}_stats.csv.
Skips files that already exist locally.
Maximum 20 requests per session (spec requirement).

Usage:
    python scripts/fetch_fbref.py
"""

from __future__ import annotations

import logging
import os
import time

import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
DELAY_SECONDS = 3
MAX_REQUESTS = 20

HEADERS = {"User-Agent": "Mozilla/5.0 (research project — worldcup-pyramid)"}

URLS = [
    (2022, "https://fbref.com/en/comps/1/2022/stats/2022-FIFA-World-Cup-Stats"),
    (2018, "https://fbref.com/en/comps/1/2018/stats/2018-FIFA-World-Cup-Stats"),
    (2014, "https://fbref.com/en/comps/1/2014/stats/2014-FIFA-World-Cup-Stats"),
]


def fetch_year(year: int, url: str, request_count: list[int]) -> None:
    dest = os.path.join(RAW_DIR, f"fbref_{year}_stats.csv")
    if os.path.exists(dest):
        log.info("SKIP %s (already exists)", dest)
        return

    if request_count[0] >= MAX_REQUESTS:
        log.warning("Limite de %d requests atingido. Abortando.", MAX_REQUESTS)
        return

    log.info("GET  %s", url)
    try:
        tables = pd.read_html(url, attrs={"class": "stats_table"})
        request_count[0] += 1
    except Exception as exc:
        log.error("Copa %d — erro ao ler tabela: %s", year, exc)
        return

    if not tables:
        log.error("Copa %d — nenhuma tabela encontrada em %s", year, url)
        return

    df = tables[0]
    # Flatten MultiIndex columns if present
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [" ".join(c).strip() for c in df.columns]

    os.makedirs(RAW_DIR, exist_ok=True)
    df.to_csv(dest, index=False, encoding="utf-8")
    log.info("SAVE %s (%d rows)", dest, len(df))


def main() -> None:
    request_count = [0]
    os.makedirs(RAW_DIR, exist_ok=True)

    for i, (year, url) in enumerate(URLS):
        if i > 0:
            log.info("Aguardando %ds...", DELAY_SECONDS)
            time.sleep(DELAY_SECONDS)
        fetch_year(year, url, request_count)

    log.info("Concluído. %d requests realizados. Arquivos em data/raw/fbref_*.csv", request_count[0])


if __name__ == "__main__":
    main()
