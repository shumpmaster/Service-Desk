# M3E stage G9c: the Design reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g9c at dca5e9d (G9c's work over 55cff67).

---

Verdict: PASS

**Summary.** G9c does what the owner ruled, and I found nothing blocking.
- **Waiting with every project shown:** a grey "Still reading <project>…" line appears for each project whose first read is still on its way, plus one for the portfolio. Each is plain grey text with no icon. It follows the red lines and never uses the red or vermilion colour.
- **Signed out:** one red "✕ Signed out — reload to sign in" line opens the quiet lines and replaces every red line, the portfolio's included.
- **One project shown alone:** neither new line appears.
- **A project's page:** the "Nothing waiting on you" row now gives that project's own age. Before G9c it showed "checked 3 min ago" in the same state; now it shows "checked 0 s ago".
- **Nothing else changed:** Home, one-project Waiting and Waiting with every project read render the same before and after, apart from clock jitter.
- **Width:** nothing is cut and nothing scrolls sideways at 360 or 414 px.
- **One question for the owner (Q1):** the quiet-lines box puts short lines side by side. The mockup's lines each start with an icon, but the "Still reading" lines have none, so two of them on one row run together. That needs an owner call, not a fix by me.

Scope reviewed: branch build/builder/g9c at dca5e9d, diffed against 55cff67 (the spec commit for G9c draft 2). The diff under src/public/ touches only lib/board.js, lib/home.js, lib/projectpage.js and sandbox.js; no CSS file changed.

**How I checked**
- Read all 20 of the Builder's captures and the readout.
- Rendered 7 extra states on both the base tree and the branch, and re-ran G9b's 7 states on both. These were scratch copies (`git archive`) with extra states added to a copy of the capture tool; the repo is untouched, and `git status` is clean.
- Compared before and after pixel by pixel.
- Dumped computed styles: font family and whether it loaded, weight, size, colour, position.
- Ran the build check: PASS, "36 page modules in step".
- Ran the full suite (`node --test tests/desk/*.test.mjs`): 1365 tests, 1365 pass, 0 fail.

**Evidence by checklist item (part A; part B does not apply: G9c carries out owner rulings, not a mockup frame)**

- **Item 1, the rulings:**
  - P-001-glance-waiting-pending.md A. In g9c-waiting-failed-held-360x740-light.png the lines read "Nothing waiting: Personal-Org-Operating-Model", then "✕ Can't read Alpha in this opening", then "Still reading Service-Desk…". The lane keeps "Waiting on you 0 · Nothing here", which the ruling says stays.
  - -g9c-several.md A. The first paint has one entry per project in J7's order (Service-Desk, Personal-Org-Operating-Model, Alpha). md-extremes gives five separate entries.
  - -g9c-portfolio.md B. "Still reading the portfolio…" comes last of the "Still reading" lines. It is first-paint's last entry, and in my xr-waiting-pf-held-cards it follows "Still reading Service-Desk…".
  - -waiting-signed-out.md A and -g9c-signed-out-all.md A. g9c-waiting-signed-out shows exactly one quiet line, "Signed out — reload to sign in", red with its ✕. In my xr-waiting-signed-out-start, base 55cff67 showed three red "Can't read … in this opening" lines; the branch shows the one line. The code drops the can't-read, can't-show and portfolio red lines when signed out (`quietReadLines`, src/public/lib/board.js, `if (!signedOut)` and `&& !signedOut`). The text comes from page.js's `SIGNED_OUT_STATE.text`, now shared with Home's briefing (lib/home.js).
  - -page-checking.md A. In my xr-page-older, Service-Desk's page sits beside Personal-Org-Operating-Model, which was read and then failing. The base said "checked 3 min ago" (the stalest project); the branch says "checked 0 s ago" (its own read). The cropped pair is at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/c1.png.
  - -g9c-alone.md A. My xr-one-alone-held matches g9b-waiting-one-checking, and both are byte-identical before and after. In xr-one-alone-signed-out the existing line "Can't read Alpha since HH:MM: Signed out — reload to sign in" is kept; the only difference is the minute.
- **Item 2, the spec:** the change matches the G9c row: a grey `p.v2-ql` with no `still` class, no icon and no ✕; the signed-out line `p.v2-ql.still.bad`, keyed `ql:signed-out` and pushed first in `quietLines` (sandbox.js); no CSS change; AC88's want-list carries the new grey place (tests/desk/ac88-dark.test.mjs:687). Tests pass.
- **Items 3 and 4, waiting and quiet:** the lanes' counts and words are unchanged. A project still being read is now named rather than silently missing, and nothing says quiet while a project is unread.
- **Item 6, every project:**
  - service-desk: renders in every state.
  - poom: "Still reading Personal-Org-Operating-Model…" renders on one line at 360 px.
  - md-extremes: in my xr-ext-first-paint and xr-ext-mixed, "Still reading Epsilon-with-a-very-long-project-name-that-wraps…" wraps to 2 lines at 360 (width 328 px), 1 line at 414, and is not cut.
  - The can't-draw project held (xr-cantshow-held) shows "✕ Can't show Alpha" and no "Still reading" line.
  - Members Letter has no fixture yet.
