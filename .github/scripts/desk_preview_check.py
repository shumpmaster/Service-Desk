#!/usr/bin/env python3
"""desk_preview_check — the production job's preview rule (spec S-001, Job `production`).

Fails unless the most recent successful `preview` job of desk-deploy deployed SHA.

  desk_preview_check.py SHA

Reads GITHUB_TOKEN (actions: read), GITHUB_REPOSITORY and GITHUB_API_URL from the
environment. It lists the latest 100 runs of desk-deploy.yml, takes each run's `preview`
job that concluded success, and compares the newest one's commit, read from the run's
title (`deploy <sha> — ...`, the workflow's run-name), with SHA.
"""
import json
import os
import re
import sys
import urllib.request

WORKFLOW = "desk-deploy.yml"
TITLE = re.compile(r"^deploy ([0-9a-f]{40})\b")


def get(url: str, token: str) -> dict:
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def main(argv: list[str]) -> int:
    if len(argv) != 1 or not re.fullmatch(r"[0-9a-f]{40}", argv[0]):
        print(__doc__, file=sys.stderr)
        return 2
    sha = argv[0]
    token = os.environ["GITHUB_TOKEN"]
    api = os.environ.get("GITHUB_API_URL", "https://api.github.com")
    repo = os.environ["GITHUB_REPOSITORY"]

    runs = get(f"{api}/repos/{repo}/actions/workflows/{WORKFLOW}/runs?per_page=100", token)
    newest = None  # (completed_at, deployed sha, run url)
    for run in runs.get("workflow_runs", []):
        match = TITLE.match(run.get("display_title") or "")
        if not match:
            continue
        jobs = get(f"{api}/repos/{repo}/actions/runs/{run['id']}/jobs?per_page=100", token)
        for job in jobs.get("jobs", []):
            if job.get("name") == "preview" and job.get("conclusion") == "success":
                done = job.get("completed_at") or ""
                if newest is None or done > newest[0]:
                    newest = (done, match.group(1), run.get("html_url", ""))

    if newest is None:
        print(f"::error::No successful preview deploy found; deploy {sha} to the preview first.")
        return 1
    if newest[1] != sha:
        print(f"::error::The latest successful preview deployed {newest[1]} ({newest[2]}), "
              f"not {sha}. Production deploys only what the preview last deployed.")
        return 1
    print(f"The latest successful preview ({newest[2]}, {newest[0]}) deployed {sha}.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
