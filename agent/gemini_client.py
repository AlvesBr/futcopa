"""Gemini API client with exponential backoff and structured JSON extraction."""

from __future__ import annotations

import json
import logging
import random
import re
from typing import Any

import httpx

from agent.config import (
    BACKOFF_BASE,
    BACKOFF_MAX,
    GEMINI_API_URL,
    GEMINI_MODEL,
    GEMINI_TIMEOUT,
    MAX_RETRIES,
    get_gemini_api_key,
)
from agent.models import AttemptRecord, FileChange, IssueData

logger = logging.getLogger(__name__)

# HTTP status codes that should trigger a retry
_RETRYABLE_STATUSES: set[int] = {429, 500, 503}

# ── System prompt template ───────────────────────────────────────────────────
_SYSTEM_PROMPT = """\
You are an expert software engineer. Your job is to fix a bug in a Next.js 14 / TypeScript / React 18 / Tailwind CSS / Supabase project.

RULES:
1. Return ONLY a valid JSON array of objects, each with "filename" (string) and "content" (string).
2. "content" must contain the COMPLETE file contents — not a diff or partial snippet.
3. Do NOT include any explanations, markdown fences, or text outside the JSON array.
4. Preserve all existing functionality that is not related to the bug.
5. Follow the project's existing coding style (TypeScript, React functional components, Tailwind classes).
"""


def _build_user_prompt(
    issue: IssueData,
    file_contents: dict[str, str],
    error_history: list[AttemptRecord] | None = None,
) -> str:
    """Construct the user prompt sent to Gemini."""
    parts: list[str] = []

    # Issue description
    parts.append(f"## Issue #{issue.issue_number}: {issue.title}\n")
    parts.append(f"**Current behavior:** {issue.current_behavior}\n")
    parts.append(f"**Expected behavior:** {issue.expected_behavior}\n")
    if issue.reproduction_steps:
        parts.append(f"**Reproduction steps:**\n{issue.reproduction_steps}\n")
    if issue.error_logs:
        parts.append(f"**Error logs:**\n```\n{issue.error_logs}\n```\n")
    if issue.additional_context:
        parts.append(f"**Additional context:** {issue.additional_context}\n")

    # Target files
    parts.append("## Target files (current contents)\n")
    for path, content in file_contents.items():
        parts.append(f"### `{path}`\n```\n{content}\n```\n")

    # Error history from previous attempts
    if error_history:
        parts.append("## Previous failed attempts\n")
        for rec in error_history:
            parts.append(f"### Attempt {rec.attempt}\n")
            parts.append(f"Error:\n```\n{rec.error_log}\n```\n")
            if rec.patches:
                parts.append("Patches applied:\n")
                for p in rec.patches:
                    parts.append(f"- `{p.filename}` ({len(p.content)} chars)\n")

    parts.append(
        "\nNow produce the corrected file(s) as a JSON array of "
        '{"filename": "...", "content": "..."} objects. Return ONLY the JSON.'
    )
    return "\n".join(parts)


def _extract_json_array(text: str) -> list[dict[str, Any]]:
    """Best-effort extraction of a JSON array from LLM output.

    Handles raw JSON, markdown-fenced JSON, and stray text around the array.
    """
    # Try direct parse first
    text = text.strip()
    if text.startswith("["):
        try:
            return json.loads(text)  # type: ignore[no-any-return]
        except json.JSONDecodeError:
            pass

    # Strip markdown fences
    fenced = re.search(r"```(?:json)?\s*(\[.*?])\s*```", text, re.DOTALL)
    if fenced:
        try:
            return json.loads(fenced.group(1))  # type: ignore[no-any-return]
        except json.JSONDecodeError:
            pass

    # Last resort: find first [ … ] span
    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(text[start : end + 1])  # type: ignore[no-any-return]
        except json.JSONDecodeError:
            pass

    raise ValueError("Could not extract a valid JSON array from the Gemini response.")


