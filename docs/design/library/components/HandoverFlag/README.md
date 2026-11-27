# HandoverFlag

A yellow **"Handover needed"** tag on a session that must pass its work to a new one, with why (v44; the owner's round 8, answer 28: "handover required flags").

- **Why** is said beside it: its context (memory) nearly full ("context 91% used"), or ending with work open ("ending with work open: the second plan waits on your stop-card answer").
- **Where**: the session's at-work row and its sheet, its link bubble, and home's project line.
- **Home's priority list** takes a handover only when it needs you: once the session has ended and written its handover, starting the next session is yours ("Start the next session"). A session still at work is flagged but not listed.
- The waiting colours (StatusMark); a 20-point tag like the others.
- An example in the mockup: one session is flagged; no record carries the flag yet. The proposal: each session writes its context use and a `handover_required` flag with its reason in its session lines (docs/design/requests/2026-11-27-session-names-and-handover.md).
