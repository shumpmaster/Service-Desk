# Q-002 stop-1 — the Chief of Staff's notes

*Chief of Staff, 2026-10-01. Advice for the owner's decision on queue/Q-002-stop-1.md; not a decision.*

## What happened
Q-002 failed its source check three times (02:22, 10:51, 12:24), so the stop rule sent it to Triage
and then to you. The failures got smaller each round. In round 3 the Source checker filed 7 of the 8
proposed entries (research/Q-002-source-check.md on item/Q-002) and rejected one:

- **L-F9.** The memo says two GitHub API calls need only Contents: write and Issues: write. The cited
  permissions table marks both as needing "additional permissions". It rests on one source.
- Also not filed: line 87 grades a claim A that only one page supports (B), and two "not documented"
  absence claims.

Rounds 1 and 2 failed partly because the researcher never saw its earlier memo or the source check.
That was fixed by PR #5 before round 3.

## Triage didn't see the records
Triage reports "root cause not confirmed" because its pack had none of the research files. The
critic-triage pack in governance/PACKS.toml lists specs/ and reviews/ paths, which research items
don't have. Its hypothesis matches the record above: over-graded or single-source claims that the
researcher kept re-submitting. I'm fixing the pack in a separate PR.

## Recommendation: `re-specify`
For a research item this is a strike: it goes back to the Researcher with the rounds reset. The fix
is small and clear: correct or withdraw L-F9, grade line 87 B, and mark the absence claims as
unverifiable. The Researcher now gets the source check as feedback (PR #5), which it didn't have
before.

- `confirm` would only re-check the same memo, and L-F9 would fail again.
- `drop` would lose seven filed entries' worth of a question the redesign needs: how the desk's
  sessions get and use GitHub credentials (Q-002 feeds docs/PROJECT.md §7). It also can't be
  proxied.

Reversible: yes. A re-specified item can still be dropped later.
