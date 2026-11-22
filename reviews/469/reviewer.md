*The Reviewer's stage-6 launch review, copied verbatim from reviews/S-009/reviewer.md for PR #469, where CI looks (the outside-build plan's step 11 practice). Recorded by the Chief of Staff, session_01QBwHGKtgD8HDSTUVrwvdSi.*

Verdict: PASS

The launch review of the card fix passes. I found nothing blocking. The cited count reproduces byte for byte, all 1,583 tests pass, and every governance check passes except `record_checks merges`, which I agree is a local artefact (item 5). There are seven non-blocking findings. Four of them should be carried into the Launch gate's case as risks or fixed before it: N1, N2, N3 and N6. No pull request is open for this branch yet, so the rule that a PR body opens with "What this means for you" has nothing to judge. Whoever opens it must follow AGENTS.md §4: that heading and paragraph, then `Milestone:`, `## Context`, `## Why` and `## Tasks`.

**What I reviewed and what I used.** I worked at HEAD 642e8ba8. While I was reviewing, the branch moved to 1866199c (21:09:54Z). That commit adds one line to the session-lines file and nothing else, and I ran the checks and tests at 1866199c. The checklist file docs/archive/OPERATING_MODEL_v2.5.1.md is not in Service-Desk, and the ledger has no L-0112; reviews/341, /346, /429, /464 and /465 hit the same gap. I used /home/user/Personal-Org-Operating-Model/docs/archive/OPERATING_MODEL_v2.5.1.md:857-876 ("Reviewer brief", items 1-7), together with the reviewer charter, AGENTS.md §1, §4 and §5, and your brief. I did not see the Builder's summary. Scratch outputs are in /tmp/claude-0/-home-user/7e2f5734-2e20-5f7e-b673-48b25a876048/scratchpad/reviewer/. I wrote no repository files.

## Evidence per item

**1. The handover package (/home/user/Service-Desk/docs/handover/P-003/handover.md): PASS.**
- **Form:**
  - It opens, after the title, with `## What this means for you` and one plain paragraph (:3-5) of 146 words, within the 15-150 the form allows. The paragraph has no paths, code or ids.
  - It leads with what was skipped or has not run: the hidden tests, the parts that start at launch, and the half of V6 the count cannot see.
  - It covers what changes for the owner and says nothing is irreversible.
  - Every section of /home/user/Service-Desk/docs/handover/_TEMPLATE.md is present, in order, plus a "Who does what" table at the end.
- **Claims checked against the records they cite:** all support what is claimed, except N4.
  - The S-014 title, mechanism, risks, AC14, AC19, and open questions 1 and 4.
  - Plan §6 lines 103, 107, 109 and 111, and §4.
  - The design review's Q1 and Q2 (reviews/465/design-reviewer.md:78,82), and that the owner's acceptance did not file them as later work (decisions/questions/P-003-preview-acceptance.md, last bullet).
  - The named sections of service-desk.md (:42) and desk-operations.md (:210, :296).
  - The V6 quote (handover :134) is byte-equal to docs/projects/P-003.md:103.
  - The V6 line's fields as quoted at :79-82.
  - Main at 3a6613a, committed 2026-11-22T20:32:08Z.
  - The first card arriving 2026-10-01T02:22Z (Q-003-failure-1).
- **The operating notes against AC18:** /home/user/Service-Desk/docs/handover/P-003/operating-notes.md opens with the paragraph and covers all six of AC18's bullets (:15-143). Exceptions are N3 and N5.

**2. "Its own monitoring and feedback" (handover :67-114): PASS, by the owner's plan ruling.**
- **(a) The weekly count is shown running.** The past-records run is the record that shows it: the V6 line in intake/value-checks.jsonl, with intake/v6/. I reproduced it (item 3). The monitoring reads main's records, not the preview, which is right under decisions/P-003/stop-5.md ("move my weekly value check, my reports and the end-of-year card out to the plan and the Launch gate").
- **(b) Report of each miss, (c) feedback route, (d) review card after 2026-12-31: not running, and the package says so plainly** ("Has not run", :100, :107, :114, each with its reason).
  - Read literally, my charter fails a launch review when a named part is not running.
  - I do not fail it, because the owner ruled Launch-4 with the plan (docs/projects/P-003.md:75): the count is "shown working ... by its one run on past records, with the feedback route and the end-of-year card set out beside it for after launch".
  - (b) cannot run without a miss, and its record is the count's own line.
  - P-001's launch Critic treated parts in this position as counting "only by your waiver" (reviews/P-001/_launch-gate-1-critic.md:26). This package does not cite Launch-4's "set out beside it for after launch" as the ruling that excuses (b) to (d). It cites only plan §6. That is non-blocking, but the gate case should name it.
