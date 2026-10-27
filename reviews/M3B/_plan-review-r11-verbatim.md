# M3B plan: the Reviewer's round 11 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at a7c8e1d (the plan, draft 11).

---

Verdict: PASS

This is round 11 of the plan review: draft 11 of the M3B plan, at a7c8e1d on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only on the diff from 67172ff (three commits: 07ec124, dbd5dc8, a7c8e1d). Draft 11 writes in the owner's grey-ring answer and the readings from VT1's build reviews consistently, the row still partitions and adds up, and nothing regressed.

**1. The answer record is quoted word for word.** I compared the "Answered: from VT1's design review" block against decisions/questions/P-001-m3b-not-measured-mark.md with the same script as before (/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/cmp.py). The question, both options, the whole "How it was answered" paragraph and "Ruling: B" all match. The cited commits 45d7f60 (the question) and 67172ff (the answer) exist.

**2. Answer B is scoped faithfully.** The question was put about the final check: "When the final check says 'not measured'…", worded in the chat as "After the 14 days, if your Chief of Staff's final check records…".
- Draft 11 applies the grey ring after the window only (AC97's check-and-mark rule, and the note under the verdict table). In the window, draft 10's rule stands: the desk's verdict is the mark, the check line says "not measured", and no difference line shows.
- With a figure after the window, the figure and its chart still show, the bar filled `--ink3`, and the check's line is replaced by "Not measured · your Chief of Staff's check, <date>".
- V4 is left to its steps, which fits the question's "the desk has a figure".
- See N1 for a narrow edge of this scope.

**3. The readings agree with AC97, J25 and each other.**
- **V4's archive:** only a latest `met` counts as archived. A `missed` reads "Old repository not archived" with ✕ and the check's "Missed", which is consistent with "the check wins". V4's own verdict is still never outside. `on track` or `not measured` leave the step not done, "Under way". V4's lines before launch are ignored.
- **Other projects' row:** the parts gain "<k> not recorded yet" for targets with no J25 line, so they add up. If the planning project can't be read or drawn, every project shows state 0's "weekly checks not available".
- **Lines for the same days:** a later line with the same days replaces the earlier in V1's sum and in V2's and V3's weeks, matching J25's "the second counting". Of two equal worst weeks, the earlier is the big figure.
- **J6's cache key:** `desk-blobs-v8`, with v7 among the old keys, matches VT1's code (/home/user/sd-vt1 src/lib/scheduler.js:31-32).
- **The rest:** "1 false alarm" is in. So are the Builder's points 2, 3, 5, 6, 8 and 9, and AC83's change note now says measure first, as AC97 and the sheet-order answer (B) have it.

**4. The row still partitions and adds up.**
- States 0 to 8 are unchanged.
- In states 5 and 7, the new case (the grey ring with a figure after the window) is counted "not measured yet", and in state 8 "not measured". The planned ring's mark list names the case. So each target still carries exactly one of the five marks, and the parts add up.
- A V4 `missed` counts under ✕.
- The left icon's rule is unaffected.

**5. VT1's tests lock each change.** VT1's row now includes:
- the desk's own after-window words with a latest `on track` line, and with a figure and no check (the VT1 Reviewer's B1);
- V4's latest-line cases, including `not measured`;
- `desk-blobs-v7` among the old keys;
- other projects' "<k> not recorded yet" part, and state 0 when the planning project can't be drawn;
- the all-met green icon drawn in VT1_OPENS, so AC88's cascade and the stage-8 guard walk it;
- the grey ring in states 7 and 8 against the window's rule;
- same-days replacement and the equal worst week;
- "1 false alarm", the "<k> cards" reading, and V5's log-gone case with a V5 line;
- only bar values in Plex Mono;
- AC66's "Done today" words for a weekly check's merge.

**6. Nothing regressed.** Checks run: `surface_guard diff --range 67172ff..a7c8e1d` is OK (3 commits). v3_checks trace, joins and ready, and spec_check status, are all OK. The working tree is clean.

**Non-blocking findings (risks)**

N1. The grey ring is keyed to "after the window", not to "the final check".
- In state 7 (after the window, not final), the latest line can still be an earlier week's `not measured` while the last checks are pending. It then takes the grey ring, though it isn't the final check the question asked about. Draft 10's rule would have left the desk's verdict as the mark.
- The effect is brief: the mark changes at WN rather than when the final check lands.
- Keying the ring to a latest line whose `to` is on or after WN would match the question exactly.

**Open questions**
None.
