# Stage HD1: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-30 against build/builder/hd1 at 8c372b0 (HD1 round 2, with draft 3 merged).

---

Verdict: PASS

**Summary for the owner:** Nothing failed or was skipped. On a narrow phone, the headers now work the way you chose, "As built". "Since you last looked · <time>" and "Milestones by phase · <count>" each stay on one line. When their button doesn't fit beside them, it sits on its own line just below, at the right. When it does fit, it stays beside: with a short time like "08:00" on a narrow phone, and with every form on a wider one. This round changed only tests and records, not the page. What you approved in round 1 is unchanged, and I found nothing that regressed. All of it is reversible.

**What I checked** (read-only; the worktree is clean at 8c372b0):

- **Ruling and spec.** I read decisions/questions/P-001-headers-button.md (A, "As built") and AC98 draft 3. The words "beside where the row has room, as at 414 px and at 360 px with "· 08:00"; otherwise on its own line just below, at the right" match the build.
- **No change to the page.** `git diff 374c7d9 HEAD -- src` is empty, so the round-1 comparison still holds: 288 captures, every style change limited to AC98's roles, 0 px sideways scroll, contrast at least 5.97:1.
- **My own Chromium measurements at 360 px** (row 328 px wide, light and dark):

  | Heading | Heading width | Button | Row height |
  |---|---|---|---|
  | "Since you last looked · 08:00" | 192 px | beside "Mark as seen" | 38 px |
  | "· yesterday, 14:00" | 271 px | under | 62 px |
  | "· 11 Oct, 10:00" | 249 px | under | 62 px |
  | "Milestones by phase · 8 of 16 reached" | 235 px | under | 49 px |
  | "Milestones by phase · none tracked yet" | 241 px | under | 49 px |

  - Every heading is a single 20 px line box.
  - At 414 px every form has its button beside it.
  - "none tracked yet" wrapped to two lines before HD1; now it is one line.
  - None of these forms scrolls sideways (0 px), in light or dark, at 360 or 414 px.
  - There were no page errors.
- **Tests.** `node --test ../tests/desk/*.test.mjs` gives 1558 pass, 0 fail.

**Non-blocking:** none new. Round 1's notes still stand: a very long project name now takes three lines as a 28 px title, and the `--soft` contrast follow-up is still open.

**Four best before/after captures for the owner** (each image shows before on the left and after on the right):
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/cmp/r2-home-today-360-light-0.png: "· 08:00" with "Mark as seen" beside it, at 360 px.
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/cmp/r2-home-date-360-light-0.png: "· 11 Oct, 10:00" with the button just below it, at the right.
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/cmp/r2-none-tracked-360-light-0.png: "Milestones by phase · none tracked yet", two lines before and one line after.
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/cmp/home-414-dark-440.png: at 414 px, dark, heading and button on one line.

Round 2's own captures, with my measurements in report-r2.json, are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/r2/.
