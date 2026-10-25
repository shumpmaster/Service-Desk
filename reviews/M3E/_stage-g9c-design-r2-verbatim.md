# M3E stage G9c: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g9c at 1b8b472 (G9c's work over 55cff67).

---

Verdict: PASS

**Summary.** Round 2 does what the owner chose in P-001-glance-g9c-row.md (A): every "Still reading" line now has a row to itself. That holds at 360 and 414 px, in light and dark. The other quiet lines still sit side by side where no "Still reading" line comes between them; the agents capture shows this. Since round 1, the only change to how the page looks is that "Still reading" lines which used to share a row now start their own, so whatever is below moves down by one 28 px row. I found nothing blocking. The full suite passes: 1368 tests, 0 failing.

Scope: build/builder/g9c at 1b8b472, compared with round 1 at dca5e9d. The worktree is untouched (`git status` is clean). The only changes under src/public/ are:
- sandbox.css:583, a new rule `.v2-qread { flex-basis: 100%; }`;
- sandbox.js:2564, which adds that class to the grey line (`class: 'v2-ql v2-qread'`), with the red lines unchanged;
- a comment-only change in lib/home.js.

`.v2-qread` is used nowhere else in src/.

**How I checked**
- Read the Builder's 28 refreshed captures and the readout of measured rows.
- Copied 1b8b472 into the scratchpad and re-rendered my 12 round-1 states and G9b's 7 states (76 renders). I compared each pixel by pixel with my round-1 renders from dca5e9d.
- Ran the build check: PASS, "36 page modules in step".
- Ran the full suite (`node --test tests/desk/*.test.mjs`): 1368 tests, 1368 pass, 0 fail.

**Evidence by checklist item (part A)**

- **Item 1, P-001-glance-g9c-row.md A (each on its own row):**
  - First paint (g9c-waiting-first-paint, all four variants): four rows, each line alone and full width of the box (328 of 328 px at 360, 382 of 382 at 414). In round 1, "Still reading Alpha… Still reading the portfolio…" shared a row.
  - In my xr-ext-mixed at 360, round 1 had "✕ Can't read Gamma in this opening" and "Still reading Beta…" on one row; round 2 puts "Still reading Beta…" on a row of its own.
  - In g9b-waiting-failed-held at 414, round 1 had "Can't read Alpha" and "Still reading Service-Desk…" on one row; round 2 separates them.
  - In my xr-signed-out-pf-held at 414, round 1 had "✕ Signed out — reload to sign in" and "Still reading the portfolio…" on one row; round 2 separates them.
  - These pairs are at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/r2c.png.
- **Item 1, the spec's reading (C) that the other quiet lines still wrap side by side:**
  - In g9c-waiting-agents (all four variants), "With the agents: 1 ›" and "Nothing waiting: Alpha" share a row, followed by two "Still reading" rows.
  - In g9c-waiting-recording, "Being recorded by the automatic job: 1" starts a new row after "Still reading the portfolio…", which is what "nothing shares its row after it" requires.
- **Item 2, the spec:** the change matches the G9c row as of draft 3: one CSS rule beside `.v2-ql`, the exact `G9C_ONCE` and AC88's walks in the passing suite, and the forced rewrites named in their own commits.
- **Items 8, 10, 13 and 14 (type, contrast, colour):** unchanged from round 1. The grey line is still `--ink2`, 12 px, weight 400, with no icon, at 6.40:1 contrast in light and 7.72:1 in dark. No `--bad` or `--you` colour was added.
- **Item 6, every project:**
  - service-desk and poom render in every capture.
  - md-extremes, in my xr-ext-first-paint: five rows. "Still reading Epsilon-with-a-very-long-project-name-that-wraps…" takes 2 lines at 360 px and is not cut.
- **Item 12, width:** no "scrolls sideways" and no ", cut" anywhere in the Builder's readout or in my 76 renders.
- **Nothing else changed since round 1:** these render byte-identical in round 1 and round 2:
  - all of g9b-home-*, g9b-waiting-every-failed, g9b-waiting-signed-out and g9b-waiting-one-checking;
  - xr-cantshow-held, xr-home-failed-held, xr-one-alone-held and xr-waiting-signed-out-start.

  The remaining differences fall into two groups:
  - **Expected moves:** xr-ext-first-paint, xr-ext-mixed, xr-waiting-pf-held-cards, xr-signed-out-pf-held at 414, and g9b-waiting-failed-held at 414, where a "Still reading" line now has its own row.
  - **Clock jitter:** xr-ext-waiting 414, xr-home-signed-out-mixed, xr-one-alone-signed-out 414 dark and xr-page-older. These differ only in the clock-driven bands I traced in round 1 ("HH:01" against "HH:02", seconds-ago ages).

  The page row keeps its own age: "checked 0 s ago" (or "44 s ago"), never the stalest project's "3 min".

**Blocking findings:** none.

**Non-blocking findings:** none new. The known `--soft` contrast follow-up is not touched.

**Questions for the owner:** none.

**Captures for the owner**
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9c/shots/g9c-waiting-first-paint-360x740-light.png: the ruled change on every opening, four "Still reading" lines each on its own row, the portfolio's last.
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9c/shots/g9c-waiting-agents-360x740-light.png: the other quiet lines still side by side ("With the agents: 1" beside "Nothing waiting: Alpha"), with the "Still reading" rows under them.
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/out-r2/xr-ext-mixed-360x740-light.png: the same state as the picture the owner saw with the question, with the red "Can't read Gamma" and the grey "Still reading Beta…" now on separate rows and the long name wrapping uncut.
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9c/shots/g9c-waiting-failed-held-414x896-light.png: at the wider width too, the grey line no longer sits beside the red one.
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/r2c.png: round 1 beside round 2 for three states, so the owner can see exactly what moved.
