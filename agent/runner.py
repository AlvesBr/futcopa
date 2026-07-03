"""Test runner — executes typecheck, jest, and build sequentially."""

from __future__ import annotations

import asyncio
import logging

from agent.config import TEST_COMMANDS, TEST_TIMEOUT
from agent.models import TestResult

logger = logging.getLogger(__name__)


async def run_tests() -> TestResult:
    """Execute each command in :data:`TEST_COMMANDS` sequentially.

    Stops on the first failure and returns a :class:`TestResult` describing it.
    If all commands pass, returns a successful result.
    """
    for label, cmd in TEST_COMMANDS:
        logger.info("Running test step: %s → %s", label, cmd)
        try:
            proc = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(),
                timeout=TEST_TIMEOUT,
            )

            stdout = stdout_bytes.decode("utf-8", errors="replace")
            stderr = stderr_bytes.decode("utf-8", errors="replace")
            exit_code = proc.returncode or 0

            if exit_code != 0:
                logger.error(
                    "Test step %s FAILED (exit %d)\nstderr: %s",
                    label,
                    exit_code,
                    stderr[:500],
                )
                return TestResult(
                    passed=False,
                    command=f"{label}: {cmd}",
                    stdout=stdout,
                    stderr=stderr,
                    exit_code=exit_code,
                )

            logger.info("Test step %s PASSED", label)

        except asyncio.TimeoutError:
            logger.error("Test step %s TIMED OUT after %ds", label, TEST_TIMEOUT)
            return TestResult(
                passed=False,
                command=f"{label}: {cmd}",
                stdout="",
                stderr=f"Command timed out after {TEST_TIMEOUT}s",
                exit_code=-1,
            )
        except OSError as exc:
            logger.error("Test step %s raised OSError: %s", label, exc)
            return TestResult(
                passed=False,
                command=f"{label}: {cmd}",
                stdout="",
                stderr=str(exc),
                exit_code=-2,
            )

    logger.info("All test steps passed ✓")
    return TestResult(
        passed=True,
        command="all",
        stdout="All test steps passed.",
        stderr="",
        exit_code=0,
    )
