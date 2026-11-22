# Ruling needed: does the card fix work on the preview desk?

Milestone: M4

The card fix is live on the preview desk, https://service-desk-preview.pages.dev, and nowhere else. Look at it there and say whether it does what you asked. A decision card (a stop, a failure or a failed readiness card) should now wait off your desk until the Chief of Staff's notes recommend one of its answers, then show with only that answer's button marked Recommended. A decision card that has waited a day with no notes should show, marked "No Chief of Staff recommendation yet", with no button marked. Gate cards, questions and pull requests should look as before. One to try: the widget's failed-readiness card (P-004, card 1) has no notes and was raised days ago, so it should show with that mark. Accepting marks M4 reached on the preview. Going live is a separate question at the Launch gate.

WHY: M4 is reached when the fix works on the desk's preview (the project plan's M4, docs/projects/P-003.md:46; the outside-build plan's step 14). Your acceptance is what the Launch gate stands on. Left unruled, the fix stays on the preview only, and the live desk keeps marking a decision card's button from the card itself.
OPTIONS:
  A. Accept the fix on the preview — M4 is marked reached on the preview. The session then makes the past-records count, the Builder completes the handover package, the Reviewer reviews it, and the Launch gate comes to you.
  B. Not yet — say what is wrong or missing. It is filed as a fix to the build, and M4 stays not reached.
  C. Accept, with design follow-ups — as A, and the design reviewer's two open points are filed as later work: whether Home's new "not shown" line should carry the red cross like the other can't-read lines, and whether that line should name its project when several projects show on Home.
RECOMMENDATION: A, if what you see matches the paragraph above. Both reviews passed, every acceptance check passes on the built code, and the design reviewer's two points are optional.
RISK CLASS: R0 (a record; the preview deploy is already done)   REVERSIBILITY: reversible   BLAST RADIUS: the preview desk only; the live desk is unchanged until the Launch gate
DEFAULT: none (an acceptance is the owner's own look; it never defaults)   TIMEOUT: none

## Context
- The build merged in #465 and the preview deployed its merge commit 2783b48 at 20:05Z on 2026-11-22. The production job was skipped (source: GitHub Actions desk-deploy run 45064258670, job "preview", step "Deploy to service-desk-preview")
- The Reviewer passed the build and re-ran the record of today's desk byte for byte at the base commit (source: reviews/S-009/_reviewer-build.md; reviews/465/reviewer.md)
- The design reviewer passed the page in light and dark at phone and desktop widths, with two open questions (source: reviews/465/design-reviewer.md, Q1 and Q2)
- On main, P-004's failed-readiness card 1 has no notes and was raised on 2026-11-13, so the fix shows it with the mark (source: docs/handover/P-003/operating-notes.md, the AC13 recipe run on main at cd0a438)
- A direct link to a card that no longer waits lands on the Waiting list with no sheet, as today's desk does (source: reviews/S-014/_reviewer-adapter.md, N1; the owner gave no view on it in #464)
