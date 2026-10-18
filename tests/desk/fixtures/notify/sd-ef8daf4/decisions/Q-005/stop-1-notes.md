# Q-005 stop-1 — the Chief of Staff's notes

*Chief of Staff, 2026-10-01. Advice for the owner's decision on queue/Q-005-stop-1.md; not a decision.*

## What happened
Q-005 failed its source check three times, so the stop rule sent it to Triage and then to you. The
last check confirmed every documentation claim (F-01 to F-27). It failed only because the memo cites
the question file, `research/Q-005.md`, and the Source checker's pack did not include that file.

Triage (triage/Q-005.md on item/Q-005) traced the same root cause from the pack manifests. The
Researcher always had the file and the Source checker never did. It calls this "a stage 2 setup
fault … not a research fault", and says the fix is to add the question file to the Source checker's
pack, then re-dispatch it once.

That fix is merged: Service-Desk PR #11 (main at 0e386cc). The Source checker now gets the question
file and the owner's source standard (governance/standards/sources.md, ruling A).

## Recommendation: `confirm`
That is one focused check by the Source checker, offered once. Nothing in the research needs
changing, and the failure's cause is now fixed.

- `re-specify` would send it back to the Researcher for a new round, when the memo is already
  confirmed.
- `drop` would throw away a confirmed memo that docs/PROJECT.md §7 (U3) needs.

One small fix rides along, which the Source checker asked for: F-19 should say "tool credentials",
not "GitHub tokens". It is a wording note, not a cause of the failure. If the confirm check fails on
it alone, re-specify is the fallback.

Reversible: yes.
