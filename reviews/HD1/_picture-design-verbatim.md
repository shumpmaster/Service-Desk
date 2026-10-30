# Bigger headers: the Design reviewer's audit and picture, verbatim

Dispatched by the orchestrator on 2026-10-29 to list every header role and draw before and after (docs/design/builds/headers-picture/, made up, not real).

---

## Plain English for the owner
Nothing failed and nothing was skipped. I changed nothing in the repository; this is only a picture to approve or reject. Today most of the desk's headers are smaller than the text under them. Section names such as "Since you last looked", "Milestones by phase", "Kicked back", "The case opens" and "Your weekly figures" are 11 px, and body text is 13 px. The proposal lifts them onto sizes and weights the approved v2 mockup already uses:
- **Section and sheet-block heads** go to 15 px semibold.
- **Smaller group heads** go to 13 px semibold. These are the lane heads, each project's group on Waiting, the run heads in an opened phase, and the sub-heads in "More detail".
- **The opened phase's two group heads** go to 12 px semibold.

Every header keeps its colour, and no new size, weight or colour is added. Screen titles (24 px) and sheet titles (18 px) stay as they are. One extra picture shows them a step bigger, as an option I don't recommend. What you'd see: the screens read as clearly labelled parts rather than lists with tiny captions. Two section heads now wrap onto a second line at phone width, and a few small labels deliberately stay small. Everything here is reversible.

## 1. Inventory of header roles (computed in Chromium, 360 px, fonts loaded; colour: ink = `--ink` #18191c/#ecedef, grey = `--ink2` #5c5f66/#a2a5ac)
| Role | Where (examples) | Selector · token (src/public/sandbox.css) | Now | Places (selectors seen across 33 rendered states) |
|---|---|---|---|---|
| Screen title | Home, Waiting, Plan, project page; Team, member, Details views | `.v2-title` :574 `--t-title`; `.sb-hdr h1` :96 `--t-screen`→`--t-title` | 600 24 ink | 7 screens with `.v2-title` (sandbox.js 1089, 1812, 3130, 4699, 5503/5523/5533); `.sb-hdr` on Team, members and 4 Details views |
| Timeline's compact title | pinned head of the Timeline | `.v2-tn` :1161 (pair 600 15) | 600 15 ink | 1 |
| Sheet title | every v2 sheet (card, question, gate, PR, deploy, targets, milestone, portfolio, since, info, experiments); gate title `.v2-stt` | `.v2-stitle` :706 `--t-sheet`; `.sb-sheet-t` :533 | 600 18 ink | about 12 sheet kinds; `.sb-sheet-t` on 2 Team sheets |
| Section head, grey | "Since you last looked · …", "Milestones by phase · …", "The rest", "Not used by this project", portfolio's "Across your projects · read only", Plan groups "Service-Desk · milestones ahead" / "Not milestones yet" | `.v2-sh` :812, `.v2-shw` :813, `.v2-plh/.v2-plhw` · `--t-label` | 500 11 grey | 7 call sites (sandbox.js 851, 1148, 1153, 1467, 1491, 1785, 4593) |
| Home group head | "Your projects · active", "Done", "Closed or not run by the desk" | `.v2-hg/.v2-hgt` :845–847 · `--t-label` | 500 11 grey | 3 groups |
| "More detail" fold head | Home foot | `.v2-mds` :971 · `--t-label` | 500 11 grey | 1 |
| Waiting section head | "Questions for you · n", "Kicked back · n" (with cards) | `.v2-kh` :610 (pair 600 12) | 600 12 ink | 2 |
| Waiting empty section line | "Questions for you · none", "Kicked back · none" | `.v2-kq` :608 · `--t-label` | 500 11 grey | 2 |
| Lane head | "Waiting on you", "Done · last 24 h" | `.v2-lh` :598 (pair 600 11) | 600 11 ink | 2 |
| Board group head | project name in a lane or in Questions ("Alpha") | `.v2-grp` :654 / `.v2-gn` :655 · `--t-label` | 500 11 ink | 3 call sites; 46 instances in the busiest fixture |
| Sheet block head | "What it is", "The question", "Why it is here", "What was checked", "What you do", "The case opens", "Their views", "Cards waiting on it", "Done when", "Estimate", "Rough finish", "Miss and stop rule", "Your weekly figures", "Whether it matches a reviewed pull request" | `.v2-bh` :707 · `--t-label` | 500 11 grey | `blk()` plus 5 direct uses (about 20 headings) |
| Team / Details section head | "Who has the ball", "Responsible for", "Running log", "Waiting on you", "Activity", "Cards, last 30 days" … | `.sb-h2` :103 · `--t-section`→`--t-label` | 500 11 grey | 10 |
| Team sheet block head | "What happened", "Why", "For you" | `.sb-sec h3` :255 · `--t-section` | 500 11 grey | 3 |
| Target name | targets' sheet "V1 Missed decisions" … | `.v2-vth` :1421 · `--t-row` | 500 13 ink | 5 |
| "More detail" sub-head | "Notifications", "GitHub Actions this month" (Home and project) | `.v2-home .sb-h3` :974, `.v2-proj .sb-h3` :1127 · `--t-row` | 500 13 ink | 4 |
| Run head | opened phase "Run 2 · 8 Oct – now" | `.v2-runh` :1091 | 600 11 ink | 1 per run |
| Opened-phase group head | "Your milestones · 3", "Standard checklist · …" | `.v2-subh` :1101 · `--t-label` | 500 11 ink | 2 per run |
| Timeline band | "Design · run 2" | `.v2-tpn` :1209 (pair 600 12) | 600 12 ink | 1 per band |
| Timeline goal label | "What we're delivering", "Where we started" | `.v2-goal .v2-label` :1165 · `--t-label` | 500 11 grey | 2 |
| Plan card label | "Rough finish, in this order" | `.v2-plcard > .v2-label` · `--t-label` | 500 11 grey | 1 |
| Home tile name | "Service-Desk" | `.v2-tnm`/`.v2-ta` :851 (pair 600 13) | 600 13 ink | 1 per tile |
| Phase row (row title acting as group head) | "Design", "Build" | `.v2-sn` :1082 · `--t-row` | 500 13 ink | 4 per page |
| Labels, not headers (kept) | card kind "Question"/"Pull request" `.v2-kd`; tabs `.v2-tab`; folds `.v2-fold` ("Reached · 3", "Show choices", "The whole target", "Context · the facts behind this ask"); field labels `.v2-label`; chips; Team eyebrow `.sb-eyebrow`; Timeline "Technical/Context/Why" `.v2-bn`; Now line `.v2-nowl` | `--t-label` / mono | 11 | — |

