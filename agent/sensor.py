"""Issue body parser — extracts structured data from GitHub Issue Forms."""

from __future__ import annotations

import logging
import re

from agent.models import IssueData

logger = logging.getLogger(__name__)

# ── Section heading → IssueData field mapping ────────────────────────────────
_SECTION_MAP: dict[str, str] = {
    "arquivos alvo": "target_files",
    "target files": "target_files",
    "arquivos afetados": "target_files",
    "affected files": "target_files",
    "comportamento esperado": "expected_behavior",
    "expected behavior": "expected_behavior",
    "comportamento atual": "current_behavior",
    "current behavior": "current_behavior",
    "passos para reproduzir": "reproduction_steps",
    "reproduction steps": "reproduction_steps",
    "steps to reproduce": "reproduction_steps",
    "logs de erro": "error_logs",
    "error logs": "error_logs",
    "error log": "error_logs",
    "contexto adicional": "additional_context",
    "additional context": "additional_context",
}

_HEADING_RE = re.compile(r"^###\s+(.+)$", re.MULTILINE)


def _parse_sections(body: str) -> dict[str, str]:
    """Split an issue body by ``### Heading`` markers and return a dict."""
    headings = list(_HEADING_RE.finditer(body))
    if not headings:
        return {}

    sections: dict[str, str] = {}
    for idx, match in enumerate(headings):
        heading = match.group(1).strip().lower()
        start = match.end()
        end = headings[idx + 1].start() if idx + 1 < len(headings) else len(body)
        content = body[start:end].strip()
        # Remove "No response" / "_No response_" placeholders
        if content.lower().replace("_", "").replace("*", "") in ("no response", "n/a", ""):
            content = ""
        sections[heading] = content

    return sections


def _parse_file_list(raw: str) -> list[str]:
    """Extract a list of file paths from free-form text.

    Accepts:
    - One path per line  (``src/app/page.tsx``)
    - Comma-separated    (``src/a.ts, src/b.ts``)
    - Markdown list       (``- src/a.ts``)
    - Backtick-wrapped    (`` `src/a.ts` ``)
    """
    if not raw:
        return []

    # Remove markdown list markers and backticks
    cleaned = re.sub(r"^[\s\-*]+", "", raw, flags=re.MULTILINE)
    cleaned = cleaned.replace("`", "")

    # Split by commas or newlines
    parts = re.split(r"[,\n]+", cleaned)
    files: list[str] = []
    for part in parts:
        part = part.strip()
        if part and "/" in part or part.endswith((".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".mjs", ".cjs")):
            files.append(part)
    return files


async def parse_issue(
    title: str,
    issue_number: int,
    body: str,
) -> IssueData:
    """Parse a GitHub Issue body (Issue Forms format) into an :class:`IssueData`.

    Missing optional sections are silently set to ``None`` / empty values.
    Falls back to Gemini parsing if target files are not found via regex.
    """
    logger.info("Parsing issue #%d: %s", issue_number, title)

    sections = _parse_sections(body or "")
    logger.debug("Detected sections: %s", list(sections.keys()))

    # Map sections → fields
    fields: dict[str, str | list[str] | None] = {}
    for heading, content in sections.items():
        field_name = _SECTION_MAP.get(heading)
        if field_name is None:
            logger.debug("Ignoring unknown section %r", heading)
            continue
        if field_name == "target_files":
            fields[field_name] = _parse_file_list(content)
        else:
            fields[field_name] = content or None

    target_files = fields.get("target_files", []) or []
    expected_behavior = fields.get("expected_behavior") or ""
    current_behavior = fields.get("current_behavior") or ""

    # Check if target files were found, otherwise fall back to LLM parsing
    if not target_files:
        logger.info("Regex parsing returned no target files. Falling back to Gemini LLM parsing...")
        try:
            from agent.gemini_client import parse_issue_text
            extracted = await parse_issue_text(title, body or "")
            target_files = extracted.get("target_files", [])
            expected_behavior = expected_behavior or extracted.get("expected_behavior") or ""
            current_behavior = current_behavior or extracted.get("current_behavior") or ""
            logger.info("Gemini LLM successfully extracted target files: %s", target_files)
        except Exception as exc:
            logger.error("Failed to parse issue via Gemini: %s", exc)

    issue = IssueData(
        title=title,
        issue_number=issue_number,
        target_files=target_files,  # type: ignore[arg-type]
        expected_behavior=expected_behavior,  # type: ignore[arg-type]
        current_behavior=current_behavior,  # type: ignore[arg-type]
        reproduction_steps=fields.get("reproduction_steps"),  # type: ignore[arg-type]
        error_logs=fields.get("error_logs"),  # type: ignore[arg-type]
        additional_context=fields.get("additional_context"),  # type: ignore[arg-type]
    )

    logger.info(
        "Parsed issue: %d target file(s), expected_behavior=%s chars",
        len(issue.target_files),
        len(issue.expected_behavior),
    )
    return issue
