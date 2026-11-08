Verdict: FAIL

I plan-reviewed S-004 against the plan (docs/projects/P-003.md), the sizing findings (research/P-003-sizing-findings.md) and the owner's rulings (stop-5, stop-6, dor-4). Several cited files are not in this pack, and one finding is a scope error that would block the Builder.

## Findings

**1. Blocking: the Areas touched path for tests does not match the repository.**
- specs/S-004.md:77 lists `src/lib/**, src/public/**, test/**, docs/handover/**`.
- research/P-003-sizing-findings.md:41 says the existing tests are in `tests/desk/`, "not under src/". The pack's only test path is `tests/acceptance/`.
- The spec expects 15 to 23 new tests (lines 90 and 122). Every `join-test:` file would sit outside the stated scope, so the Builder would be out of scope or would write tests to a wrong folder.
- Fix: name the real directory (`tests/**`, or `tests/desk/**`). Also say where the J1 to J6 `join-test` files go.

**2. Blocking: the criteria depend on facts the spec admits it cannot verify.**
- AC14 (line 52) tests "the same notices as the sender of before this fix". Line 94 says "How the sender today avoids repeating a notice is not known here".
- AC15 (line 53) and J4 (line 72) require that a notice or link to an unlisted card "opens what the desk opens today". That is known only second-hand from sizing:67, and only as a "gone" re-check at notifyview.js:337.
- AC9, AC16 and AC17 require that gate cards behave "as today" on a failed read. Line 94 says this behaviour "is not known here".
- A check author cannot lock criteria whose baseline nobody has read. The sender's behaviour (AC14) and the gate-card behaviour on a failed read (AC9, AC16, AC17) are the unread baselines.
- Fix: have the Definer read the sender's dedup logic, notifyview and the gate-card failed-read paths at source. Then state the baseline in the criteria, or make the criterion "equal to a recorded baseline run".

**3. Blocking: J1 may contradict the existing log reader.**
- J1 (line 56) says "two `card` entries for one card (the earliest counts)". It also says the field names are those of the existing reader.
- Nothing in the pack shows what the reader does with duplicates. If it keeps the last entry, the rule and the reader disagree, and AC11 and AC7 are not "as the desk's existing log reader reads it".
- Fix: either cite the reader's behaviour or state that the rule has its own pick, and say where that pick is made.

**4. Non-blocking: AC13 and J6 cannot find a no-mark miss.**
- J6 (line 74) concedes that a no-mark miss is "0 unless the rule is broken". J4's test is the only guard against a view dropping the mark.
- V6's first count is therefore not measured by the monitoring criterion.
- Plan §6 calls this "the spec's monitoring criterion". The mismatch with V6's first half should be said openly in the spec or carried to the gate as a risk.

**5. Non-blocking: the spec's own size and scope are near the stop rule.**
- Line 90 puts tests at 15 to 23 against a stop at 24. Line 105 admits this.
- AC16 hides all decision cards if one notes file fails (open question 3). That is wider than the plan needs.
- The plan says "cannot get … the notes". Both are disclosed, so I am not failing on them.

**6. Non-blocking: AC11 and "the same moment".**
- The desk and the sender will not run at the same instant, so AC11 can only be tested with an injected moment. Say so in the AC11 test line.

## What held up
- Header `milestones: M4` matches docs/projects/P-003.md:46.
- The plan is cited as draft 3, approved by dor-4.md ("proceed").
- The re-specify ruling (stop-5.md) is honoured: no weekly check, reports or review card are built.
- AC16 and AC17 match plan §1 bullets 5 and 6.
- J2's examples cover the real note forms in sizing:32–39, including the bold-wrapped form `**Recommendation: \`x\`…**`, the `##` heading form, and the bare `## Recommendation` heading with no word.

## Join-up review (Design), for plan.md
Screens checked: queue, Home count, board, card sheet (src/public/sandbox.js) and notifications. These are views in the spec's words only; no mockup exists for the new lines.

| Check | Result | Fix |
|---|---|---|
| One meaning per signal | Pass in the text. "Recommended" and "No Chief of Staff recommendation yet" are exclusive (AC3, AC5). | none |
| One navigation | Pass. No navigation change. | none |
| Consistent type, spacing and codes | Not checkable: no drawn design. The three "not shown" lines (AC16, AC17) are given as exact words. | The Builder shows the lines on a preview. |
| No two screens doing the same job | Pass. Queue and Home both carry the same lines (J4). | none |
| Every screen's data available from the records | Pass, subject to findings 2 and 3. | See findings 2 and 3. |

Needed changes to the records: none.

## Open questions
- Does the existing log reader keep the first or the last of two `card` entries? (Finding 3.)
- What is the real tests directory, and is `tests/desk/` in scope? (Finding 1.)
- Can the Definer read the sender's dedup and the "gone" path at source before freeze? (Finding 2.)