# Design: where it stands

*Kept by the Orchestrator. Updated 10 Oct 2026. The owner's references and words are in
[references/](references/README.md); the agreed screens are in [screens/](screens/). Open any screen
file in a browser: each is a self-contained mock-up built from Service Desk's real records.*

## Screens, one full view at a time

| # | Screen | Reference | State | File |
|---|---|---|---|---|
| 1 | Home: one card per project, with its phase checklist and its own queue pill | Abode (01); checklist (08, 09) | Agreed | [01-home.html](screens/01-home.html) |
| 2 | Project: the six phases, milestones one tap down | Lifesum (02) | Agreed | [02-project.html](screens/02-project.html) |
| 3 | Team: every member's status light; each one's page shows status, responsibilities in groups, a running log drawn as a branch timeline, and a plain-English summary behind every item | Bevel (03); branch timeline (10) | Agreed | [03-team.html](screens/03-team.html) |
| 4 | Timeline: one line per phase, milestones, numbered iterations, stalls, confirmation in place | Structured (04) | Agreed, made denser | [04-timeline.html](screens/04-timeline.html) |
| 5 | Breakdown and task lists | Tiimo (05) | Open: may become the milestone's detail on the timeline instead of a screen | — |
| 6 | Queue, grouped by kind of action, inside each project | monday.com (06) | Next | — |
| 7 | Response card: prefilled options, recommendation labelled not preselected, two taps | Linear (07) | Next, with 6 | — |
| — | Gate document: the case to proceed or kill at every phase gate | Owner's direction (README) | Agreed shape; part of model spec S-024 | [gate-document-discovery.html](screens/gate-document-discovery.html) |

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

These are operating-model changes, to be specified and built before the desk can show them for real:
- **The six fixed phases, required plain-English milestones, and iteration records.** Model spec S-023, in draft.
- **Phase gates with the gate document.** Model spec S-024, in draft. The join-up review is folded into it.
- **A larger digest word budget**, so new rules fit. Model spec S-022, in draft.
- **Chief of Staff sessions recorded like pipeline sessions.** A follow-up spec.
- **A written plain-English summary for each recorded event**, by the Chief of Staff, stating only what the record supports. The owner's direction of 10 Oct.
- **A recorded "who has the ball" state and deploy approvals tied to the owner.** To be specified.

## How we work

Build one full screen at a time, from its saved reference. Put each element in the screen it belongs to. Before Design ends, run a join-up review of every screen side by side.
