"""J12's merge commits (spec S-001, J12, model 3.5.0's records, 2026-10-17): each merge commit's `message` and
`author { name }`, which J12's query asks for from 2026-10-17, and the asks-merge job's merges fixture.

GraphQL is not reachable from the agents' sessions, so these are built in GraphQL's answer shape from REST answers
for Service-Desk, a public repository, and are NOT as GitHub sent them. Usage, from the repository's root:

    gh api repos/shumpmaster/Service-Desk/commits/<oid> > <dir>/commit-<oid>.json    (each merged pull request's
                                                                                       merge commit in the built
                                                                                       fixture, and 21bc250)
    gh api repos/shumpmaster/Service-Desk/pulls/84 > <dir>/pull-84.json
    python3 tests/desk/tools/j12-merge-messages.py <dir>

It maps `commit.message` to `mergeCommit.message` and `commit.author.name` to `mergeCommit.author.name`, and:

- adds both to each merged node of tests/desk/fixtures/github/j12-pulls-built.json, which keeps every other field
  (that fixture's own tool, tests/desk/tools/j12-fixture.mjs, made the rest from REST answers of 2026-10-16);
- writes tests/desk/fixtures/github/j12-asks-merge.json: #84 built from pulls/84 and commits/21bc250 (real-on-real),
  then the made-up merges J12 lists (NOT real records), each node in the query's shape;
- beside every message in both files, the model's own `govlib.parse_trailers` output and the author, in the
  `model` field (outside the answer's body), with whether the model's rule (one `Merged-By: orchestrator` in the
  final trailer paragraph, author `github-actions[bot]`: asks_merge.merged_by_problems) makes it the job's.
"""
import json
import os
import sys

HERE = os.getcwd()
sys.path.insert(0, os.path.join(HERE, "governance", "checks"))
import asks_merge  # noqa: E402
import govlib  # noqa: E402

REST = sys.argv[1]
FIX = os.path.join(HERE, "tests", "desk", "fixtures", "github")


def rest(name):
    with open(os.path.join(REST, name), encoding="utf-8") as fh:
        return json.load(fh)


def verdict(message, author):
    trailers = govlib.parse_trailers(message)
    job = author == asks_merge.BOT and govlib.trailer_values(trailers, "Merged-By") == ["orchestrator"]
    return {"author": author, "parse_trailers": [list(t) for t in trailers], "job": job}


# 1. The built fixture: each merged node's merge commit gains its message and author.
path = os.path.join(FIX, "j12-pulls-built.json")
with open(path, encoding="utf-8") as fh:
    built = json.load(fh)
answer = json.loads(built["body"])
model = {}
for n in answer["data"]["repository"]["pullRequests"]["nodes"]:
    mc = n.get("mergeCommit")
    if not mc:
        continue
    c = rest("commit-%s.json" % mc["oid"])
    assert c["sha"] == mc["oid"], (c["sha"], mc["oid"])
    mc["message"] = c["commit"]["message"]
    mc["author"] = {"name": c["commit"]["author"]["name"]}
    model[str(n["number"])] = verdict(mc["message"], mc["author"]["name"])
built["body"] = json.dumps(answer)
built["note"] = ("NOT as GitHub sent it: J12's answer built in GraphQL's answer shape from REST answers for "
                 "shumpmaster/Service-Desk, 2026-10-16 (tests/desk/tools/j12-fixture.mjs says how; "
                 "tests/desk/fixtures/README.md lists it), each merge commit's message and author added on "
                 "2026-10-18 from commits/<oid> (tests/desk/tools/j12-merge-messages.py). The endCursor is made up.")
built["model"] = model
with open(path, "w", encoding="utf-8") as fh:
    fh.write(json.dumps(built, indent=1) + "\n")

# 2. The asks-merge job's merges: #84, real-on-real, then the made-up cases.
p84, c84 = rest("pull-84.json"), rest("commit-21bc250.json")
assert p84["merge_commit_sha"] == c84["sha"]
BOT = asks_merge.BOT


def node(number, title, body, merged, message, author, created=None, head=None, oid=None):
    return {"number": number, "title": title, "body": body, "state": "MERGED", "createdAt": created or merged,
            "mergedAt": merged, "closedAt": merged, "headRefName": head or "cos/made-up-%d" % number,
            "mergeCommit": {"oid": oid or ("%d" % number).rjust(40, "b"), "message": message,
                            "author": {"name": author}},
            "commits": {"nodes": [{"commit": {"statusCheckRollup": {"state": "SUCCESS"}}}]}}


