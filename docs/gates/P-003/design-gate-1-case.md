# P-003 — the Design gate

## 1. The ask

The card fix's readiness check failed twice, and once stopped on an error, before passing on its own plan [dispatch-log/2026-11.jsonl] [reviews/P-003/_critic-dor.md].
Proceeding moves it into Design, to pin down its behaviour; nothing is built until the Build gate, which you rule [docs/projects/P-003.md:56] [docs/projects/P-003.md:61] [docs/projects/P-003.md:44].

**The proposer's recommendation:** proceed — the brief passed its readiness check with nothing blocking, and no unknown is left open [reviews/P-003/_critic-dor.md] [docs/projects/P-003.md:107]

## 2. The vision

Twice you answered a card against the Chief of Staff's recommendation, not marked on it [docs/projects/P-003.md:32].
With the fix, a card shows that recommendation marked, or after a day says it has none [docs/projects/P-003.md:44].

## 3. What this phase taught us

One list feeds every view, so the hold is one rule [docs/projects/P-003.md:99].
The change is about 60 to 90 lines and 8 to 12 tests [docs/projects/P-003.md:99].
The plan's place mattered: a dry run failed it for borrowing from the desk's first plan [reviews/P-003-dor-dry-run/_critic-dry-run-1-verbatim.md] [decisions/questions/P-003-plan-place.md].

## 4. The plan for the next phase

Design writes scenarios and maps how the views join, and skips the experiment [docs/projects/P-003.md:56] [docs/projects/P-003.md:57] [docs/projects/P-003.md:58].
It ends with the reviewed spec and the Build gate [docs/projects/P-003.md:61].
The Builder then builds the fix itself; no date is recorded [docs/projects/P-003.md:44] [docs/projects/P-003.md:69].

## 5. The risks

A card held for good: never, after a day it shows [docs/projects/P-003.md:102].
A wrong button marked: notes without a word count as none [docs/projects/P-003.md:103].
You told twice: a held card's notification goes when it shows [docs/projects/P-003.md:104].
A gate card changed: gate cards stay as they are [docs/projects/P-003.md:105].
Two steps you took on, the go-ahead and the risk list, read "not recorded" on the timeline: the plan takes them on, but no record marks them reached [docs/projects/P-003.md:48] [docs/projects/P-003.md:53].

## 6. Cost and limits

$0 a month of new spend, no new data or outside service, tier T1 [docs/projects/P-003.md:79] [docs/projects/P-003.md:80] [docs/projects/P-003.md:81].
Your time: none to run it [docs/projects/P-003.md:90]; usage: per helper run, no total [research/P-003-sizing-findings.md:3].

## 7. Kill criteria

Work stops and comes back to you if the build grows past twice its sizing, or a third review round fails [docs/projects/P-003.md:92].
A miss: a card shown with neither mark, or held over a day [docs/projects/P-003.md:90].

## 8. What the owner is agreeing to

The fix's milestone and its target: no decision card shown unmarked, from its go-live to 31 December; the brief is settled [docs/projects/P-003.md:44] [docs/projects/P-003.md:86] [docs/projects/P-003.md:3].
The standard lines as you ruled them, at $0 and tier T1 [decisions/questions/P-003-standard-lines.md] [docs/projects/P-003.md:79] [docs/projects/P-003.md:81].

## 9. Appendix: the phase record
<details>
<summary>The phase record</summary>

Discovery ran once: four readiness runs; the first stopped on an error, the next two failed and were answered resubmit (the second by the Chief of Staff at your request), the fourth passed [dispatch-log/2026-11.jsonl] [decisions/P-003/dor-fail-1.md] [decisions/P-003/dor-fail-2.md] [reviews/P-003/_critic-dor.md].
Your rulings in the phase: the Critic's size limit raised, the plan's place, and the standard lines [decisions/questions/P-003-critic-pack-cap.md] [decisions/questions/P-003-plan-place.md] [decisions/questions/P-003-standard-lines.md].
The two steps skipped by your ruling show as not reached and not recorded [docs/projects/P-003.md:50] [docs/projects/P-003.md:51].

```milestones
Discovery i1
  Discovery-1 "An idea worth exploring": not recorded
  Discovery-2 "Success defined": reached
  Discovery-3 "The expert's questions answered": not reached
  Discovery-4 "The right problem chosen": not recorded
  Discovery-5 "What already exists is known": reached
  Discovery-6 "The risks are known": not recorded
  Discovery-7 "Scope, limits and owners agreed": reached
  Discovery-8 "A brief ready to rule on": reached
    step 2026-11-04T16:38:43Z critic stage 2
    step 2026-11-04T20:27:40Z critic stage 2
    decision 2026-11-04T20:43:51Z dor-fail resubmit
    step 2026-11-04T20:43:51Z critic stage 2
    decision 2026-11-05T16:25:24Z dor-fail resubmit
    step 2026-11-05T16:30:02Z critic stage 2
```

</details>
