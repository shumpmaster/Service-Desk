# Glance emphasis: before and after (mockup, 24 Oct 2026)

Before-and-after shots for each of the 11 proposals in the Design reviewer's audit of 24 Oct
(../../audit-2026-10-24.md), drawn at the owner's request: "The only other thing I need is proposed
mockup. Before and after with every change" (docs/design/references/owner-request-2026-10-24-glance-emphasis.md).
It is a mockup only: nothing is built.

Open [index.html](index.html). Each proposal has its kind (fix, or the owner's choice), what is there now, the
change, the before and after shots, and the reviewer's rationale verbatim. "Every change together" shows 13
screens with all 11 changes applied, light and dark.

## How the shots were made
- **Before:** the desk at da4a342 (src/public as on main), served locally from the repository's test fixtures,
  as the audit served it (fixtures mix, ext, text, unread, stall, signed-out, failed load; all made up), captured
  with Playwright and Chromium at 360×740, 2× scale.
- **After:** the same page, same moment, with only that proposal's change applied in the browser by
  [changes.js](changes.js) (one function per proposal, p1 to p11), using the desk's own classes, colour tokens,
  type roles and icons. No new colour or size is added. The page's clock is paused before the shot so its own
  redraw can't undo the change.
- **Stand-in words:** item 5's short gate titles ("P-003: ready to go live?") are not from the record; the
  Definer picks the line. Item 2's "Not read since 16:00" and item 10's wording follow the audit.
- **Seen in the mockup, not stated in the audit:** on the gate's sheet (item 5) the choices do not move up,
  because the full sentence moves into the lead and takes the room the shorter title gives back.

| File | What it shows |
|---|---|
| shots/01-stall-* | Home: a project with no movement for 8 days (item 1) |
| shots/02a-cant-read-tile-*, 02b-signed-out-* | Home: one project unreadable; signed out (item 2) |
| shots/03-count-* | Home's briefing: the count and the settles-itself line (item 3) |
| shots/04-lanes-* | Waiting with two empty lanes, 25 cards (item 4) |
| shots/05a-gate-board-*, 05b-gate-sheet-*, 05c-gate-plan-* | A gate's title on Waiting, its sheet and Plan (item 5) |
| shots/06-since-* | Home's "Since you last looked" with four long lines (item 6) |
| shots/07-timeline-* | A project's Timeline as it opens (item 7) |
| shots/08a-nothing-waiting-*, 08b-ran-again-* | A project page: nothing waiting; two ran-again lines (item 8) |
| shots/09-at-work-* | A Home tile's "At work" line (item 9) |
| shots/10-failload-* | The failed-load screen (item 10) |
| shots/11-new-* | Waiting: a card new since you last looked (item 11) |
| shots/12a-kick-strip-empty-*, 12b-kick-strip-cards-*, 12c-kick-strip-cards-p4-* | Item 4b, the owner's idea from a comment on item 4: Kicked back as a strip above the lanes, empty and with two cards (made-up marks on this device), alone and with item 4 (change pK in changes.js; not reviewed by the Design reviewer) |
| shots/all-<screen>-<theme>-* | Every change together, 13 screens, light and dark |

## Round 2 (the owner's five ideas)

The Design reviewer's round 2 (../../audit-2026-10-24-round-2.md) answers the owner's second message: a limited
status palette, occasional anchors, a "you are here" arrow, counts of all milestones, sprints and pieces of work,
and standard milestones set apart. Its changes are in [changes2.js](changes2.js), q1 to q5, written by the
reviewer. Each round-2 "before" is the desk with all of round 1 already applied (p1 to p11, pK with two equal
lanes), so each pair shows only the round-2 change.

| File | What it shows |
|---|---|
| shots/r2-q1-disc-*, r2-q1-tl-*, r2-q1-home-* | R1: green and red on the status mark only (a finished phase opened, the Timeline, Home tiles) |
| shots/r2-q2-page-* | R2: the project page's one anchor box, with a stand-in tally |
| shots/r2-q3-timeline-*, r2-q3-page-*, r2-q3-home-*, r2-q3-plan-* | R3: the "you are here" arrow |
| shots/r2-q4-counts-* | R4: milestones and sprints counted (stand-in numbers, counted by hand by the reviewer) |
| shots/r2-q5-launch-*, r2-q5-design-* | R5: standard milestones in their own labelled group |
| shots/r2all-<screen>-<theme>-* | All five together, the reviewer's own captures, light and dark |
