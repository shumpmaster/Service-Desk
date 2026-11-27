# For whoever changes the operating model: session names, context use and a handover flag

*Written by the Chief of Staff's design session (session_01QBwHGLabYiZK6jrjfzcfBm) on 27 November 2026, from the owner's round 8, answer 28 (decisions/questions/P-005-design-round-8.md): "And I want to add an automated session naming and handover required flags. I understand many things might need operating model changes." The design session changes no spec, status, governance or pipeline file; this is a proposal for the owner and the building session to rule on, alongside docs/design/requests/2026-11-26-timeline-records.md (items 15 and 16).*

## What this means for the owner
Mockup v44 names every AI session after what it set out to do ("Following the second plan through its checks"), not "CoS 14 Nov", and flags a session that must hand over ("Handover needed: ending with work open"). Both are examples in the mockup, because no session records them today. For the desk to show them for real, each session has to write three small things in the lines it already keeps, and the desk has to read them. You also choose one thing: whether a finished handover should appear in your priority list as "Start the next session".

## What the design shows (v44)
- **A plain name for each session**, made from what it set out to do, with the day it began small after it. A short form on the link tag on each row ("Plan checks · 14 Nov"); the full name in the link bubble, the at-work row and its sheet, home's project line and the Context view. Library: SessionName.
- **A "Handover needed" flag** with why: its context (memory) nearly full ("context 91% used"), or ending with work open ("ending with work open: the second plan waits on your stop-card answer"). On the session's at-work row and its sheet, its link bubble and home's project line. Library: HandoverFlag.
- **Home's priority list** takes a handover only once it needs you: when the session has ended and written its handover, starting the next session is yours ("Start the next session"). A session still at work is flagged, not listed.

## Proposed changes
1. **A plain name at start.** Each session writes a plain name for itself in its first session line, made from what it set out to do (a few words, no codes), and sets its session title to the same name. The building session chooses whether the session writes it or a tool derives it from the session's first "doing" line.
2. **Context use as it goes.** Each session writes its context use (a share of its window) in its session lines at each check-in and at its end. Today the end line has fields for its own tokens, context window and context peak, blank in all 49 session lines (records request, item 9).
3. **A handover-required flag, with its reason.** A session writes `handover_required: true` and a one-line reason when its context passes a threshold (for example 85%) or when it is ending with work open, and `handover_written` with the handover's path once it has written one. Clearing the flag is the next session's first line.
4. **The desk reads them.** The desk shows the name wherever it names a session, the flag where the design puts it, and adds "Start the next session" to the owner's priority list once a flagged session has ended with its handover written.
5. **Branches for the filter.** Each sprint and each pull request records the branch it lives on (records request, item 16), so the map's filter can list the phase's branches by name.

## For the owner to rule
- Whether these become part of the operating model (each is a change to what every session writes).
- The context threshold for the flag (85% is a suggestion).
- Whether a written handover joins your priority list as "Start the next session" (the design's choice), or only shows on the project line.

## The pictures
Mockup v44 and what it adds: docs/design/mockups/TIMELINE-CURRENT.md. The library cards: SessionName and HandoverFlag in docs/design/library/components/.
