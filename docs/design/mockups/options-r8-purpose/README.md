# Options: what on the timeline serves no purpose, and what is missing (round 8, answer 10)

Built over mockup v35 (`../timeline-v35-craft.html`). `source/build.py` writes `phone.html` (v35 with `source/pp.css` and `source/pp.js`, each option switched on by the phone's hash); `source/page.py` writes `index.html`, using the round 8 options pages' stylesheet (`../options-r8/source/pages.py`).

| Item | Kind | Recommended | Records missing (for the records request to the building session) |
|---|---|---|---|
| 1. Figures said twice | Cut or merge | A. The drawings already give the share, so the words give the count once (“9 of 12 done”) and no percent; each number is said once. | None needed: every count is already on the page. |
| 2. “by …” lines | Cut or merge | A. A line stays only when it says something the event’s kind does not already say: a commit is the spec writer’s and a review the plan reviewer’s, so those go; “by you”, an unusual actor and any extra words stay. | None needed. |
| 3. The Now card | Cut or merge | A. The stop already sits at the pointer when the page opens; a blue NOW on it says the same without a second card in the wrong place. | None needed. |
| 4. What waits on you | Add | A. The count already says 4; tapping it shows the 4, each with what it holds up, how long it has waited, Answer and Go to it, and the list stays as it is. | Answering a question from the desk: no record says the desk can record a question’s answer; the Answer button is an example. |
| 5. Who is at work | Add | A. Shown where the work is, right under the stop the page opens on, it costs the band no room (round 7, answers 21 and 22, and round 8’s map fold); its sheet says who, on what, since when, and that the pipeline waits. | Whether a pipeline run is under way right now: no record says so; the desk would read GitHub’s run status. The Chief of Staff’s start and what it set out to do are in its session lines. |
| 6. New since you looked | Add | A. A small blue dot on each new row and a count on the phase heading show what changed without moving anything; the dots clear once you have seen them. | When you last looked: no record holds it; the desk would keep it on your phone. The time here (13 Nov, 11:00 pm) is an example, just after your last ruling that night. |
| 7. How long it waited | Add | A. On the row that waited: a finished wait in grey, a running one in yellow, so a slow answer shows where it happened. | None needed: the card times are in dispatch-log/2026-11.jsonl, the answers in decisions/P-005/. |
| 8. Tokens and context | Add | A. In the session’s link bubble, beside “Open in Claude”, where you already go to check a session: what it used and how full its context got. | A session’s own tokens and context peak (the end-line fields exist but are empty); a pipeline run’s tokens. The context figures here are examples. |

Records behind the options: status/P-005.toml; decisions/P-005/stop-4.md, stop-5-notes.md; dispatch-log/2026-11.jsonl; sessions/chief-of-staff/session_01QBwHGL7cLBqyQ4o1BxNuyh.jsonl (start, what it set out to do, 4 helpers, 139,766 tokens); every session end line's usage fields (empty in all 49); reviews/*/_control/*.json (a pipeline run's model and turn limit). Owner asks: decisions/questions/P-001-design-discovery.md answer 8; P-001-usage-and-context.md ruling B.

Examples, not records: when the owner last looked (13 Nov, 11:00 pm); every context figure; the question's Answer button.
