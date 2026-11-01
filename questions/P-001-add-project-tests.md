# Ruling needed: The desk's own tests break when a third project is added. How should that be fixed so Model-Lab can go on the desk?

Milestone: none (a defect found in running the graduated desk; it serves no open milestone)
Asked in session: session_01QBwHGJH9m3A4Ray7WpHzBo

WHY: You asked for Model-Lab on the desk. Adding it is meant to be one line in the desk's settings file and nothing else. The Builder made that one-line change, and the desk builds and works with it, but 50 of the desk's own tests then fail. They were written to expect exactly today's two projects: three pin the project list, and 47 build their test pages from the live settings file, while their stand-in for GitHub answers only for the two projects they know. So every future "add a project" job will hit the same wall. Nothing is live or broken for you today; Model-Lab just can't be added until this is settled.
OPTIONS:
  A. Fix the tests, then add Model-Lab — the check author (who writes tests and never sees the desk's code) makes the tests use their own fixed set of projects instead of the live settings file, and adds Model-Lab's row where the list is pinned; the Reviewer checks it; then the one-line settings change lands as planned. What the desk promises (adding a project is one line) is unchanged. Treated as checks found wrong, which is logged and needs your approval, and counts as no one's failure. About an hour of agent work; your time: this answer, then one verdict and merge, and the usual two deploy approvals.
  B. A small Discovery for the desk — the full route the model uses for new work on a graduated product: a brief, research if needed, and your Design gate before anything changes. Slower: a day or more, and several more asks.
  C. Leave Model-Lab off the desk for now — nothing changes; Model-Lab's work shows only on GitHub until this is fixed later.
RECOMMENDATION: A — the desk's promise is right and its tests are what's wrong; this is the shortest route the model allows for checks found wrong, and it fixes every future project addition too.
RISK CLASS: R3   REVERSIBILITY: reversible   BLAST RADIUS: the desk's tests; the desk itself gains one project tile
DEFAULT: none (a change to tests is the owner's)   TIMEOUT: none

## Context
- Adding a project is "one entry in the desk's settings file and one repository added to the read token; nothing else changes" (source: docs/handover/desk-operations.md, "Adding a project")
- With the Model-Lab entry the build passes, and 50 of 1,568 tests fail; on unchanged main the same test files pass 206 of 206 (source: the Builder's return of 2026-11-01, branch build/builder/add-model-lab, uncommitted)
- Three assertions pin the two-project list: tests/desk/j7-config.test.mjs lines 23-25 and 93, tests/desk/j23-versions.test.mjs line 138; the other 47 failures come from tests/desk/helpers.mjs lines 22 and 31 reading the live settings file (source: the same return)
- Feedback routing: criteria or checks wrong go back to stage 3 or 4; "Criteria were wrong" is not a strike, is logged, and needs the owner's approval (source: Personal-Org-Operating-Model OPERATING_MODEL.md §4, "Feedback routing")
- R3 changes include tests and are the owner's (source: Personal-Org-Operating-Model OPERATING_MODEL.md §2)
