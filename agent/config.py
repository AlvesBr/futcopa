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


def _get_event_data() -> dict:
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path:
        raise EnvironmentError("Neither issue env vars nor GITHUB_EVENT_PATH is set.")
    import json
    with open(event_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_issue_number() -> int:
    val = os.environ.get("ISSUE_NUMBER")
    if val:
        return int(val)
    data = _get_event_data()
    if "inputs" in data and "issue_number" in data["inputs"] and data["inputs"]["issue_number"]:
        return int(data["inputs"]["issue_number"])
    return int(data["issue"]["number"])


def get_issue_body() -> str:
    val = os.environ.get("ISSUE_BODY")
    if val is not None:
        return val
    data = _get_event_data()
    if "inputs" in data and "issue_body" in data["inputs"] and data["inputs"]["issue_body"]:
        return data["inputs"]["issue_body"]
    return data["issue"]["body"] or ""


def get_issue_title() -> str:
    val = os.environ.get("ISSUE_TITLE")
    if val is not None:
        return val
    data = _get_event_data()
    if "inputs" in data and "issue_title" in data["inputs"] and data["inputs"]["issue_title"]:
        return data["inputs"]["issue_title"]
    return data["issue"]["title"] or ""


def is_agent_issue() -> bool:
    """Return True if the execution was manually triggered or the issue has the 'agent-fix' label."""
    try:
        # If running locally for testing without GITHUB_EVENT_PATH, default to True
        if not os.environ.get("GITHUB_EVENT_PATH") and not os.environ.get("ISSUE_NUMBER"):
            return True
        data = _get_event_data()
        if "issue" not in data:
            return True  # Manual workflow_dispatch
        labels = data["issue"].get("labels", [])
        return any(label.get("name") == "agent-fix" for label in labels)
    except Exception:
        return True