- **Items 8, 23 and 27 (type):** every new line is "IBM Plex Sans" 400, 12 px, line-height 16.8 px, with `document.fonts.check` true. That matches the existing quiet lines (`--t-small`).
- **Items 10 and 25 (contrast, light and dark):**
  - Grey `--ink2`: rgb(92,95,102) on white is 6.40:1; rgb(162,165,172) on rgb(15,16,18) is 7.72:1.
  - Red `--bad`: 6.85:1 in light, 6.91:1 in dark.
- **Item 12, width:** no "scrolls sideways" in the Builder's readout or in any of my 132 renders. No new line is cut.
- **Items 13 and 14, colour:** the grey line is told apart from the red ones by its words ("Still reading" against "Can't read") and by having no ✕, not by colour alone. No `--you` (the vermilion) appears, and no new red place.
- **Item 19, plain words:** yes.
- **Nothing else changed:** these are byte-identical before and after: g9b-home-every-failed, -home-failed-held, -home-signed-out, -waiting-every-failed, -waiting-one-checking, xr-home-failed-held and xr-one-alone-held. The remaining differences (xr-ext-waiting, xr-home-signed-out-mixed, xr-one-alone-signed-out) are only clock jitter: "10:01" against "10:02", "42 s" against "43 s", "6 h 40 m" against "6 h 41 m". The crop is at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/c2.png.

**Blocking findings:** none.

**Non-blocking findings**
- N1 (capture note, not a defect): the Builder's g9c-page-own-age shows "checked 0 s ago", and one variant "41 s ago". That alone can't show the age is the project's own, because 0 s is also the youngest age. My xr-page-older pair is the evidence for the change, before "checked 3 min ago" and after "checked 0 s ago".
- No follow-ups older than G9c were found on the screens it touches, beyond the known `--soft` contrast item, which G9c does not touch.

**Questions for the owner**
- Q1 (the Builder's flag). The ruling and the existing layout pull different ways here, so I'm asking rather than choosing.
  - **What the ruling says:** P-001-glance-g9c-several.md A is "one line per project".
  - **What the layout does:** the quiet-lines box wraps its lines side by side (sandbox.css:576, `.v2-quiet { display: flex; flex-wrap: wrap; gap: 0 10px }`). Mockup v2 draws the same wrapping (desk-v2.html:129), and the spec asks for no CSS change.
  - **Why it matters now:** in the mockup and on the desk so far, each quiet line starts with an icon, which marks where a line begins. The "Still reading" line has no icon by design, so when two share a row only a 10 px gap separates them.
  - **What it looks like:**
    - At 360 px on every first opening: "Still reading Alpha…  Still reading the portfolio…" (g9c-waiting-first-paint-360x740-light.png, x16 and x134 on one row).
    - At 414 px, two projects on one row: "Still reading Personal-Org-Operating-Model…  Still reading Alpha…".
    - In md-extremes: "Still reading Alpha…  Still reading Beta…".
    - A red line and a grey one sharing a row: "✕ Can't read Gamma in this opening  Still reading Beta…" (my xr-ext-mixed-360x740-light.png).
    - Signed out at 414 px: "✕ Signed out — reload to sign in  Still reading the portfolio…".
  - **My judgement:** they stay readable. The words differ, and the ✕ and the red mark only the red line. But two grey "Still reading" phrases on one row can read as one run-on sentence, which is close to the option B the owner turned down.
  - **The options:** (a) keep as built; or (b) give each "Still reading" line its own row. Option (b) is a CSS change the spec would first have to allow (with `G9C_ONCE`).

**Captures for the owner**
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9c/shots/g9c-waiting-failed-held-360x740-light.png: the main ruled state, a grey "Still reading Service-Desk…" under the red line, with the lanes' 0 unchanged.
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9c/shots/g9c-waiting-first-paint-360x740-light.png: what every opening looks like, with the portfolio's line last and the side-by-side row Q1 asks about.
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9c/shots/g9c-waiting-signed-out-360x740-light.png, next to g9c-waiting-every-failed-360x740-light.png in the same folder: one signed-out reason against three red lines when every read fails.
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/out-after/xr-ext-mixed-360x740-light.png: md-extremes, with a red and a grey line sharing a row and the long name wrapping uncut (for Q1).
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/out-after/xr-page-older-360x740-light.png, against the same name under rev/out-before/: the page's row moving from the stalest project's "checked 3 min ago" to its own "checked 0 s ago".
