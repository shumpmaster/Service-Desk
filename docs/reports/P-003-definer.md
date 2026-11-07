I've written the new spec, specs/S-003.md, as a draft, and marked specs/S-002.md superseded. One catch: S-002's status was `draft`, not `frozen` as the brief said, so I changed it from `draft` to `superseded`.

**1. What I changed**
- **specs/S-003.md (new, draft, not yet frozen):** a fix spec for milestone M4.
  - Its lineage is S-001 and S-002, and a note says what changed from S-002.
  - It has a "## The defect" section naming the owner's ruling record (decisions/questions/P-001-card-recommendation.md).
  - It has 13 criteria (AC1–AC13), each traced to the value target V6, and 5 join sheets tested as `join-test: S-003/J1`–`J5`. It also covers the areas touched, the facts relied on (with sources), risks, the stop rule, rollback, cost, three questions for the owner and the Builder's brief.
- **specs/S-002.md:** only the status word changed. It said `draft` (and frozen_at `—`), not `frozen`. Since the brief says S-003 replaces it, I changed `draft` to `superseded` and nothing else.

**2. Why**
The owner's ruling decisions/P-003/stop-5.md said `re-specify`: "Keep the spec to the desk's code: move my weekly value check, my reports and the end-of-year card out to the plan and the Launch gate. Whether a card is held or shown comes only from the records on main, so every view and the sender agree". So, compared with S-002:
- **Removed:** S-002's AC13–AC15 (the weekly value check, the reports of misses, the end-of-year review card) and the operating-notes part of AC12. docs/handover/** is no longer in the areas touched.
- **Removed:** AC7's "once shown, not withdrawn" rule and J3's "already shown" flag. Both depended on what one open desk had already seen, not on the records.
- **Rewritten:** AC11 now says each card's state comes only from the records on main and the current time. Running the rule on the same records at the same moment gives the same answer in every view and in the notification sender.
- **New AC13 (monitoring, kept to the code):** the rule can be rerun on past records, so V6 can be counted from the records alone.
- **Kept:** AC12 (running) is now only "no new setting, credential, schedule or step".
- **Unchanged otherwise.** The other rulings (dor-3, dor-4 "proceed", dor-fail-1 and dor-fail-2) were about the plan, not the spec, so they needed no change here.

**3. What I verified**
- I counted the trace tags, join-test tags and status lines in specs/. S-003 has 19 (13 traces, 5 join tests, 1 status line). S-002 still has 21, so only its status word changed.
- I checked every fact the spec relies on against files in this folder: docs/PROJECT.md lines 85, 540, 588 and 616, the P-003 plan's sections 2–8, F-cf-02 and P-notice-actionable-01.
- No tests or CI were run; that isn't my lane.

**4. What is undone**
- S-003 still needs the Critic's plan review, then the freeze gate (which records its frozen_at commit), then the owner's scenario card.
- No commit was made: this folder is not a git repository.

**5. What is needed outside my lane**
- **Chief of Staff:** put what the ruling moved out into the plan and the Launch-gate lines (written before the Build gate). That means:
  - the weekly V6 check in intake/value-checks.jsonl;
  - reporting each miss to the owner;
  - the feedback route through decisions/questions/;
  - the review card after 2026-12-31;
  - the operating notes on what the hold and the mark mean, and on rollback.
- **Critic:** check the facts that rest on files I couldn't see: the sizing findings, src/lib/model.js, src/notify/collect.mjs, governance/risk-paths.toml and the owner's ruling record.
- **Owner:** approve any change to the sender's own files (src/notify/**).

**6. Open questions** (also in the spec)
1. When a card shown as "No Chief of Staff recommendation yet" later gets its notes, should a second notification be sent? The spec currently sends none.
2. Should the recommended word have to match the card's word exactly? As written, `Drop` does not mark `drop`, and a near miss counts as no notes.
3. The plan shows a card at once if the desk hasn't read the dispatch log. Under the new "records only" rule, that card can go back to held on the next read. The sender could also notify a card the desk is holding. Keep the plan's rule as written, or hold off deciding until the log is read? The second needs a change to the plan's section 1, which only the owner can rule.
4. Is changing S-002 from `draft` to `superseded` acceptable, given the brief expected it to be `frozen`?