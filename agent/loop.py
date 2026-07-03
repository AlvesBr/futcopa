"""Main control loop — iterates fix attempts until tests pass or retries exhaust."""

from __future__ import annotations

import logging
from pathlib import Path

from agent.config import MAX_RETRIES
from agent.gemini_client import ask_gemini
from agent.models import AttemptRecord, FileChange, IssueData
from agent.patcher import apply_patches, backup_files, restore_files
from agent.runner import run_tests

logger = logging.getLogger(__name__)


def _read_local_files(paths: list[str], repo_root: Path | None = None) -> dict[str, str]:
    """Read file contents from the local checkout (Actions runner)."""
    root = repo_root or Path.cwd()
    contents: dict[str, str] = {}
    for rel in paths:
        abs_path = root / rel
        if abs_path.is_file():
            contents[rel] = abs_path.read_text(encoding="utf-8")
            logger.debug("Read %s (%d bytes)", rel, len(contents[rel]))
        else:
            logger.warning("Target file %s not found on disk", rel)
    return contents


async def run_fix_loop(issue: IssueData) -> tuple[bool, list[FileChange]]:
    """Attempt to fix the issue up to :data:`MAX_RETRIES` times.

    Returns
    -------
    (success, patches):
        *success* is ``True`` when all tests pass after applying patches.
        *patches* contains the last set of file changes (useful for creating the PR).
    """
    file_contents = _read_local_files(issue.target_files)

    if not file_contents:
        logger.error("No target files could be read — aborting loop")
        return False, []

    error_history: list[AttemptRecord] = []
    last_patches: list[FileChange] = []

    for attempt in range(1, MAX_RETRIES + 1):
        logger.info("═══ Attempt %d / %d ═══", attempt, MAX_RETRIES)

        # 1. Ask Gemini
        try:
            patches = await ask_gemini(issue, file_contents, error_history or None)
        except Exception as exc:
            logger.error("Gemini call failed on attempt %d: %s", attempt, exc)
            error_history.append(
                AttemptRecord(attempt=attempt, patches=[], error_log=str(exc))
            )
            continue

        if not patches:
            logger.warning("Gemini returned no patches on attempt %d", attempt)
            error_history.append(
                AttemptRecord(
                    attempt=attempt,
                    patches=[],
                    error_log="Gemini returned an empty patch set.",
                )
            )
            continue

        last_patches = patches

        # 2. Backup
        affected_paths = [p.filename for p in patches]
        backups = backup_files(affected_paths)

        # 3. Apply
        try:
            apply_patches(patches)
        except Exception as exc:
            logger.error("Patch application failed: %s", exc)
            restore_files(backups)
            error_history.append(
                AttemptRecord(
                    attempt=attempt,
                    patches=patches,
                    error_log=f"Patch application error: {exc}",
                )
            )
            continue

        # 4. Test
        result = await run_tests()

        if result.passed:
            logger.info("✅ Tests passed on attempt %d!", attempt)
            return True, patches

        # 5. Failed — restore and record
        logger.warning(
            "❌ Tests failed on attempt %d — %s (exit %d)",
            attempt,
            result.command,
            result.exit_code,
        )
        restore_files(backups)

        error_log = (
            f"Command: {result.command}\n"
            f"Exit code: {result.exit_code}\n"
            f"stdout:\n{result.stdout[-2000:]}\n"
            f"stderr:\n{result.stderr[-2000:]}"
        )
        error_history.append(
            AttemptRecord(attempt=attempt, patches=patches, error_log=error_log)
        )

    logger.error("All %d attempts exhausted — fix loop failed", MAX_RETRIES)
    return False, last_patches
