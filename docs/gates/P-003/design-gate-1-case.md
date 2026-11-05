# P-003 — the Design gate

## 1. The ask

The card fix's readiness check failed twice before it passed on its own plan, the third time [decisions/P-003/dor-fail-1.md] [decisions/P-003/dor-fail-2.md] [reviews/P-003/_critic-dor.md].
Proceeding moves it into Design, where its behaviour is pinned down as scenarios and checked before anything is built; nothing is irreversible [docs/projects/P-003.md:56] [docs/projects/P-003.md:61].

**The proposer's recommendation:** proceed — the brief passed its readiness check with nothing blocking, and no unknown is left open [reviews/P-003/_critic-dor.md] [docs/projects/P-003.md:107]

## 2. The vision

Twice you answered a decision card against the Chief of Staff's recommendation, which the card did not show [docs/projects/P-003.md:32].
With the fix, a decision card waits until its notes are in, then shows their answer marked Recommended, or after a day shows marked as having none [docs/projects/P-003.md:44].

## 3. What this phase taught us

One list feeds every view, so the hold is one rule in one place [docs/projects/P-003.md:99].
The change is about 60 to 90 lines and 8 to 12 tests [docs/projects/P-003.md:99].
The plan's place mattered: it passed only once it had a plan of its own [decisions/questions/P-003-plan-place.md] [reviews/P-003/_critic-dor.md].

## 4. The plan for the next phase

Design takes on five standard steps and skips the experiment [docs/projects/P-003.md:56] [docs/projects/P-003.md:58].
It ends with the spec, reviewed, and the Build gate [docs/projects/P-003.md:61].
One milestone, M4, is built in Build [docs/projects/P-003.md:44].

## 5. The risks

A card held for good: never, after a day it shows [docs/projects/P-003.md:102].
A button marked that was not recommended: notes without a word count as none [docs/projects/P-003.md:103].
You told twice: a held card's notification goes when it shows [docs/projects/P-003.md:104].
A gate card changed by mistake: gate cards stay as they are [docs/projects/P-003.md:105].
The timeline reads two steps taken on, the go-ahead and the risks, as not recorded; the plan holds both [docs/projects/P-003.md:48] [docs/projects/P-003.md:53].

## 6. Cost and limits

$0 a month of new spend, no new data or outside service, tier T1 [docs/projects/P-003.md:79] [docs/projects/P-003.md:80] [docs/projects/P-003.md:81].
Your time: none to run it [docs/projects/P-003.md:90].

## 7. Kill criteria

Work stops and comes back to you if the build grows past about twice its sizing, or a third plan review fails [docs/projects/P-003.md:92].
A miss on V6 is any card shown with neither mark, or held over a day [docs/projects/P-003.md:90].

## 8. What the owner is agreeing to

The milestone M4 and the target V6: no decision card shown unmarked, from M4's go-live to 31 December [docs/projects/P-003.md:44] [docs/projects/P-003.md:86].
The standard lines as you ruled them, $0 spend and tier T1 [decisions/questions/P-003-standard-lines.md] [docs/projects/P-003.md:79].

## 9. Appendix: the phase record
<details>
<summary>The phase record</summary>

Discovery ran once: three readiness checks, the first two failed and each answered resubmit, the third passed [dispatch-log/2026-11.jsonl] [reviews/P-003/_critic-dor.md].
Your rulings in the phase: the plan's place and the standard lines [decisions/questions/P-003-plan-place.md] [decisions/questions/P-003-standard-lines.md].
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
