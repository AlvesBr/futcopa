"""Configuration constants and environment variable reading for the agent."""

from __future__ import annotations

import os

# ── Retry / backoff ──────────────────────────────────────────────────────────
MAX_RETRIES: int = 5
BACKOFF_BASE: int = 2
BACKOFF_MAX: int = 60

# ── Gemini ───────────────────────────────────────────────────────────────────
GEMINI_MODEL: str = "gemini-2.5-flash"
GEMINI_API_URL: str = "https://generativelanguage.googleapis.com/v1beta/models"
GEMINI_TIMEOUT: int = 120  # seconds

# ── Test pipeline ────────────────────────────────────────────────────────────
TEST_COMMANDS: list[tuple[str, str]] = [
    ("typecheck", "npx tsc --noEmit"),
    ("jest", "npx jest --passWithNoTests --ci"),
    ("build", "npx next build"),
]
TEST_TIMEOUT: int = 300  # seconds per command

# ── Repository ───────────────────────────────────────────────────────────────
REPO_OWNER: str = "AlvesBr"
REPO_NAME: str = "futcopa"
REPO_FULL_NAME: str = f"{REPO_OWNER}/{REPO_NAME}"


def _require_env(name: str) -> str:
    """Return the value of an environment variable or raise."""
    value = os.environ.get(name)
    if not value:
        raise EnvironmentError(f"Environment variable {name!r} is required but not set.")
    return value


def get_gemini_api_key() -> str:
    return _require_env("GEMINI_API_KEY")


def get_github_token() -> str:
    return _require_env("GITHUB_TOKEN")


def get_issue_number() -> int:
    return int(_require_env("ISSUE_NUMBER"))


def get_issue_body() -> str:
    return _require_env("ISSUE_BODY")


def get_issue_title() -> str:
    return _require_env("ISSUE_TITLE")
