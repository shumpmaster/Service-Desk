# Ruling needed: is the timeline spec's reading of "each single thing that needs me reaches my phone" enough for M8?

Milestone: M8

WHY: M8 says each single thing that needs the owner reaches their phone. No alert route the plan names can promise a time: GitHub's notices and its timers can be late by an unstated amount, which is why Triage removed S-010's "within 5 minutes". So the spec (S-011) reads M8 more narrowly: every waiting step is sent by name; no minutes are promised; a step missed before a fallback window is counted (in V8) rather than prevented; the normal alert level is used if Time Sensitive is not available; and there is no daily cap. The plan reviewer asks whether the owner accepts that reading before the spec freezes. If not, the spec must be revised to promise something the plan's routes cannot give.
OPTIONS:
  A. Accept the reading. The spec can freeze on it; V8 keeps the 5-minute target as a measure, and every miss is counted and shown, so a route that misses too often shows up in the numbers and can be replaced later.
  B. Not enough. The Definer must revise M8's criteria to a promise, such as a named time limit. No route the plan names can be shown to keep one, so this is likely to fail the plan review again, or to need a new route (for example a paid or hosted sender) that the plan does not hold.
RECOMMENDATION: A. It is the strongest promise the plan's routes can keep, and the misses stay visible rather than hidden.
RISK CLASS: R0 (specs/**)   REVERSIBILITY: reversible (computed from R0)   BLAST RADIUS: the timeline's spec, its alert criteria (AC23, AC41) and what M8's acceptance means
DEFAULT: A   TIMEOUT: none — put to the owner in session; it waits until answered

## Context
- The spec's open question 2 asks the owner this, in these terms (source: specs/S-011.md on item/P-005, "Open questions for the owner")
- The plan review, round 2: "Does the owner accept the narrowed reading of M8? … Open question 2 must be answered before freeze, or the spec is revised" (source: reviews/S-011/plan.md on item/P-005, "Open questions")
- Triage found S-010's 5-minute promise could not be kept by any route the plan names (source: decisions/P-005/stop-4.md, "Triage's spec defects"; library/facts/F-gh-12.md; library/facts/F-gh-12b.md)
- The owner's answer to the plan's question on alerts: "any single thing that needs me" (source: docs/projects/P-005.md, answer 2, as the plan review cites it)
