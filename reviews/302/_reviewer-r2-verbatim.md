# PR #302 — the Reviewer's confirmation review, round 2 (verbatim)

*Reviewer subagent, in the Chief of Staff's session session_01QBwHGLbgYHaUscbaU5paSC, 2026-11-05, on 6c25aba.*

Verdict: FAIL

Round 2 on PR #302 at 6c25aba. All three round-1 fixes hold: B1, B2 and B3 are closed. It still fails, because the new text cites two records that are not there: one ledger citation and one Tasks citation. Each needs only a small fix.

**Round 1 findings, rechecked**

- **B1 (paragraph length): fixed.** The paragraph is 146 words. `governance_checks.py pr-body` on the current body gives `OK: pr-body check passed`. GitHub's latest pr-body run on 6c25aba passed; two earlier runs on that head failed, presumably on earlier versions of the body.
- **B2 (the Context bullet): fixed.** The bullet now names the local `trace` and `merges` failures, says why they happen, and says CI passes both. That matches what I reproduced.
- **B3 (no ledger entry): fixed.**
  - L-0022 is appended at the end of docs/LEDGER.md and has every field.
  - Its register row is in docs/IMPROVEMENT_REGISTER.md.
  - `digest.py check` gives `OK: docs/DIGEST.md and 2 scope pack(s) match docs/LEDGER.md`.
  - Both new commits are by the orchestrator, in its docs/** and reviews/** lane. `surface_guard diff --range ec9e1f5..6c25aba --branch orch/model-3.7.0-sync` gives `OK: 4 commit(s)`.
  - On a simulated GitHub merge ref, `check_all` fails only `review_check pr 302` (the verdicts still to come) and the local `trace` failure from the shallow clone, the same as round 1.
- **The round 1 record is verbatim.** reviews/302/_reviewer-r1-verbatim.md matches my round 1 return word for word, under its one header line.
- **The notes:**
  - N7 is fixed: P-004 is now "the home-screen widget".
  - N5 is fixed in part: the four edits are now named. Where the work went fails, as B2 below.
  - N8 is carried into L-0022's licenses_next (the design-reviewer pack line, in a later change).
  - Q1 (no 3.6.0 ledger entry) is still unanswered and is not blocking.

**New blocking findings**

B1. L-0022 cites a record that is on neither main nor this branch.
- Its licenses_next says "P-003's plan is rewritten as docs/projects/P-003.md (decisions/questions/P-003-plan-place.md)".
- That file is absent from origin/main and origin/orch/model-3.7.0-sync (`git cat-file -e` fails on both). It exists only on branch cos/handoff-p002-10 (commit 27f123b, "The owner's unasked ruling: P-003 gets a plan of its own…").
- No pull request is open for that branch (`gh api pulls?head=shumpmaster:cos/handoff-p002-10&state=all` returns nothing).
- The ledger is append-only. If #302 merges first, the dangling citation stays, and correcting it would take a superseding entry.
- Fix, either one:
  - (a) land the P-003 ruling on main first, or in this PR;
  - (b) drop the citation from L-0022 before merge.

B2. The "not done" mark on the card task claims a record that does not exist, and an ask that was not made.
- It says the work was "carried in the next session's handoff, docs/handoff/2026-11-05-chief-of-staff-p002-10.md".
- That file is on no ref (searched every local and remote branch) and is not in /home/user/sd-handoff/docs/handoff/. It is a claim I cannot verify; my charter says such a claim fails.
- It also says the work was "asked in this pull request". The PR has no comments, and no questions/ file was filed.
- The paragraph's "so they wait for you" does not say what the owner is to do. AGENTS.md §5 (v3) files every ruling put to the owner as questions/<name>.md first; this applies if this counts as a ruling.
- Fix: commit the handoff (or a questions/ file) before relying on it, or reword the mark so it names only what exists. The paragraph should also say plainly what is asked of the owner.

**Notes**

- N1. The register row's evidence cites reviews/302/reviewer.md, which exists only once the orchestrator records the final verdict. That is acceptable if it is recorded before merge.
- N2. The register row says "every other check result is unchanged". That is true of CI, not of a local run (see round 1's B2). It is fine as the measured effect.
- N3. "The Reviewer's verdict recorded" stays unticked, which a draft allows. It must be ticked before the PR is marked ready.

**Six-part contract**
- **Changed:** nothing. I used a scratch clone in the scratchpad only.
- **Why:** this is the confirmation review of PR #302 against round 1's B1–B3 and notes.
- **Verified:**
  - the pr-body check on the live body;
  - `git diff cd9271b..6c25aba`;
  - `surface_guard diff`;
  - `check_all` on a simulated merge ref (output in /tmp/claude-0/-home-user/c49c7dbe-fb81-5529-837f-439e3372d601/scratchpad/review-302/ci2.out);
  - `digest.py check`;
  - the cited files looked up on every ref;
  - GitHub's check runs, the PR comments, and whether a PR exists for that branch.
- **Undone:** the governance and build runs on 6c25aba were still in progress when I looked.
- **Needed outside my surface:** the author fixes B1 and B2, by landing or dropping the P-003 citation and by making the not-done mark name only records that exist. The orchestrator records this verdict.
- **Open questions:** Q1 (no 3.6.0 ledger entry) is still open. Is putting off the Chief of Staff's card a ruling that needs a questions/ file?
