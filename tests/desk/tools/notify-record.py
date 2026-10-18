"""Record the REST answers J16's and J20's tests read (spec S-001; 2026-10-18), once, as J12's are recorded.

    python3 tests/desk/tools/notify-record.py tests/desk/fixtures/github      (from the repository's root)

Service-Desk is public. Each answer is read with `gh api -i <path>` and kept in the form of the other files in
tests/desk/fixtures/github/: { note, status, headers (the ones the readers use), body (exactly as sent) }.
"""
import json
import os
import subprocess
import sys

OUT = sys.argv[1]
REPO = "shumpmaster/Service-Desk"
WANT = [
    ("notify-pulls-open.json", "repos/%s/pulls?state=open&per_page=100" % REPO),
    ("notify-pulls-recent.json", "repos/%s/pulls?state=all&per_page=8" % REPO),
    ("notify-pull-107-files.json", "repos/%s/pulls/107/files?per_page=100" % REPO),
    ("notify-pull-108-files.json", "repos/%s/pulls/108/files?per_page=100" % REPO),
    ("notify-pull-84-files.json", "repos/%s/pulls/84/files?per_page=100" % REPO),
]
KEEP = ("content-type", "etag", "link", "x-ratelimit-remaining", "x-ratelimit-reset")
for name, path in WANT:
    raw = subprocess.run(["gh", "api", "-i", path], check=True, capture_output=True).stdout.decode("utf-8")
    head, _, body = raw.replace("\r\n", "\n").partition("\n\n")
    lines = head.split("\n")
    status = int(lines[0].split()[1])
    headers = {}
    for l in lines[1:]:
        k, _, v = l.partition(":")
        if k.strip().lower() in KEEP:
            headers[k.strip().lower()] = v.strip()
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
        json.dump({"note": "GET /%s, recorded 2026-10-18 with gh api" % path, "status": status, "headers": headers, "body": body},
                  fh, indent=1, ensure_ascii=False)
        fh.write("\n")
    print("%s: %d, %d bytes" % (name, status, len(body)))