- **(a)'s record does not join the desk:** see N1.

**3. The cited count: PASS.**
- **Re-run:** `node intake/v6/count.mjs 3a6613a 2026-11-22T21:02:52Z` took 14 s, exited 0, and its output is byte-identical (`cmp`) to intake/v6/2026-11-22-past-records.json: 39 cards, v6Misses 0, secondReported 0, failed reads 0.
- **Independent checks:**
  - **Card selection:** I listed queue/ in every one of main's 937 first-parent trees. That gives exactly 39 `dor-fail`/`stop`/`failure` files and no other names besides README.md and the ci-hold card.
  - **Arrivals:** the first first-parent tree holding each card matches the script's arrival for all 39.
  - **Watched commits:** a diff-tree of each commit against its first parent, over queue/, dispatch-log/, src/lib/model.js and `decisions/*/*-notes.md`, gives the same 472 commits as count.mjs:31.
  - **Main-line committer times** are monotonic, so `currentAt`'s early `break` (count.mjs:33) matches "latest commit at or before".
  - **Reading a past commit without a worktree:** openCheckout reads HEAD only through `rev-parse --verify HEAD^{commit}` (src/notify/checkout.mjs:32), and collect.mjs reads no HEAD itself, so swapping in the commit's sha equals the detached-worktree recipe.
  - **The README's two spot moments:** at 2026-11-12T06:00Z, ff87ad8 gives P-003-failure-15 `held`; at 2026-11-04T21:00Z, 6f8a490 gives P-003-dor-fail-2 and P-004-dor-fail-1 `held`.
  - **The code used:** the last src/lib/ change on main is the M4 merge 2783b48, and src/ is unchanged on the branch, so M4's code at every moment is right for this run.
  - **Negative control:** with the second figure's due time set to one minute after arrival instead of a day, a scratch copy reports 39 of 39 held. The count can report a hold.
- **Semantics:**
  - Raise time is the rule's `raised` at the arrival commit and moment.
  - Due times are raise time or arrival, plus 24 hours.
  - Check moments are the due time, then each later watched commit up to the end moment.
  - The count stops at the first current commit without the card file.
  - Moments before arrival are skipped (count.mjs:67). That is equivalent to J6, because the rule gives `not listed` there, and the arrival commit is itself a moment.
- **The V6 line against J25 (specs/S-001.md:17568-17613):** exact keys; `time` ends in Z; `from` 2026-09-30 is the first arrival's date in America/Chicago, and `to` is 2026-11-22; `figure` is 47 characters with no " · "; `value` is null with state `not measured`, which is allowed; `source` is paths; `session` matches the session lines.
- **Caveats:** see N2 and N5.

**4. The rest of the diff: PASS.**
- **The M4 line** (docs/projects/P-003.md:46): only ` · sprints: PR #465 · reached: 2026-11-22` is added, in the right place. The Critic's round 5 passed it (reviews/P-003-m4-line/_critic-r5-verbatim.md), and commit c38747a1 carries `Owner-Ruling: decisions/questions/P-003-preview-acceptance.md`.
- **The acceptance record's first line:** the change is to its form only, not to the owner's ruling.
  - Old: `Ruling: A — accept the card fix on the preview; …`. New: `Ruling: accept M4 (A) — the card fix on the preview; …`.
  - It keeps the letter, keeps the owner's verbatim "Accept (Recommended)" and the whole body, and now matches `ACCEPT_FIRST_RE = r"^Ruling: accept\b"` (governance/checks/v3_checks.py:2493) and names M4 (:2524-2525), as decisions/questions/P-001-m3b-accept.md:1 does.
  - Small staleness: the Critic's round 5 quotes the old line 1, because the change (e54af3dc) came after it.
- **The session lines** (sessions/chief-of-staff/session_01QBwHGKtgD8HDSTUVrwvdSi.jsonl): a start line and the Critic and Builder helper lines; the Builder line landed in 1866199c.
- **Commit identities and trailers** follow the Service-Desk CLAUDE.md. The Builder's commit 0f9c4bd4 carries `Spec: S-014` and is merged `--no-ff` by 642e8ba8.