def made_up(number, title, body, trailer_para, author=BOT, merged=None, extra_tail=""):
    message = "%s (#%d)\n\n%s\n\n%s%s" % (title, number, body.rstrip("\n"), trailer_para, extra_tail)
    return node(number, title, body, merged or "2026-10-17T%02d:00:00Z" % (number - 940), message, author)


TRAILERS = "Merged-By: orchestrator\nDelegation: L-0017\nMerged-Head: %s" % ("c" * 40)
FILED = ("## What this means for you\nA made-up filing for the desk's tests.\n\n"
         "Milestone: none (a made-up question filing)\n")
nodes = [
    node(84, p84["title"], p84["body"] or "", p84["merged_at"], c84["commit"]["message"], c84["commit"]["author"]["name"],
         created=p84["created_at"], head=p84["head"]["ref"], oid=c84["sha"]),
    # Not the job's: the line quoted mid-text, with an ordinary final paragraph.
    made_up(951, "A made-up merge quoting the trailer mid-text",
            FILED + "\nThe job writes this line:\n\nMerged-By: orchestrator\n\nas the last part of its own merges.\n",
            "That is all this pull request does."),
    # Not the job's: the trailer paragraph, another author.
    made_up(952, "A made-up merge by another author with the trailers", FILED, TRAILERS, author="shumpmaster"),
    # Not the job's: another value; two trailers; the trailer mixed with a line that is not one.
    made_up(953, "A made-up merge with another Merged-By value", FILED, "Merged-By: someone\nDelegation: L-0017"),
    made_up(954, "A made-up merge with two Merged-By trailers", FILED, "Merged-By: orchestrator\nMerged-By: orchestrator"),
    made_up(955, "A made-up merge whose final paragraph mixes the trailer with plain words", FILED,
            "Merged-By: orchestrator\nthis line is plain words, not a trailer"),
    # The job's: its body names MD3; a `#` comment line after the trailers; Signed-off-by with two plain lines.
    made_up(956, "A made-up job merge whose body names MD3",
            "## What this means for you\nA made-up filing.\n\nMilestone: MD3\n\n## Context\n- A fact (source: AGENTS.md)\n", TRAILERS),
    made_up(957, "A made-up job merge with a comment line after its trailers", FILED, TRAILERS, extra_tail="\n# a comment line\n"),
    made_up(958, "A made-up job merge with a Signed-off-by line and two plain lines", FILED,
            "Signed-off-by: A <a@x>\nMerged-By: orchestrator\nthis is a plain line\nso is this one"),
    # The job's, for a made-up plan line that lists it under MD3 (AC60: the plan wins).
    made_up(959, "A made-up job merge a plan line lists", FILED, TRAILERS),
]
nodes.sort(key=lambda n: n["createdAt"], reverse=True)
answer = {"data": {"repository": {"pullRequests": {"pageInfo": {"hasNextPage": False, "endCursor": "Y3Vyc29yOk1BREUtVVAtSk9C"},
                                                    "nodes": nodes}}}}
out = {
    "note": ("NOT as GitHub sent it: J12's answer for the asks-merge job's merges, in GraphQL's answer shape. #84 is "
             "built from REST answers for shumpmaster/Service-Desk (pulls/84 and commits/21bc250, 2026-10-18; "
             "real-on-real); #951 to #959 are MADE UP (tests/desk/tools/j12-merge-messages.py says each case). "
             "The endCursor is made up."),
    "status": 200, "body": json.dumps(answer),
    "model": {str(n["number"]): verdict(n["mergeCommit"]["message"], n["mergeCommit"]["author"]["name"]) for n in nodes},
}
with open(os.path.join(FIX, "j12-asks-merge.json"), "w", encoding="utf-8") as fh:
    fh.write(json.dumps(out, indent=1) + "\n")
for k, v in sorted(out["model"].items()):
    print("#%s author %s parse_trailers %r -> %s" % (k, v["author"], [tuple(t) for t in v["parse_trailers"]],
                                                     "the job's" if v["job"] else "not the job's"))
print("built fixture: %d merge commits, %d the job's" % (len(model), sum(1 for v in model.values() if v["job"])))
