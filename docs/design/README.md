# Design: where it stands

*Kept by the Orchestrator. Updated 14 Oct 2026. The owner's references and words are in
[references/](references/README.md), and every comment the owner left on the screens from 10 to 13 Oct is in
[references/comments-2026-10.md](references/comments-2026-10.md), word for word; the agreed screens are in [screens/](screens/). Open any screen
file in a browser: each is a self-contained mock-up built from Service Desk's real records.*

## Screens, one full view at a time

| # | Screen | Reference | State | File |
|---|---|---|---|---|
| 1 | Home: one card per project, with its four desk phases then Done, and its own queue pill | Abode (01); checklist (08, 09) | Agreed; quiet line icons, "Done" for "Graduated", no New project card (13 Oct); a stress test of 5 projects and 12 waits (14 Oct) | [01-home.html](screens/01-home.html) |
| 2 | Project: the phases in order, the current one marked in place, milestones one tap down | Lifesum (02) | Agreed; phases in order (13 Oct) | [02-project.html](screens/02-project.html) |
| 3 | Team: your queue's next lines at the top, then every member's status light; each one's page shows status, responsibilities in groups, a running log drawn as a branch timeline (newest at the top, a shade per lane, now and up next), a plain-English summary behind every item, and a Working now sheet for the task in progress | Bevel (03); branch timeline (10) | Agreed; reworked 13 Oct | [03-team.html](screens/03-team.html) |
| 4 | Timeline: one line per phase run, newest at the top, standard and own milestones, iterations, stalls, every step linked to its record, confirmation in place | Structured (04) | Agreed; lighter, newest first, linked (13 Oct) | [04-timeline.html](screens/04-timeline.html) |
| 5 | Breakdown and task lists | Tiimo (05) | Folded into screen 4: a milestone's detail opens in place | — |
| 6 | Queue, grouped by kind of action, inside each project, with the response card | monday.com (06) | Drafted; "Ask for something" is not wired and not yet in S-001 | [06-queue.html](screens/06-queue.html) |
| 7 | Response card: prefilled options, recommendation labelled not preselected, two taps | Linear (07) | Drafted inside screen 6 | [06-queue.html](screens/06-queue.html) |
| — | Gate document: the case to proceed or kill at every phase gate | Owner's direction (README) | Agreed shape; part of model spec S-024 | [gate-document-discovery.html](screens/gate-document-discovery.html) |

## The pick

The lab ends when the owner picks a direction (S-001 AC43). The question is open:
[questions/P-001-design-pick.md](../../questions/P-001-design-pick.md). It carries the Chief of Staff's check of
every screen against the plan's hard limits (14 Oct): nothing scrolls sideways at 360 px, motion stops when reduced
motion is on, and each screen names the design research rows it rests on (Q-013). One gap is the build's to close:
the screens load Inter from Google, which the desk's security headers forbid, so the desk carries its own copy.

## The shared look (join-up pass, 10 Oct)

One palette, each colour with one meaning on every screen:
- coral: you;
- blue: an agent;
- green and red: pass and fail;
- purple: a change to merge;
- amber: a blocker;
- gold: phase progress.

Milestones are neutral. Every project screen has the same bottom bar: Status · Timeline · + · Team · Queue. Home sits above any one project and keeps its "Tell your Chief of Staff…" bar. Codes such as Q-012 and PR #61 come after plain words, in small monospace.

## What the screens need that the records don't hold yet

The operating model now has most of what the screens show (v3.3.0: S-022 to S-026, landing here in PR #65): the six phases with standard milestones and iterations, phase gates with the gate document, the user representative, and plain English first. Still to be specified:
- **Chief of Staff sessions recorded like pipeline sessions**, so its Working now sheet can show a start time and a cost.
- **A written plain-English summary for each recorded event**, by the Chief of Staff, stating only what the record supports. The owner's direction of 10 Oct.
- **A recorded "who has the ball" state and deploy approvals tied to the owner.**
- **"Ask for something in this project"** as a prefilled new-file link, added to S-001.

## Where design work is kept

Screens are drafted and commented on as private Claude artifacts, the links listed at the end of
[references/comments-2026-10.md](references/comments-2026-10.md). An artifact page is a working copy. Each agreed version is
saved here, with the owner's comments word for word, so later work starts from the project, not from a
conversation (model rule L-0130).

## How we work

Build one full screen at a time, from its saved reference. Put each element in the screen it belongs to. Before Design ends, run a join-up review of every screen side by side.
