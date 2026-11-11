# Ruling needed: change the safety proof's instructions on the desk, so its commands-off session can pass

Milestone: M4

WHY: The safety proof decides whether Builders may use a shell, and it has never fully passed on this desk. In every run, including today's (run 43018049218), every token, sandbox and commands-on check passed. But the commands-off session read its instructions and stopped without a single tool call, so its two checks had nothing to judge. Its instructions open with "read this process's environment", which on its own looks like credential-hunting. The commands-on instructions open with a harmless file write and then do the same reads, and that session does them. Until the proof passes, every Builder runs without a shell, and P-003 cannot be built, because its spec needs the old code run first. The fix that the operating model itself suggested (L-0129) is to give the commands-off session a harmless first step. But the model's frozen specs fix those instructions (S-015 AC12, S-021 AC2), and four of the model's own tests check their wording. The Reviewer therefore failed the change when I made it without asking you.
OPTIONS:
  A. Change the desk's copy now. The commands-off session first writes a short fixed file (not the nonce the commands-on session writes, which keeps the model's rule L-0101), then does its two reads, renumbered. The desk's copy then departs from the model's frozen specs and their four tests until the model adopts the same change; the departure is recorded in the ledger and raised in the model (LL-047). Then you run the proof again. Whether the session now acts is untested until that run. Cost: one R3 change with the Reviewer's verdict and yours; if the proof passes, P-003's build can start within about a day.
  B. Wait for the model. Its owner writes a spec superseding S-015 AC12 and S-021 AC2, and the desk adopts it. The desk keeps matching the model, but P-003 stays blocked meanwhile, for an unknown number of days.
  C. Build P-003 outside the loop, in a session that has a shell, as the desk itself was built (L-0007). The proof is left as it is. How such a build rejoins the loop's records would need working out first, and the next build would hit the same wall.
RECOMMENDATION: A, because it is the model's own suggested fix, it is small and reversible, and it is the only option that unblocks the pipeline's Builders soon. The departure is recorded, not hidden.
RISK CLASS: R0 (the question); the change it leads to is R3   REVERSIBILITY: reversible   BLAST RADIUS: the scrub proof's commands-off session on this desk, and through the proof, whether every Builder session may run commands
DEFAULT: none   TIMEOUT: none (it leads to an R3 change, which waits for your ruling)

## Context
- The proof run on 11 November passed 19 checks and failed only the commands-off session's two Read checks, with "no call with a result"; that session made 0 tool calls (source: GitHub Actions run 43018049218)
- The same failure in October was deferred by the owner until P-001 closes (source: docs/LEDGER.md L-0007)
- The model suggests giving the commands-off brief the commands-on brief's harmless first step, and leaves it to a later spec (source: Personal-Org-Operating-Model docs/LEDGER.md L-0129)
- The model's frozen S-015 AC12 gives the commands-off session the Read steps only, and S-021 AC2 numbers them (source: Personal-Org-Operating-Model specs; the Reviewer's run of its tests, this session)
- Four of the model's tests fail on a copy with the harmless step, including one that keeps nonce A out of the commands-off brief (L-0101) (source: the Reviewer's run of Personal-Org-Operating-Model tests against the changed file, this session)
- The Builder ran with commands forced off on 11 November, so P-003's build recorded no baseline (source: docs/reports/P-003-builder.md on item/P-003)
