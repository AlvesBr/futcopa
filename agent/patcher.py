"""File patcher — backup, apply, and restore file mutations."""

from __future__ import annotations

import logging
from pathlib import Path

from agent.models import FileChange

logger = logging.getLogger(__name__)


def backup_files(files: list[str], repo_root: Path | None = None) -> dict[str, str | None]:
    """Read and return the original contents of *files*.

    Parameters
    ----------
    files:
        Paths relative to the repo root.
    repo_root:
        Absolute path to the repository root.  Defaults to ``cwd``.

    Returns
    -------
    dict mapping each relative path to its original content (or None if it didn't exist).
    """
    root = repo_root or Path.cwd()
    backups: dict[str, str | None] = {}
    for rel_path in files:
        abs_path = root / rel_path
        if abs_path.is_file():
            backups[rel_path] = abs_path.read_text(encoding="utf-8")
            logger.debug("Backed up %s (%d bytes)", rel_path, len(backups[rel_path]))
        else:
            backups[rel_path] = None
            logger.debug("Backed up %s as None (does not exist)", rel_path)
    return backups


def apply_patches(
    patches: list[FileChange],
    repo_root: Path | None = None,
) -> None:
    """Write each :class:`FileChange` to disk.

    Creates parent directories if they do not exist.
    """
    root = repo_root or Path.cwd()
    for patch in patches:
        abs_path = root / patch.filename
        abs_path.parent.mkdir(parents=True, exist_ok=True)
        abs_path.write_text(patch.content, encoding="utf-8")
        logger.info("Patched %s (%d bytes)", patch.filename, len(patch.content))


def restore_files(
    backups: dict[str, str | None],
    repo_root: Path | None = None,
) -> None:
    """Restore files from *backups* created by :func:`backup_files`.

    If a file was not in the backup (i.e. it was newly created by a patch),
    it will be deleted.
    """
    root = repo_root or Path.cwd()
    for rel_path, content in backups.items():
        abs_path = root / rel_path
        if content is None:
            if abs_path.is_file():
                abs_path.unlink()
                logger.debug("Deleted new file %s", rel_path)
        else:
            abs_path.write_text(content, encoding="utf-8")
            logger.debug("Restored %s", rel_path)

