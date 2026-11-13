# Ruling needed: the card fix's checks failed their Reviewer on one line; may that line be fixed, past the last review round?

Milestone: M4

WHY: The Reviewer, who unlike the Critic reads today's code, failed the card fix's checks on one line. When a card that shows again is opened from a notice, that check asks for the "no recommendation yet" mark among the words the desk shows on arrival. The spec says those arrival words are only the arrival line, and today's desk shows "Opened from a notification" there. So a correct build would fail it. The checks have used their last review round, so the choice is yours. Nothing has been built and no code has changed. Separately, the Reviewer warns of a likely later stop: on a first run, or with three or more new cards, today's notification sender sends one summary, not one notice per card. The adapter may then be unable to show which cards were notified, and the build would stop and come back to you. You may want to know that now. Locking the checks is irreversible in practice.
OPTIONS:
  A. Fix that line, then lock. The Check author changes it so that, for a notice, it checks only the answer buttons and the sheet it lands on, keeping the mark check for a direct link. A fresh Critic checks only that line, and a fresh Reviewer reads the pull request again. About half an hour. A failure comes back to you.
  B. Lock as they stand, and tell the Builder that a notice's arrival words are the sheet's text. The Reviewer warns that this bends the adapter beyond the spec. It is what the adapter's own review is meant to catch, so the build may stop there instead.
  C. Stop the card fix here. The spec and checks stay on record unlocked, and nothing is built.
RECOMMENDATION: A. The fix is one line, it matches the spec, and it removes a stop a correct build would hit.
RISK CLASS: R3 (the checks are under tests/acceptance/**)   REVERSIBILITY: irreversible (computed from R3; no option changes code)   BLAST RADIUS: the card fix's checks and its build; no other project
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The Reviewer failed the pull request on one blocking finding, the notice case of "AC15: once the card shows again" (source: reviews/429/reviewer.md; reviews/429/_reviewer-verbatim.md; tests/acceptance/S-009/s009-j4-views.test.mjs:71-79)
- The spec makes a notice's arrival words only the arrival line, and the sheet's text applies to a direct link (source: specs/S-009.md:156)
- Today's desk shows "Opened from a notification" when a notice opens a card's sheet (source: src/public/sandbox.js:96; reviews/S-009/_src-reading.md:283)
- The checks' third and last review round passed, and the Critic does not read today's code (source: reviews/S-009/_critic-checks.md, round 3)
- Today's sender sends one summary on a first run and one grouped notice for three or more new items (source: src/notify/sender.mjs:24, :99-101, :269-283; reviews/429/_reviewer-verbatim.md, non-blocking 1)
- The plan sends a third failed review round back to the owner (source: docs/handoff/2026-11-13-P-003-outside-build-plan.md, step 5)
