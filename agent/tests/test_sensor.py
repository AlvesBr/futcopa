"""Tests for agent.sensor — the issue body parser."""

from __future__ import annotations

import pytest

from agent.models import IssueData
from agent.sensor import parse_issue, _parse_file_list, _parse_sections


# ── Fixtures ─────────────────────────────────────────────────────────────────

FULL_ISSUE_BODY = """\
### Target Files

- `src/app/page.tsx`
- `src/components/Header.tsx`

### Current Behavior

The page crashes with a hydration error when navigating to the home page.

### Expected Behavior

The home page should render without any errors.

### Reproduction Steps

1. Run `npm run dev`
2. Navigate to `/`
3. See error in console

### Error Logs

```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

### Additional Context

This started happening after the latest Supabase auth update.
"""

MINIMAL_ISSUE_BODY = """\
### Target Files

src/app/layout.tsx

### Current Behavior

Build fails.

### Expected Behavior

Build should succeed.
"""

EMPTY_OPTIONAL_BODY = """\
### Target Files

src/utils/helpers.ts

### Current Behavior

Function returns wrong value.

### Expected Behavior

Function should return correct value.

### Reproduction Steps

_No response_

### Error Logs

No response

### Additional Context

_No response_
"""


# ── Section parsing ──────────────────────────────────────────────────────────


class TestParseSections:
    def test_full_body_extracts_all_sections(self) -> None:
        sections = _parse_sections(FULL_ISSUE_BODY)
        assert "target files" in sections
        assert "current behavior" in sections
        assert "expected behavior" in sections
        assert "reproduction steps" in sections
        assert "error logs" in sections
        assert "additional context" in sections

    def test_empty_body_returns_empty_dict(self) -> None:
        assert _parse_sections("") == {}

    def test_no_headings_returns_empty_dict(self) -> None:
        assert _parse_sections("Just some text without headings.") == {}


# ── File list parsing ────────────────────────────────────────────────────────


class TestParseFileList:
    def test_markdown_list_with_backticks(self) -> None:
        raw = "- `src/app/page.tsx`\n- `src/components/Header.tsx`"
        result = _parse_file_list(raw)
        assert result == ["src/app/page.tsx", "src/components/Header.tsx"]

    def test_plain_paths(self) -> None:
        raw = "src/app/page.tsx\nsrc/app/layout.tsx"
        result = _parse_file_list(raw)
        assert result == ["src/app/page.tsx", "src/app/layout.tsx"]

    def test_comma_separated(self) -> None:
        raw = "src/a.ts, src/b.tsx"
        result = _parse_file_list(raw)
        assert result == ["src/a.ts", "src/b.tsx"]

    def test_empty_string_returns_empty_list(self) -> None:
        assert _parse_file_list("") == []

    def test_single_file(self) -> None:
        assert _parse_file_list("src/app/page.tsx") == ["src/app/page.tsx"]


# ── Full issue parsing ───────────────────────────────────────────────────────


class TestParseIssue:
    @pytest.mark.asyncio
    async def test_full_issue(self) -> None:
        issue = await parse_issue("Hydration error on home page", 42, FULL_ISSUE_BODY)
        assert isinstance(issue, IssueData)
        assert issue.issue_number == 42
        assert issue.title == "Hydration error on home page"
        assert len(issue.target_files) == 2
        assert "src/app/page.tsx" in issue.target_files
        assert "hydration" in issue.current_behavior.lower()
        assert issue.reproduction_steps is not None
        assert issue.error_logs is not None
        assert issue.additional_context is not None

    @pytest.mark.asyncio
    async def test_minimal_issue(self) -> None:
        issue = await parse_issue("Build fails", 10, MINIMAL_ISSUE_BODY)
        assert issue.issue_number == 10
        assert len(issue.target_files) == 1
        assert issue.target_files[0] == "src/app/layout.tsx"
        assert issue.reproduction_steps is None
        assert issue.error_logs is None
        assert issue.additional_context is None

    @pytest.mark.asyncio
    async def test_empty_optional_fields(self) -> None:
        issue = await parse_issue("Wrong return value", 5, EMPTY_OPTIONAL_BODY)
        assert issue.reproduction_steps is None
        assert issue.error_logs is None
        assert issue.additional_context is None

    @pytest.mark.asyncio
    async def test_empty_body(self) -> None:
        issue = await parse_issue("Empty issue", 1, "")
        assert issue.target_files == []
        assert issue.expected_behavior == ""

    @pytest.mark.asyncio
    async def test_none_body(self) -> None:
        issue = await parse_issue("None body", 2, None)  # type: ignore[arg-type]
        assert issue.target_files == []


# ── Portuguese headings ──────────────────────────────────────────────────────


class TestPortugueseHeadings:
    @pytest.mark.asyncio
    async def test_portuguese_sections(self) -> None:
        body = """\
### Arquivos Alvo

src/app/page.tsx

### Comportamento Atual

A página não carrega.

### Comportamento Esperado

A página deveria carregar normalmente.

### Passos para Reproduzir

1. Abrir o site
2. Ver erro

### Logs de Erro

TypeError: Cannot read properties of undefined

### Contexto Adicional

Nenhum contexto extra.
"""
        issue = await parse_issue("Página não carrega", 99, body)
        assert len(issue.target_files) == 1
        assert "não carrega" in issue.current_behavior
        assert issue.reproduction_steps is not None
        assert issue.error_logs is not None
