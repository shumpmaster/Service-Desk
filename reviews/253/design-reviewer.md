Verdict: PASS

The Design reviewer's verdicts on HD1 (PR #253), verbatim: round 1 at 374c7d9 (FAIL), round 2 at 8c372b0 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: FAIL

**Summary for the owner.** One thing blocks this, and it needs your answer, not more building. On a 360 px phone, "Since you last looked · yesterday, 14:00" and "Milestones by phase · 8 of 15 reached" still don't fit on one line beside their buttons ("Mark as seen", "↑ start at the foot"). They are short by about 40 px, even with the time or count shrunk to 12 px as you asked. The Builder kept each heading on one line, as you asked, and moved the button onto its own line underneath, at the right. Your picture drew the button beside the heading, and the spec says "beside". So your two answers ("as drawn", and "fits one line") can't both hold on a narrow phone. I'm not picking between them, so I'm asking you below. On a 414 px phone everything sits on one line, as drawn. Everything else matches what you approved, in light and dark, at both widths:
- titles are 28 px and sheet titles 20 px;
- section heads are 15 px and all dark;
- sub-heads are 13 px and group heads 12 px;
- the small parts you wanted kept small are unchanged.

There is no sideways scrolling anywhere, every new look passes contrast comfortably, and no words, counts or colours changed. Nothing here is irreversible.

**Blocking**

- **B1: where the button goes when the split heading and its button don't fit on one line at 360 px.** This is a conflict between two of your rulings, so it goes to you as a question (my charter's escalation rule; checklist item 1).
  - **The rulings:** P-001-headers-approve.md (B, "as drawn": picture images 1 and 4 show "Mark as seen" and "↑ start at the foot" beside the heading) and P-001-headers-wrap.md (A, "so each heading fits one line").
  - **The spec:** S-001 AC98, "Two headings on one line", and HD1's row both say "one line at 360 px, beside "Mark as seen" … "↑ start at the foot"".
  - **Measured in Chromium at 360 px** (room 328 px, gap 8 px):
    - "Since you last looked · yesterday, 14:00" is 271 px; with "Mark as seen" (86 px) it needs 365 px.
    - "Milestones by phase · 8 of 15 reached" is 235 px; with "↑ start at the foot" (125 px) it needs 368 px.
    - So "beside" can't be met with the words unchanged.
  - **What the build does:** src/public/sandbox.css:1499-1500 (`.v2-sh.v2-shsplit` wraps, `margin-left:auto`) and sandbox.js:857-866 / :1482. The heading is one 20 px line box. The button drops below it, on the right.
  - **What it costs in height:** the Since row grows from 38 to 62 px and the Milestones row from 28 to 49 px. As an estimate, not measured: if the heading wrapped with the button beside it (the look option B of the wrap question would have given), the row would be about 49 px.
  - **At 414 px:** both rows are on one line with the button beside (Since row 38 px, Milestones row 30 px).
  - **Spec record:** the Builder's commit f088b0d says it "reported" this. No spec change records it. Once you rule, the Definer needs to bring AC98 into line. If you accept the build as it is, no code changes.

**Evidence by checklist item** (my own Playwright and Chromium captures: 36 states from all three fixtures, before at 2c20c9a and after at HEAD, at 360×740 and 414×896, light and dark; 288 captures with computed-style dumps)

- **1 and 2, rulings and spec:** I matched every element before and after and diffed the computed styles. The only changes are AC98's roles:
  - screen titles 600 24 → 600 28 px (`.v2-title`, plus Team, member and Details `h1`);
  - sheet titles 600 18 → 600 20 px (`.v2-stitle`, `.sb-sheet-t`; the gate title still fits its two-line clip);
  - section and sheet-block heads → 600 15 px in `--ink`: `.v2-shw`, `.v2-hgt`, the Plan groups, "More detail", "Questions for you", `.v2-bh`, the targets' names, Team and Details `sb-h2`, Team sheet `h3`;
  - sub-heads → 600 13 px, each keeping its colour: lanes, `.v2-gn`, `.v2-runh`, the goal labels in `--ink2`, `sb-h3`;
  - `.v2-subh` → 600 12 px;
  - `.v2-kq` "Kicked back · none" → 500 13 px, still `--ink2`;
  - the split tails are 400 12 px `--ink2`, the clock time in Plex Mono 400 12 px, and "in the last 7 days" and the counts in Plex Sans.
