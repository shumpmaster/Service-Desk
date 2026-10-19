# Build review (Reviewer, security), round 3, of the being-recorded build at 9496aaa (verbatim)

Verdict: PASS

For the owner:
- **All three changes hold up.**
  - A run that fails or times out right after a planted line can no longer hide a pull request: both your phone and the desk now count every pull request it names.
  - A pull request the automatic job never gets to is counted 45 minutes after its checks finish.
  - The sender again uses the job's real runs on commits newer than its own copy, so the desk and the phone agree in that case.
- **The token and secrets are still safe.** Nothing new runs with the secrets. The sender's change is three lines.
- **A planted grant line can't make the desk trust a grant the phone doesn't.** That includes the case where the newest grant arrived through a `Merged-By:` merge. The job always prints its own grant line before anything a pull request controls, and the desk takes only the first grant line in the log. The guarantee rests on that print order, so I suggest one small extra rule to make it explicit (below). It isn't needed now.

What I ran, at 9496aaa in /home/user/sd-orch-apr, which I left unchanged:
- Full suite: 769/769 pass. `node tools/build.mjs`: PASS.
- Probes: e2e2.mjs, round2-misc.mjs, the desk reviewer's r3.mjs, and a new round3.mjs. Mine are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/apr/probes/; r3.mjs is in …/scratchpad/rev/.

## The delta, checked
- **Ancestry check for dispatches only** (src/notify/collect.mjs:253-260): `workflow_run` and `schedule` runs pass through untouched, and only `workflow_dispatch` runs need `head_sha` to be an ancestor of HEAD.
  - This is enough: asks-merge.yml has no `push` trigger, so a dispatch is the only way a tag can start a run, and `workflow_run` and `schedule` runs use the default branch's workflow file.
  - e2e2 C1 (a tag dispatch off main forging "PR #3: merged"): the sender's set is `["3"]` and the page shows `count/dispatch`.
  - r3.mjs, a real run on a commit newer than the checkout: the sender doesn't count #7, and the page shows `recording`. The two now agree.
- **Verdicts only from a successful merge job** (src/lib/jobcand.js:182). round2-misc.mjs case A2, where the newest run forges a line for #12 and an older run left #12:
  - `success`: the forged line is read as real (expected: the ordering rule is the guard for a run that finishes);
  - `failure`: `left, forged`;
  - `timed_out`: `left, forged`;
  - `cancelled`: skipped, so the older run's verdict leaves #12.
  - End to end in e2e2: A2 gives the sender `["12","3","9"]` and the page `{"3":"count/forged","12":"count/forged"}`; A3 gives `["12","9"]` and `{"12":"count/forged"}`. My round-2 R1 is closed.
- **Rule (e)** (jobcand.js:192-193, jobwatch.js `unjudged` counted with no words, not held as left), probed in round3.mjs:
  - at 44 minutes, after a run that judged nothing: not left;
  - at 45 minutes: `rule e`;
  - no run at all: `rule e`;
  - a transient verdict at 45 minutes: not left.
  - It only ever adds counts, so it can't hide anything. My round-2 R2 is closed.
- **The secrets and the src/notify diff:** the only src/notify change since round 2 is the three-line event check above. jobcand.js still imports nothing. The other sender files are unchanged.
- **Earlier probes still pass:** D (future head times), F (redirects) and G (odd entries) give the same results as in round 2. A0 now shows `["3"]` even without `head_sha`, because the filter no longer touches `workflow_run` runs.

## The grant-line question
**Answer: no.** A planted `NOTE: the asks-merge grant is <id>` can't make the page take a grant the sender lacks, from a failed run or a successful one.
- **Why.**
  - `grantFrom` (src/lib/jobwatch.js) stops at the first grant line or "no grant" line in the kept lines.
  - The job's `run` (governance/checks/asks_merge.py:600-617) prints its own `find_grant` verdict before it reads or prints any pull request. If there is no grant, or the default branch can't be read, it returns before printing any `PR #` line.
  - Dispatch runs, whose workflow file an attacker could change, never supply the grant line.
  - So in any run the page reads a grant from, a planted line can only come after the job's real one.
- **The Merged-By case** (round3.mjs G1). The ledger's newest entry, L-0099, arrived through a `Merged-By:` merge, so the job refuses it and prints L-0017. PR #9 plants an L-0099 line. The page gets `stands:false` for a failed run and for a successful one (G1b), so it counts, as the spec's "stable mismatch" says.
- **G2:** when the job prints "no grant stands", nothing can be planted after it, and the page treats it as rule (d), the "no grant" case.
- **The dependency** (round3.mjs G3). A log whose `PR #` line comes before the planted grant line does give `stands:true`. The current job can't produce that log, but nothing in the reader enforces the order.

## Findings
**H1. Non-blocking hardening (Definer, then Builder): enforce the order the safety rests on.**
- The rule: take a grant line only when it is the first kept line, before any `PR #` line, and the only grant or "no grant" line in the log. Anything else means no grant, so the page counts.
- That turns the job's print order (asks_merge.py `run`) into a checked rule, so a future reordering in the model can't open the G3 path.
- It costs nothing in real logs: the real log in the fixtures has exactly one such line, first.

## Open questions
- None blocking. The model change (asks_merge.py printing paths safely) is still pending, as recorded. With this round's reader rules in place, I found no remaining way to forge a hidden pull request on either side.
