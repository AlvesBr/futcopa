"""Pydantic models shared across the agent."""

from __future__ import annotations

from pydantic import BaseModel, Field


class IssueData(BaseModel):
    """Structured representation of a parsed GitHub Issue."""

    title: str
    issue_number: int
    target_files: list[str] = Field(default_factory=list)
    expected_behavior: str = ""
    current_behavior: str = ""
    reproduction_steps: str | None = None
    error_logs: str | None = None
    additional_context: str | None = None


class FileChange(BaseModel):
    """A single file mutation produced by the LLM."""

    filename: str
    content: str


class TestResult(BaseModel):
    """Outcome of running the test pipeline."""

    __test__ = False

    passed: bool
    command: str
    stdout: str = ""
    stderr: str = ""
    exit_code: int = 0


class AttemptRecord(BaseModel):
    """Record of a single fix attempt for error-history feedback."""

    attempt: int
    patches: list[FileChange] = Field(default_factory=list)
    error_log: str = ""