## 2. Proposed scale, before → after
No token changes value and no step is added. Every new value is a pair mockup v2 already sets: 600 15 (`.thead .tn`, desk-v2.html:279), 600 13 (`.tl2 .nm` :337) and 600 12 (`.tph .pn` :282). AC81's test (tests/desk/ac81-bar-type.test.mjs:133–151) allows exactly these pairs, so part B item 27 (sizes 24/18/15/13/12/11; weights 400/500/600) holds.

| Level | Roles | Before | After |
|---|---|---|---|
| Screen title | `.v2-title`, `.sb-hdr h1` | 600 24 | unchanged |
| Sheet title | `.v2-stitle`, `.sb-sheet-t` | 600 18 | unchanged |
| **Section head** | `.v2-sh/.v2-shw` (Plan groups, portfolio head), `.v2-hgt`, `.v2-mds`, `.v2-kh`, `.v2-bh`, `.v2-vth`, `.sb-h2`, `.sb-sec h3` | 500 11 grey / 600 12 ink / 500 13 ink | **600 15**, colour kept |
| **Sub-head** | `.v2-lh`, `.v2-gn`, `.v2-runh`, `.v2-goal .v2-label`, `.v2-plcard > .v2-label`, `.sb-h3` | 600 11 / 500 11 / 500 13 | **600 13** |
| Opened-phase group head | `.v2-subh` | 500 11 | **600 12** (still one step under the run head, AC92 (d)) |
| Empty-section line | `.v2-kq` | 500 11 | **500 13** (`--t-row`), still quieter than the full head |
| Kept | `.v2-tn` 600 15, `.v2-tpn` 600 12, tile name 600 13, `.v2-sn`, every label in the last inventory row | — | unchanged |

The exact scratch override is /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/tools/override.css; the not-recommended titles option is in override-titles.css beside it. It sets pairs per selector rather than changing `--t-label`, `--t-section` or `--t-sheet`, because those tokens are shared with kind labels, tabs, tags, the briefing count and the figures.

## 3. Pictures
Each image shows before and after side by side, light on top and dark below, each panel 360 × 740, with the banner "Made up — NOT real · Header sizes picture, not built".
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/headers-picture/headers-1-home.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/headers-picture/headers-2-home-foot.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/headers-picture/headers-3-waiting.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/headers-picture/headers-4-project-page.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/headers-picture/headers-5-plan.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/headers-picture/headers-6-gate-sheet.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/headers-picture/headers-7-targets-sheet.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/headers-picture/headers-8-option-bigger-titles.png (the option, not recommended)

