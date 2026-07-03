"""Tests for agent.loop — the main control loop with mocked dependencies."""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from agent.models import AttemptRecord, FileChange, IssueData, TestResult
from agent.loop import run_fix_loop, _read_local_files


# ── Fixtures ─────────────────────────────────────────────────────────────────


def _make_issue(**overrides: Any) -> IssueData:
    defaults = {
        "title": "Test issue",
        "issue_number": 1,
        "target_files": ["src/app/page.tsx"],
        "expected_behavior": "Should work",
        "current_behavior": "Does not work",
    }
    defaults.update(overrides)
    return IssueData(**defaults)


def _make_patches() -> list[FileChange]:
    return [
        FileChange(
            filename="src/app/page.tsx",
            content='export default function Page() { return <div>Fixed</div>; }',
        )
    ]


def _success_result() -> TestResult:
    return TestResult(passed=True, command="all", stdout="OK", stderr="", exit_code=0)


def _failure_result(cmd: str = "typecheck: npx tsc --noEmit") -> TestResult:
    return TestResult(
        passed=False,
        command=cmd,
        stdout="",
        stderr="Type error found",
        exit_code=1,
    )


# ── _read_local_files ───────────────────────────────────────────────────────


class TestReadLocalFiles:
    def test_reads_existing_files(self, tmp_path: Path) -> None:
        target = tmp_path / "src" / "app" / "page.tsx"
        target.parent.mkdir(parents=True)
        target.write_text("const x = 1;", encoding="utf-8")

        result = _read_local_files(["src/app/page.tsx"], repo_root=tmp_path)
        assert result == {"src/app/page.tsx": "const x = 1;"}

    def test_missing_file_returns_empty(self, tmp_path: Path) -> None:
        result = _read_local_files(["nonexistent.ts"], repo_root=tmp_path)
        assert result == {}


# ── run_fix_loop ─────────────────────────────────────────────────────────────


class TestRunFixLoop:
    """Tests for the main control loop with fully mocked I/O."""

    @pytest.mark.asyncio
    async def test_success_on_first_attempt(self, tmp_path: Path) -> None:
        # Set up a target file on disk
        target = tmp_path / "src" / "app" / "page.tsx"
        target.parent.mkdir(parents=True)
        target.write_text("// old content", encoding="utf-8")

        issue = _make_issue()
        patches = _make_patches()

        with (
            patch("agent.loop.Path.cwd", return_value=tmp_path),
            patch("agent.loop.ask_gemini", new_callable=AsyncMock, return_value=patches),
            patch("agent.loop.run_tests", new_callable=AsyncMock, return_value=_success_result()),
        ):
            success, result_patches = await run_fix_loop(issue)

        assert success is True
        assert len(result_patches) == 1
        assert result_patches[0].filename == "src/app/page.tsx"

    @pytest.mark.asyncio
    async def test_failure_then_success(self, tmp_path: Path) -> None:
        target = tmp_path / "src" / "app" / "page.tsx"
        target.parent.mkdir(parents=True)
        target.write_text("// old content", encoding="utf-8")

        issue = _make_issue()
        patches = _make_patches()

        call_count = 0

        async def mock_run_tests() -> TestResult:
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return _failure_result()
            return _success_result()

        with (
            patch("agent.loop.Path.cwd", return_value=tmp_path),
            patch("agent.loop.ask_gemini", new_callable=AsyncMock, return_value=patches),
            patch("agent.loop.run_tests", side_effect=mock_run_tests),
        ):
            success, result_patches = await run_fix_loop(issue)

        assert success is True
        assert call_count == 2

    @pytest.mark.asyncio
    async def test_all_attempts_fail(self, tmp_path: Path) -> None:
        target = tmp_path / "src" / "app" / "page.tsx"
        target.parent.mkdir(parents=True)
        target.write_text("// old content", encoding="utf-8")

        issue = _make_issue()
        patches = _make_patches()

        with (
            patch("agent.loop.Path.cwd", return_value=tmp_path),
            patch("agent.loop.ask_gemini", new_callable=AsyncMock, return_value=patches),
            patch("agent.loop.run_tests", new_callable=AsyncMock, return_value=_failure_result()),
            patch("agent.loop.MAX_RETRIES", 2),
        ):
            success, result_patches = await run_fix_loop(issue)

        assert success is False

    @pytest.mark.asyncio
    async def test_no_target_files_aborts(self, tmp_path: Path) -> None:
        issue = _make_issue(target_files=["nonexistent.ts"])

        with patch("agent.loop.Path.cwd", return_value=tmp_path):
            success, result_patches = await run_fix_loop(issue)

        assert success is False
        assert result_patches == []

    @pytest.mark.asyncio
    async def test_gemini_error_is_recorded(self, tmp_path: Path) -> None:
        target = tmp_path / "src" / "app" / "page.tsx"
        target.parent.mkdir(parents=True)
        target.write_text("// old content", encoding="utf-8")

        issue = _make_issue()

        with (
            patch("agent.loop.Path.cwd", return_value=tmp_path),
            patch(
                "agent.loop.ask_gemini",
                new_callable=AsyncMock,
                side_effect=RuntimeError("API down"),
            ),
            patch("agent.loop.MAX_RETRIES", 1),
        ):
            success, result_patches = await run_fix_loop(issue)

        assert success is False
        assert result_patches == []

    @pytest.mark.asyncio
    async def test_file_restored_after_test_failure(self, tmp_path: Path) -> None:
        target = tmp_path / "src" / "app" / "page.tsx"
        target.parent.mkdir(parents=True)
        original = "// original content"
        target.write_text(original, encoding="utf-8")

        issue = _make_issue()
        patches = _make_patches()

        with (
            patch("agent.loop.Path.cwd", return_value=tmp_path),
            patch("agent.loop.ask_gemini", new_callable=AsyncMock, return_value=patches),
            patch("agent.loop.run_tests", new_callable=AsyncMock, return_value=_failure_result()),
            patch("agent.loop.MAX_RETRIES", 1),
        ):
            await run_fix_loop(issue)

        # File should be restored to original content
        assert target.read_text(encoding="utf-8") == original
