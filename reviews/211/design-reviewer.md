Verdict: PASS

Design review of M3D stage 6b (S-001, AC89 (m), specs/S-001.md:7963-7968). I judged dc6325c..1946e27 against dc6325c, and did not look at 18fa305's merge of f5cac07. I did not see the Builder's summary. I worked in detached worktrees at 1946e27 and dc6325c, checked that both were unchanged, and removed them. I kept one montage and the reports, and changed nothing in the repo. About 6.9 GB is free.

Nothing is blocking. Two non-blocking findings, both on the failed-load screen.

Scratch folder: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m6b-h/

TESTS
- Locked page tests (ac80-board, ac81-bar-type, ac48-62-63-look), ac88-dark, and the stage's own ac89-loading-taps, plus ac89-after-md3, md-sandbox and page-app: 107 of 107 pass.
- Full suite (`node --test tests/desk/`): 1126 of 1126 pass. Log: m6b-h/full-suite.txt
- Two existing cases were rewritten, not dropped, each citing its spec line:
  - ac89-after-md3.test.mjs:503-505 (the failed-load markup);
  - md-sandbox.test.mjs:633-636 (index.html: only the two `hidden` attributes are new, and the CSP is unchanged).

WHAT PASSED (Chromium, 360×740 and 414×896, light and dark)
How I checked: a load-state harness, m6b-h/lp.mjs. It holds `sandbox.js` to show the desk still loading, aborts it to make a failed load, or opens `?exp=004` or `?exp=001`. Reports: m6b-h/lp-*.json. Montage: m6b-h/states-6b.png (failed load 360 light and 414 dark; loading 360 dark; EXP-004 360 light; EXP-001 360 dark).

- **While the desk loads:**
  - Base showed the old header ("Service Desk", "Checking…") and the footer ("Median answer time … reading…").
  - At head both are `display: none` in all four variants; only the view's "Checking…" shows.
  - No stylesheet overrides `hidden`: style.css's `header#top` sets no `display`.
  - Once the desk starts, `html.sb header#top, html.sb footer#foot { display: none }` keeps them hidden.
- **Failed load:**
  - The words show once, in a `role="alert"`. Base said them twice, in the header and the body.
  - It's drawn on mockup v2's ground: `html.sb.v2-page`, sandbox.css linked, #fff light and #0f1012 dark.
  - It uses the desk's own render-error look (`.sb-stale`, sandbox.js:4342): 12 px Plex in `--block`, 6.85:1 light and 6.91:1 dark.
  - The title is "Service Desk — The desk couldn't load. Reload to try again.", and nothing scrolls sideways.
- **`?exp=004` and `?exp=001`:**
  - Both show the header with "Service Desk" and their title ("EXP-004 — prefilled links", "EXP-001 — CPU and wall time") in all four variants, contrast 15.3:1 or more.
  - Their footer ("reading…"), which no view reads now, is hidden.
  - They keep style.css's look, as before.
- **EXP-004's panel words:**
  - Q4 now reads "Q4: on each project's page, open "Details" and record its CI line."
  - Both v3 and v2.5 pages draw that fold (`detailsNode`, sandbox.js:1277 and 1343), and it carries "CI on <branch>: …", so the words hold for every project.
  - Its test is ac89-loading-taps.test.mjs:109.
- **A tap never goes to an experiment tab**, checked at unit level. m6b-h/swcheck.mjs runs sw.js in a vm with made-up window lists:

  | Windows open | Base | Head |
  |---|---|---|
  | only `?exp=004`, `?exp=001#/` or `?exp=` | focused and messaged that tab | `openWindow(<target>)`, the tab untouched |
  | experiment tab, then desk | the experiment tab | the desk window |
  | desk, then experiment tab | the desk window | the desk window |
  | another query, another origin, or none | — | as before |

- **Nothing else moved against dc6325c.** I ran a JSON compare on main (292 of 292 captures identical), signed-out (4 of 4), the render failure (8 of 8) and the three tap links (4 of 4 each). Diffs: m6b-h/seq/cmp-*.txt

NON-BLOCKING
- N1. The failed-load message is a single 12 px meta line with a "! " prefix, at the top of an otherwise empty page (states-6b.png, panels 1 and 2). It matches the desk's render-error screen, so part A items 8, 10, 14 and 27 are met. But the screen's only message is in the smallest role, and it has no way out the way the render-error screen has its "Home" link.
- N2. It says "Reload to try again." but offers no control for it. A Home Screen app on iOS (standalone) has no reload button or pull to refresh, so the owner would have to quit and reopen the app. The words date from stage 1. This stage redrew the screen, which made it the moment to add a Reload button.

FOLLOW-UPS
- F1 (Definer): whether the failed-load screen gets a Reload control and a larger type role for its message (N1, N2).
- F2 (Definer, low): the loading "Checking…" still sits on style.css's ground (#fafafa light, #121212 dark, system-ui 16 px) until the desk starts, so the ground and font change when it does. (m) asks only that the header and footer not show, so this is noted, not a finding.
(Recorded verbatim by the orchestrator from reviews/M3D/_stage-6b-design-r1-verbatim.md.)
