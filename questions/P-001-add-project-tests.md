# Ruling needed: The desk's own tests break when a third project is added. Which route should fix them, so Model-Lab can go on the desk?

Milestone: none (a defect found in running the graduated desk; it serves no open milestone)
Asked in session: session_01QBwHGJH9m3A4Ray7WpHzBo

WHY: You asked for Model-Lab on the desk. Adding a project is meant to be one line in the desk's settings and nothing else. The Builder made that one-line change and reports the desk still builds, but 50 of the desk's own automatic tests then fail, because they were written to expect exactly the two projects the desk shows today. So every future project addition would hit the same wall. Nothing is broken for you today. Changing the tests of a desk that has already graduated is your ruling, and the model's rule points to the slower route.
OPTIONS:
  A. An exception: fix the tests directly, then add Model-Lab — the agent that writes tests, without seeing the desk's code, makes them use their own fixed list of example projects and adds Model-Lab where the list is written out; the Reviewer checks it; then the one-line change lands. The model does not provide this route for a graduated product: choosing A approves it as an exception, logged like the four routine settings jobs you approved after launch, and sets a precedent for fixing a graduated product's tests without a Discovery. About an hour of agent work (an estimate); your time: this answer, one verdict and merge, and two deploy approvals.
  B. The model's route: a small Discovery for the desk — new work on a graduated product that changes its tests goes through a small Discovery scaled to its size, with your gate before anything changes. It fits the rules exactly and leaves the full record. Slower: likely a day or more and a few more questions (an estimate).
  C. Leave Model-Lab off the desk for now — nothing changes today; Model-Lab shows only on GitHub, and the problem stays: every future project addition hits the same 50 failures, and the promise that adding a project is one line stays untrue.
RECOMMENDATION: A — it is the shortest route and fixes every future addition too; it needs your ruling because the model's rule for a graduated product (B) points to a small Discovery for anything that changes its tests.
RISK CLASS: R3   REVERSIBILITY: reversible   BLAST RADIUS: the desk's tests and one new project tile, going live through your two deploy approvals; under A, a precedent for later fixes
DEFAULT: none (R3 never defaults)   TIMEOUT: none

## Context
- Adding a project is "one entry in the desk's settings file and one repository added to the read token; nothing else changes" (source: docs/handover/desk-operations.md, "Adding a project")
- After launch, only four settings jobs stay as running the desk; "Anything else is new work: a defect fix goes through a short Design of its own, and an addition through a small Discovery" (source: docs/handover/desk-operations.md, lines 60-61; docs/LEDGER.md, L-0020)
- A graduated product's fix "whose fix would change or add a criterion or contradict a locked check, starts a new Discovery, scaled to its size. The Chief of Staff proposes which, and the owner approves." (source: Personal-Org-Operating-Model OPERATING_MODEL.md §3, "Graduation and re-entry")
- The tests write out the two-project list (tests/desk/j7-config.test.mjs lines 23-25 and 93; tests/desk/j23-versions.test.mjs line 137) and build their configuration from the desk's settings file (tests/desk/helpers.mjs lines 22 and 31) (source: those files)
- The Builder's report in this session, not yet in any record: with the Model-Lab line the build passes and 50 of 1,568 tests fail; the same test files pass 206 of 206 without it (source: the Builder's return of 2026-11-01; its change is uncommitted on branch build/builder/add-model-lab)
- Tests are R3 changes, which are the owner's (source: Personal-Org-Operating-Model OPERATING_MODEL.md §2)
