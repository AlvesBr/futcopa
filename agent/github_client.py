"""GitHub API client — branches, commits (Git Data API), PRs, and comments."""

from __future__ import annotations

import base64
import logging
from typing import Any

import httpx

from agent.config import REPO_FULL_NAME, get_github_token
from agent.models import FileChange

logger = logging.getLogger(__name__)

_API_BASE = "https://api.github.com"
_ACCEPT = "application/vnd.github+json"
_API_VERSION = "2022-11-28"


def _headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {get_github_token()}",
        "Accept": _ACCEPT,
        "X-GitHub-Api-Version": _API_VERSION,
    }


def _repo_url(path: str = "") -> str:
    return f"{_API_BASE}/repos/{REPO_FULL_NAME}{path}"


# ── Branch helpers ───────────────────────────────────────────────────────────


async def branch_exists(name: str) -> bool:
    """Return ``True`` if branch *name* exists in the remote repo."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            _repo_url(f"/git/ref/heads/{name}"),
            headers=_headers(),
        )
        return resp.status_code == 200


async def _get_ref_sha(ref: str = "heads/main") -> str:
    """Return the commit SHA pointed to by *ref*."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            _repo_url(f"/git/ref/{ref}"),
            headers=_headers(),
        )
        resp.raise_for_status()
        return resp.json()["object"]["sha"]  # type: ignore[no-any-return]


async def create_branch(name: str, from_ref: str = "main") -> None:
    """Create a new branch *name* pointing at the tip of *from_ref*."""
    sha = await _get_ref_sha(f"heads/{from_ref}")
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            _repo_url("/git/refs"),
            headers=_headers(),
            json={"ref": f"refs/heads/{name}", "sha": sha},
        )
        resp.raise_for_status()
    logger.info("Created branch %s at %s", name, sha[:8])


# ── Git Data API — blobs / trees / commits ───────────────────────────────────


async def commit_and_push(
    branch: str,
    patches: list[FileChange],
    message: str,
) -> None:
    """Create a commit on *branch* with the given file changes using the Git Data API.

    Steps:
    1. Get the current commit SHA and tree SHA of the branch.
    2. Create blobs for each changed file.
    3. Create a new tree with the blobs.
    4. Create a commit pointing to the new tree.
    5. Update the branch ref to point to the new commit.
    """
    async with httpx.AsyncClient(timeout=60) as client:
        hdrs = _headers()

        # 1. Current commit & tree
        base_sha = await _get_ref_sha(f"heads/{branch}")
        commit_resp = await client.get(
            _repo_url(f"/git/commits/{base_sha}"),
            headers=hdrs,
        )
        commit_resp.raise_for_status()
        base_tree_sha: str = commit_resp.json()["tree"]["sha"]

        # 2. Create blobs
        tree_items: list[dict[str, str]] = []
        for patch in patches:
            blob_resp = await client.post(
                _repo_url("/git/blobs"),
                headers=hdrs,
                json={
                    "content": base64.b64encode(patch.content.encode("utf-8")).decode("ascii"),
                    "encoding": "base64",
                },
            )
            blob_resp.raise_for_status()
            blob_sha: str = blob_resp.json()["sha"]
            tree_items.append(
                {
                    "path": patch.filename,
                    "mode": "100644",
                    "type": "blob",
                    "sha": blob_sha,
                }
            )
            logger.debug("Created blob for %s → %s", patch.filename, blob_sha[:8])

        # 3. Create tree
        tree_resp = await client.post(
            _repo_url("/git/trees"),
            headers=hdrs,
            json={"base_tree": base_tree_sha, "tree": tree_items},
        )
        tree_resp.raise_for_status()
        new_tree_sha: str = tree_resp.json()["sha"]

        # 4. Create commit
        commit_create_resp = await client.post(
            _repo_url("/git/commits"),
            headers=hdrs,
            json={
                "message": message,
                "tree": new_tree_sha,
                "parents": [base_sha],
            },
        )
        commit_create_resp.raise_for_status()
        new_commit_sha: str = commit_create_resp.json()["sha"]

        # 5. Update ref
        ref_resp = await client.patch(
            _repo_url(f"/git/refs/heads/{branch}"),
            headers=hdrs,
            json={"sha": new_commit_sha},
        )
        ref_resp.raise_for_status()

    logger.info(
        "Committed %d file(s) to %s — %s",
        len(patches),
        branch,
        new_commit_sha[:8],
    )


# ── Pull Requests & Comments ────────────────────────────────────────────────


async def create_pull_request(
    branch: str,
    issue_number: int,
    title: str,
    body: str,
) -> str:
    """Create a PR from *branch* → main and return the HTML URL."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            _repo_url("/pulls"),
            headers=_headers(),
            json={
                "title": title,
                "head": branch,
                "base": "main",
                "body": body,
            },
        )
        resp.raise_for_status()
        pr_url: str = resp.json()["html_url"]
    logger.info("Created PR: %s", pr_url)
    return pr_url


async def comment_issue(issue_number: int, body: str) -> None:
    """Post a comment on issue *issue_number*."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            _repo_url(f"/issues/{issue_number}/comments"),
            headers=_headers(),
            json={"body": body},
        )
        resp.raise_for_status()
    logger.info("Commented on issue #%d", issue_number)


async def read_file_content(path: str, ref: str = "main") -> str:
    """Read the UTF-8 content of a file from the repo via the Contents API."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            _repo_url(f"/contents/{path}"),
            headers=_headers(),
            params={"ref": ref},
        )
        resp.raise_for_status()
        data: dict[str, Any] = resp.json()

    encoded: str = data.get("content", "")
    return base64.b64decode(encoded).decode("utf-8")


async def get_issue_data(issue_number: int) -> dict[str, Any]:
    """Retrieve details of *issue_number* (title and body)."""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(
            _repo_url(f"/issues/{issue_number}"),
            headers=_headers(),
        )
        resp.raise_for_status()
        return resp.json()  # type: ignore[no-any-return]