- **Section head colour:** every head reads rgb(24,25,28) in light and rgb(236,237,239) in dark.
- **Kept small:** these are byte-identical before and after: `.v2-tpn` 600 12, `.v2-tn` 600 15, `.v2-fold`, `.sb-eyebrow`, `.v2-sn`, `.v2-seen`, `.v2-mono`, and the field `.v2-label` at 500 11. No other element changed.
- **3, 4, 5, 7, 13, 14, 16 to 22:** no words, counts, order or colour meanings changed. The only text differences are timing ("checked 0 s ago").
- **6, every project:** service-desk, poom (including the v2.5 page and "Not used by this project") and md-extremes all render with no page errors.
- **8, type roles:** the hierarchy is title 28 > section 15 > sub-head 13 at 600 > body and rows 13 at 400/500.
- **10 and 25, contrast:**
  - the lowest new look is 5.97:1 in light (the Timeline goal label on its card) and 7.41:1 in dark;
  - the split tails are 6.4:1 in light and 7.72:1 in dark;
  - every `--ink` head is 16:1 or more.
- **11, tap target:** "Mark as seen" is unchanged at 86×28.
- **12, width:** sideways overflow is 0 px on every page and sheet, in all 288 captures.
- **23, typeface:** Plex Sans 400/500/600 and Plex Mono 400/500 loaded before measuring.
- **27, sizes:** the only new pairs are 600 28 and 600 20. Every size is in {28, 24, 20, 18, 15, 13, 12, 11}.
- **28 and 32, Home and Timeline:** "Since you last looked", its time and "Mark as seen" are still there. The Timeline's band, compact title and Technical/Context/Why are unchanged.
- **Tests:** `node --test ../tests/desk/*.test.mjs` gives 1558 pass and 0 fail. The worktree is unchanged.

**Non-blocking**

- N1: a very long project name (md-extremes "Epsilon-with-a-very-long-project-name-that-wraps") now takes 3 lines at 28 px instead of 2. It doesn't overflow. This comes from the size you chose; it's noted, not a finding.
- N2: my captures did not reach Plan's card label (it needs a recorded plan), "Kicked back · n" with cards, the deploy sheet, or "Your weekly figures". Those rest on the Builder's AC98 test by selector, not on my eye.
- N3: sub-heads share 13 px with the rows under them and differ only by weight. An opened phase's group heads (12 px) are smaller than its rows (13 px). Both are as you ruled; not a finding.
- N4: the known follow-up on the `--soft` colour's contrast is unchanged.

**Question for the owner** (asked, not picked): on a 360 px phone, the two split headings and their buttons don't fit on one line. Which do you want?
- A. As built: the heading on one line, with the button on its own line below it, at the right (rows 24 and 21 px taller). On 414 px everything stays on one line.
- B. The button stays beside the heading, and the button is made smaller at 360 px (a shorter label or an icon). That changes a control's words or look, so it would need a picture first.
- C. The button stays beside the heading, as drawn, and the heading wraps onto two lines at 360 px (the look you turned down in the wrap question).

**Four best before/after captures** (each file shows before on the left, after on the right):
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/cmp/home-360-light-440.png: "Since you last looked" at 360 px, with the button moved under the heading.
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/cmp/home-414-dark-440.png: the same at 414 px, dark, everything on one line.
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/cmp/project-sd-ms-360-dark-0.png: "Milestones by phase", run heads and group heads at 360 px, dark.
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/cmp/member-360-light-0.png: a Team member's page (screen title 28 px, heads 15 px), a screen the Builder didn't capture.

All my captures and the style dump (report.json) are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/out/. The viewport-only shots of the Timeline, Waiting, Plan, Details and the question sheet are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/vp/. The capture script is /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv/tool/shots.mjs.

## Round 2
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
