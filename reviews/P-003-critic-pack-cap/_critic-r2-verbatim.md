# The question on the Critic's reading pack, the Critic's cold read, round 2 — verbatim

*Dispatched by the Chief of Staff's session (session_01QBwHGL14SMPK1652qVZprr) on 2026-11-04, read-only, against questions/P-003-critic-pack-cap.md at 9fc0de4b. Returned FAIL, with a self-implication flag. Recorded unchanged below. Its run, rounds 1 and 2 together: 86,417 tokens, 27 tool uses.*

---

Verdict: FAIL

All four round-1 blocking findings are fixed, and both new claims check out against the code. One blocking finding remains, and my own round-1 note led to it.

**Self-implication flag (D-050):** in round 1, under "what I could verify", I wrote that the design audits cite the build screenshots (`builds/` PNGs) and that this supports option C's cost. That was wrong; I counted `.png` mentions without checking where the files are. The rewritten line 40, and the costs on lines 13 and 21, now rest on that claim. Weigh this finding knowing it corrects my own earlier check.

**Blocking finding**

1. **Line 40 says "The design audits cite the build screenshots (source: docs/design/audit-2026-10-24-round-2.md)". The cited record does not say that.**
   - The audit never mentions `builds/`.
   - The captures it names (e.g. `mix/mix-p_Service_Desk_timeline-base-360-light-full.png`, `mock2/mix-page3-360-light-after.png`) are not in the repository. I globbed for them and found nothing. audit-2026-10-24.md is the same (`stall/…`, `mix/…`, not in the repo).
   - Within docs/design, the only Markdown file that points at `docs/design/builds/` is references/owner-request-2026-10-26-m3b-picture-changes.md.
   - The records that cite the build screenshots are the design reviewer's verdicts under reviews/, e.g. reviews/M3B/_picture-design-r2-verbatim.md line 3: "The images are in docs/design/builds/m3b-picture/round-2/". Also reviews/M3B/_plan-design-r*-verbatim.md and reviews/M3G/_stage-qw*-design-*-verbatim.md.
   - The same wrong claim carries into two option lines:
     - **Line 13 (A's cost):** "it reads the design reviewer's written audits, which cite them". Under A, the readiness/plan-review Critic keeps the audits, but they do not cite these pictures. Only the gate Critic, which has `reviews/**`, reads the verdicts that do. Fix: "it reads the design reviewer's written audits, which describe what it saw in words; the gate Critic also reads its verdicts on each pull request, which cite the pictures."
     - **Line 21 (C's cost):** "the design audits cite those screenshots, so their citations would need rewriting". Fix: say that the design reviewer's recorded verdicts cite them (cite one, e.g. reviews/M3B/_picture-design-r2-verbatim.md), and that those are verbatim records. So their links would break rather than be rewritten, which is a stronger cost than the card now states.
   - Fix line 40 to match: "The design reviewer's verdicts cite the build screenshots (source: reviews/M3B/_picture-design-r2-verbatim.md, line 3)".

**Non-blocking notes**

- **Line 11's branch "If the change lands before the pipeline's own second try … nothing more is asked of you" is unlikely to happen.** .github/workflows/orchestrator.yml runs on `cron: "*/30 * * * *"`, so the second try comes within about half an hour. The owner's merge of a rule change (R3) will almost certainly come later. Say plainly that a failure card will almost certainly reach the owner and that `retry` is the answer to give. Also, "nothing more is asked" still includes merging the rule pull request, which line 28 says.
- **Who may answer the failure card.** The correction is right: ROUTING.toml [gates.failure] has `answered_by = "owner"`. But [proxy] `refused` lists `failure.drop` and not `failure.retry`, and orchestrator.py lines 1406–1422 accept a `Proxy:` line on a word that is not refused. So `retry` can also be recorded by proxy (D-066). If the owner has granted that, the card could say so; if not, the current wording is fine.
- **The spare capacity is slightly understated.** The card's MB figures are decimal (87,693,971 → "87.7 MB"). On that basis the gate Critic has 20,971,520 − 8,918,262 = 12,053,258 bytes to spare, about 12 MB, not "about 11 MB". The "20 MB limit" is binary MB (20,971,520 bytes). Pick one unit, or say "about 12 MB".
- **Line 37's folder breakdown still cites "measured on main at 0b226e55"**, which is not a record. measure.py does not produce that breakdown, and you ran it at a different commit (2fd0deda). Either drop the breakdown, cite where it came from, or add it to the script.
- **Line 38 cites the script but not its output or the commit it ran on.** Keep the output beside the script (e.g. measure.txt naming 2fd0deda), so the owner can see the figures without running anything.
- **measure.py is a fair approximation, and its docstring says so.** It leaves out `{spec}`/`{ruling}`. It does not drop the user representative's gate records by name (none exist for P-003 yet), and it does not apply the runner's other exclusions such as hard links. None of this changes the result.

**What I verified**

- **Round-1 finding 1 (Triage still runs) is fixed.** Line 6 now says only Triage still runs. Line 34 is confirmed: the critic-triage pack in PACKS.toml has no `docs/design/**`.
- **Round-1 finding 2 (the refusal's sources) is fixed.**
  - Line 32: _run-676-prepare-log.md holds the quoted ERROR line word for word, plus "0 session(s), … 1 error(s)".
  - Line 33: the dispatch line at 16:38:43Z is the last P-003 line in the dispatch log, and status/P-003.toml shows `state = "dispatched"`, so there is no outcome yet. Confirmed.
- **Round-1 finding 3 (REVERSIBILITY) is fixed.** "R3, gate-bearing (owner approval, A4), so it never defaults" matches risk-paths.toml and AGENTS.md §5. DEFAULT none and TIMEOUT none are consistent with it.
- **Round-1 finding 4 (what the Critic still reads) is fixed in its split.** Line 13 now separates the Critic from the gate Critic. But the claim that the audits cite the pictures is wrong (blocking finding).
- **New claim, line 35 (what an error does), is confirmed.**
  - orchestrator.py apply_outcome, lines 537–542: on `error`/`timeout`, `state="ready"` and `attempts=min(attempts+1, 2)`. A failure card is raised only when `attempts >= 2`.
  - attempts goes back to 0 on an `ok` result (line 533), so "two in a row" is right.
- **New claim, the failure card's words, is confirmed.** ROUTING.toml [gates.failure] has `answered_by = "owner"` and `project_in_shape = ["retry", "drop"]`. orchestrator.py `word_list_key` (lines 556–560) picks `project_in_shape` for a project with no spec, and P-003's status has no spec.
- **Line 36 is confirmed.** session_runner.py line 829 copies a file into a pack only if it is at most `file_bytes`, so larger files are left out.
- **Option B's cost is confirmed.** orchestrator_git.py applies the same caps to hand-over tars and untars, and session_runner.py lines 1433–1435 apply them to change sets.
- **The "Not offered" reason is confirmed.** session_runner.py line 810 always builds a role's reading list from must_read + may_read, the same for every task.
- **Option A's patterns match what they claim.** govlib.py `glob_to_regex` makes `**/` match zero or more folders, so `docs/design/**/*.md` covers README.md at the folder's top level. Its HTML exclusions (mock-ups, references/trial-view) are now stated.
- **The numbers on the card match the script output you gave me:** 88/87.7, 2.1, 95/94.6 and 8.9 MB.

**What I could not verify**

- Running measure.py, so its output, and commits 2fd0deda and 0b226e55.
- The folder's 89 MB breakdown.
- The original GitHub Actions log behind the copied lines.
- That the pipeline's tools "come from the operating model" (part of the "Not offered" reason).