## 4. Walk-through for the owner
- **Home:** "Since you last looked" and "Your projects · active" now read as headings rather than captions.
- **Home foot:** the portfolio's head and "More detail" now match those headings.
- **Waiting:** "Questions for you" and "Kicked back" are the screen's two section heads. The lane names and each project's name in a lane are a step up. Card labels stay small, as you ruled the board may be.
- **Project page:** "Milestones by phase" is a real heading. An opened phase's runs and groups are easier to find.
- **Plan:** each project's group head stands out above its rows.
- **Sheets:** "The case opens", "Their views", "What it is" and the like are proper block headings. On the targets' sheet, each target's name and "Your weekly figures" lead their blocks.
- Titles and everything else stay as they are.

## Notes (my own review of the picture)
- **What reads better:** sheets and the targets' sheet gain the most, because block heads were the smallest grey text there. Waiting's lanes and Plan's groups scan faster.
- **Checks run:** nothing scrolls sideways at 360 or 414 px, in sheets or on screens, across 33 states (Home, Waiting, gates, project pages including the v2.5 one, Timeline, Team, member page and sheet, the four Details views, info, experiments, Plan, the milestone sheet, question, PR, gate, card, deploy, targets, weekly, since, portfolio). IBM Plex 400/500/600 loaded in every capture. Contrast is unchanged and bigger text only helps: grey 6.18:1 on the light card and 7.2:1 on the dark one, against 4.5:1 needed.
- **Wraps and crowding:** two new wraps at 360 px, both clean.
  - "Since you last looked · yesterday, 04:00" puts "04:00" on a second line beside "Mark as seen".
  - "Milestones by phase · 8 of 15 reached" goes to two lines, and its mono note "↑ start at the foot" also wraps.
  - A possible fix: keep the trailing time or count in `--t-small` (12 px) inside the head. That needs a markup split; I did not draw it.
- **Run heads:** at 600 13, a run head now looks slightly heavier than its phase row "Design" (500 13). The fallback is run head 600 12 with group heads 500 12.
- **Kept small on purpose:**
  - The Timeline's band (600 12) and compact title (600 15). At 13 px, "Build · run 1" pushed its dates onto a second line and made the pinned band taller. Frame 7b and the Timeline-formatting ruling (P-001-redesign-conflicts.md item 3) govern there.
  - Technical, Context and Why stay small grey words (P-001-timeline-labels.md).
  - Card kind labels and board buttons stay 11 px (P-001-board-layout.md; mockup v2's board text is 11/12).
  - Folds ("Reached · 3", "The whole target", "Context · …") stay: they are controls, though "Reached · 3" now looks slight under a 15 px Plan group head.
  - Field labels over text boxes stay, as does the eyebrow over Team's title, which would compete with the title.
- **Colour mismatch made more visible:** section heads were already grey on Home, the project page and Plan but ink on Waiting. At equal size the difference shows more. I did not change it (no colour changes).
- **Building it needs records first:** these sizes change what mockup v2 draws (section heads 11 px), and several frozen acceptance tests assert the current classes and sizes. Among them are ac92-glance-standard (run head 11 px), ac80/ac91 Waiting, ac85 sheets and ac97 values. So the owner's approval should be recorded as a ruling, followed by a spec that extends S-001 (AC81/AC92) and test updates by the test-author before any build. AC81's pair test itself would still pass.
- **Not run:** I did not run the repository's own test suite, because nothing was built.

## Questions for the owner (asked, not picked)
1. Do you approve the proposal as drawn: section heads 15 px semibold, sub-heads 13 px, with screen and sheet titles unchanged? Approving it replaces mockup v2's 11 px section heads for these roles.
2. Should screen titles (24 → 28) and sheet titles (18 → 20) also go up, as image 8 shows? That adds two sizes to the scale; I recommend not.
3. Should all section heads take one colour (all ink, or all grey), now that the larger size makes the grey/ink mix more visible? Today Waiting's are ink and the others grey.
4. For the two heads that now wrap ("Since you last looked · time", "Milestones by phase · count"), should the time or count part stay small (12 px) so the heading fits on one line?

Scratch scripts: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/tools/cap.mjs (render, dump and capture), compose.mjs and agg.py. Style dumps: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/raw/dump-before.json, /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/raw/dump-after.json and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/raw414/dump-after.json.
