# Ruling needed: the card fix's build stopped before it began; today's notification sender cannot show which cards it notified, so how should the plan go on?

Milestone: M4

WHY: The Builder's first step was a test aid: a small program that records how today's desk behaves, so the fix can later be compared against it. It stopped before writing anything, as its brief told it to, and nothing was built or changed. The spec asks that record to list which cards a first notification run would notify, card by card. Today's sender never does that for these test cases. On a first run it sends one summary ("7 things wait on you now"), and with three or more new cards it sends one grouped notice. Neither names a card. The only way to list cards would be for the test aid to work them out itself, which the spec forbids, so a correct record cannot be made under the spec as written. The spec sends this stop back to you. Every way on changes the locked checks, which is irreversible in practice. The card fix waits until you rule.
OPTIONS:
  A. Re-specify that one part. A new spec, extending the frozen one, changes only what the record says about notices: it records each notice as the sender actually sends it (a summary, a group or a single card's notice, with its count and where it opens). The Check author rewrites only the affected cases and checks, a fresh Critic and Reviewer review them, and you approve their lock. About one session before the Builder starts again. The comparison of notices then checks how many are sent and of which kind, not which cards.
  B. Narrow the test cases instead. Each normal case holds at most two open cards on a run that is not the first, so today's sender sends one notice per card. This keeps "which cards" in the record, but it tests the desk only with small lists, and the first run's summary is never checked. It needs the same rewrite, reviews and lock as A.
  C. Stop the card fix here. The spec and the locked checks stay on record, and nothing is built.
RECOMMENDATION: A. It records today's sender truthfully without changing it, and keeps every case as large as it is now. B tests less, and C gives up a fix whose spec and checks are done.
RISK CLASS: R3 (every option but C changes tests/acceptance/**)   REVERSIBILITY: irreversible (computed from R3)   BLAST RADIUS: the card fix's spec, checks and build; no other project, and no change to the sender
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The spec defines a desk case's notices as what a first sender run on its records would send, listed by card id, and forbids the test aid from working out any output field itself (source: specs/S-009.md:148, :154)
- The spec stops the build and returns it to the owner if the test aid cannot run at the base commit (source: specs/S-009.md:172, :270)
- Today's sender sends one summary on a first run and one grouped notice for three or more new items, each opening Home (source: src/notify/sender.mjs:24, :99-101, :269-283)
- The grouped notice's key is made of hashed item keys (source: src/notify/sender.mjs:240, :276-283)
- A card's notice key is its project, kind and id, with no content, so a changed card on a later run is not sent again (source: src/lib/waiting.js:26-29)
- Every normal desk case holds seven open items; one sender case's first run holds three (source: tests/acceptance/S-009/cases/baseline/S009-B-desk-ok.json; S009-B-sender-first-showing.json)
- The Builder ran today's sender on the normal desk case: a first run sent one push, "Notifications are on: 7 things wait on you now", opening Home; a later run sent "6 things now wait on you in Service-Desk", opening Home; neither carried a card id (source: docs/handoff/2026-11-13-chief-of-staff-p002-51.md, the Builder's return)
- The Reviewer of the checks warned of this stop before they were locked (source: reviews/429/_reviewer-verbatim.md, non-blocking 1)