async def ask_gemini(
    issue: IssueData,
    file_contents: dict[str, str],
    error_history: list[AttemptRecord] | None = None,
) -> list[FileChange]:
    """Call Gemini and return a list of :class:`FileChange`.

    Retries with exponential back-off + jitter on transient errors.
    """
    api_key = get_gemini_api_key()
    url = f"{GEMINI_API_URL}/{GEMINI_MODEL}:generateContent?key={api_key}"

    user_prompt = _build_user_prompt(issue, file_contents, error_history)

    payload: dict[str, Any] = {
        "system_instruction": {
            "parts": [{"text": _SYSTEM_PROMPT}],
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 65536,
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "filename": {"type": "STRING"},
                        "content": {"type": "STRING"},
                    },
                    "required": ["filename", "content"],
                },
            },
        },
    }

    last_error: Exception | None = None

    async with httpx.AsyncClient(timeout=GEMINI_TIMEOUT) as client:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                logger.info("Gemini request attempt %d/%d", attempt, MAX_RETRIES)
                response = await client.post(url, json=payload)

                if response.status_code in _RETRYABLE_STATUSES:
                    logger.warning(
                        "Gemini returned %d — will retry (%d/%d)",
                        response.status_code,
                        attempt,
                        MAX_RETRIES,
                    )
                    last_error = httpx.HTTPStatusError(
                        f"HTTP {response.status_code}",
                        request=response.request,
                        response=response,
                    )
                    await _backoff(attempt)
                    continue

                response.raise_for_status()

                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise ValueError("Gemini response has no candidates.")

                text_parts = candidates[0].get("content", {}).get("parts", [])
                raw_text = "".join(p.get("text", "") for p in text_parts)
                logger.debug("Gemini raw output length: %d chars", len(raw_text))

                items = _extract_json_array(raw_text)
                changes = [FileChange(**item) for item in items]
                logger.info("Gemini returned %d file change(s)", len(changes))
                return changes

            except (httpx.TimeoutException, httpx.ConnectError) as exc:
                logger.warning("Gemini request failed: %s — retrying", exc)
                last_error = exc
                await _backoff(attempt)

    raise RuntimeError(
        f"Gemini API failed after {MAX_RETRIES} attempts. Last error: {last_error}"
    )


async def _backoff(attempt: int) -> None:
    """Async exponential backoff with full jitter."""
    import asyncio

    delay = min(BACKOFF_MAX, BACKOFF_BASE ** attempt)
    jitter = random.uniform(0, delay)
    logger.debug("Backing off for %.1fs (attempt %d)", jitter, attempt)
    await asyncio.sleep(jitter)


async def parse_issue_text(title: str, body: str) -> dict[str, Any]:
    """Use Gemini to extract structured fields from a free-form issue description."""
    api_key = get_gemini_api_key()
    url = f"{GEMINI_API_URL}/{GEMINI_MODEL}:generateContent?key={api_key}"

    prompt = f"""\
Dada a seguinte issue do GitHub, extraia as informações estruturadas.

Título: {title}
Corpo:
{body}

Retorne um objeto JSON contendo:
1. "target_files": uma lista de strings contendo caminhos de arquivos relativos mencionados ou inferidos que precisam de correção (ex: app/page.tsx).
2. "expected_behavior": o comportamento esperado.
3. "current_behavior": o comportamento atual.

Retorne APENAS o JSON no formato:
{{
  "target_files": ["caminho/do/arquivo.ts"],
  "expected_behavior": "...",
  "current_behavior": "..."
}}
"""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "target_files": {"type": "ARRAY", "items": {"type": "STRING"}},
                    "expected_behavior": {"type": "STRING"},
                    "current_behavior": {"type": "STRING"},
                },
                "required": ["target_files", "expected_behavior", "current_behavior"],
            },
        },
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        candidates = resp.json().get("candidates", [])
        if not candidates:
            raise ValueError("No candidates returned from Gemini during parsing.")
        text = candidates[0]["content"]["parts"][0]["text"]
        return json.loads(text.strip())  # type: ignore[no-any-return]

