# Options: home as a priority list of the owner's actions (round 8, answer 24)

Built over mockup v41 (`../timeline-v41-craft.html`). `source/build.py` writes `phone.html` (v41 with `source/pr.css` and `source/pr.js`, each option switched on by the phone's hash: `p=A|B|C`, `y=<px>`, `light` or `dark`); `source/page.py` writes `index.html`, using the round 8 options pages' stylesheet (`../options-r8/source/pages.py`).

## How the order is set

Priority is set from what the records carry, in this order: 1, what it holds up (a whole phase first, then the most milestones); 2, a gate or a stop before a question, since a stop halts the work until you answer; 3, the longest wait. So: the widget's readiness check (holds up the Discovery phase, 9 days), then Stop card 5 (3 milestones, a stop), then the three questions of PR #446 by how many milestones each holds up (3, 2, 1).

Not in the records: no record ranks the owner's actions, gives a due date or says how long an answer takes. The widget's phase comes from its gate (its `feeds` is empty).

## Home as a priority list of your actions

- In v41: In v41 home groups what waits on you by project (round 4, answer 11), the longest wait first (answer 12), each project's waiting rows inside its glass card. Five things wait across two projects, so the order you should act in is spread over two cards and not said anywhere.
- Touches: All three set aside round 4 answer 11 (grouped by project) for the waiting rows: the projects stay, below the list, with their strip and their line (round 8, answer 19), and the waiting rows leave them. Round 4 answer 12 (longest wait first) becomes the third key of the order, after what it holds up. Each row keeps its event line (round 8, answer 22). No old project cards come back (round 4, answer 7): B's larger card holds an action, not a project.
- Recommended: A. One numbered list across projects, each row saying why it sits where it does ("Holds up the Discovery phase · waiting 9 days"), with Answer and Go to it on every row: it is the priority list you asked for, read top to bottom, and the projects follow it.
- Phones: v41 as it is, Grouped by project (`#light`); v41 as it is, Dark (`#dark`); Option A, One priority list (`#p=A.light`); Option A, Scrolled: the projects below (`#p=A.light.y=640`); Option A, Dark (`#p=A.dark`); Option B, Do this first, then the rest (`#p=B.light`); Option B, Dark (`#p=B.dark`); Option C, Tiers (`#p=C.light`); Option C, Dark (`#p=C.dark`)

## Checks

At 393 and 360, light and dark: no console errors, no sideways scroll, order 4, 0, 3, 1, 2 (NEEDS indexes) in every option. Answer opens the waiting card; Go to it opens the project. Contrast of the new text on the glass, lowest: light 6.18 (event line), dark 5.37 (event line); the reasons 10.8 or more.