**5. Checks and tests.**
- `npm --prefix src test`: 1,583 pass, 0 fail.
- `bash governance/checks/check_all.sh . origin/main`: every check passes except `record_checks merges`. It flags 2c6e46bd (reviews/P-003-m4-line/*) and 642e8ba8 (the handover merge) as orchestrator first-parent commits outside status/, dispatch-log/ and queue/.
  - **I agree this is a local artefact.** On a pull_request, .github/workflows/governance.yml:91-107 runs on GitHub's merge ref. Its one first-parent commit is that merge, not an orchestrator commit, so these commits sit under its second parent and are not judged. They also stay off main's first-parent line if the owner merges with a merge commit, which a squash or rebase merge would not.

## Findings (all non-blocking)

- **N1. The desk will flag the V6 line as an unknown target, and the package does not say so.**
  - The desk reads targets only from docs/PROJECT.md section 6 (src/lib/j11.js:9; src/public/sandbox.js:1539-1543), which holds V1 to V5. V6 lives in docs/projects/P-003.md.
  - Reproducing case: readValueChecks on the branch's intake/value-checks.jsonl, with Service-Desk's targets V1 to V5, gives the note `value checks line 1: Service-Desk's section 6 has no target V6` and no check.
  - So once this merges, and with every weekly V6 line after, the owner's desk shows an unexplained notes line, and the record that shows the monitoring running is ignored by the desk.
  - The plan asks for exactly this record, so this is a join gap, not the Builder's error. It belongs in "What to watch" and in the gate case as a risk.
- **N2. "0 of 39" overstates what the run exercised.**
  - With states tallied per card, 34 of the 39 cards were `not listed` (answered within hours) at every one of their check moments. Only 5 were ever judged: P-001-dor-fail-1, P-001-dor-fail-2, P-004-dor-fail-1, P-005-stop-5 and P-005-stop-6.
  - For example, Q-002-stop-1 arrived 12:29Z on 2026-10-01, and its answer was already on main (09:38 CDT).
  - The figure is true by definition, and the README and handover :90 honestly say 0 was expected. But "found none held too long" (handover :5) would read truer as "5 still open at their due time; none held".
- **N3. Build review N3 is still open and not carried as a risk.**
  - The operating notes' check moments name only src/lib/model.js (operating-notes.md:108). J6 says "the rule's code in src/lib/" (specs/S-014.md J6), and the rule imports about ten other src/lib modules (src/lib/model.js:5-23).
  - It has no effect on this run, but a weekly run after a change to another src/lib file would miss that moment.
- **N4. The handover's "Who does what" Reviewer row (:149) is not fully supported.**
  - It says the Reviewer "and the design reviewer" review "this package", citing governance/risk-paths.toml.
  - risk-paths requires nothing for docs/** (R0 = []), and the acceptance record names only the Reviewer at stage 6. Plan §4 gives the design reviewer the build's review only.
- **N5. Two imprecisions about reusing the count weekly.**
  - **Wording:** operating-notes.md:120 says an answered card "has left queue/". Card files stay in queue/; the card leaves the open set (src/lib/model.js:141-147). The result is the same.
  - **count.mjs as a weekly script:** it fixes the raise time at arrival, so a card whose entry landed after its file would get no V6 check (count.mjs:84-85). Its file pattern takes one-letter item prefixes only (:51), and it always uses the working tree's code (:3).
  - None of this affected this run: every card had a raise time at arrival, and all 39 names matched. It does matter if count.mjs is reused weekly after M4 without change. The README presents it as this run's script, which is fair.
- **N6. J25's landing rule is not followed.** The rule says a value-check line lands "in a pull request in its lane ... changing only this file" (specs/S-001.md, J25, "Who writes it, and how it lands"). Here commit 7bcd7c4d also adds intake/v6/*, and the pull request will carry the handover, the decision record and other files.
- **N7. The monitoring section has no pointer to how the owner raises new work.** The template asks for it (_TEMPLATE.md:11). The desk's own package covers it (docs/handover/service-desk.md:114-117), and the P-003 package says it sits beside that package, but its monitoring section does not point there.

## Join-up note
The build's join-up review is reviews/S-009/_reviewer-build.md (reviewer.md PASS, N1-N5). For stage 6, two joins:
- **The rule (D1) to the Chief of Staff's count (J6):** joined. I reproduced the run, checked its inputs independently and ran a negative control.
- **The count's record to the desk's value-check reader (J25):** not joined (N1). Rated non-blocking, to be carried into the Launch gate's case as a risk.

## Open questions
1. Should the gate case say explicitly that (b) to (d) count as not running by Launch-4's "set out beside it for after launch" (plan :75), as P-001's did by waiver?
2. Should V6 lines go somewhere the desk reads, or should the desk read the targets in plan documents? Or should the owner be told to expect the "has no target V6" note?
3. Should the operating notes widen J6's watched code to src/lib/ (and src/notify/collect.mjs, whose reader the count uses) before the first weekly run?
4. Launch-5's lessons for the operating model "at handover" are not on this branch. Are they due at the gate?
5. Should the reviewer instructions stop pointing at docs/archive/OPERATING_MODEL_v2.5.1.md and L-0112, which Service-Desk does not hold?
