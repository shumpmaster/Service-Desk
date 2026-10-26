# M3G stage QW3: the Design reviewer's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/builder/qw3 at 226bc81 (QW3's work over a0437b8).

---

Verdict: FAIL

In plain words: QW3 works. Blocking questions come first and say which cards wait on them. Held-up cards say what they wait on, and each number opens its question. A held question sits after its project's blockers. The sheet lists the cards waiting on it, and focus lands where it should. The suite passes: 1444 of 1444. Home, the project pages, the Timeline and Plan are pixel-identical to the base. The one blocking problem is size. The approved picture draws "Answer first…" and "Waits on…" at 12 px. The Definer's "Settled from QW3's build", point 3, measured 13 px, and the build follows it. So these lines are now bigger than the lane cards' own titles. That 13 px is also the only reason the held line wraps to three lines at 360 px. At the picture's 12 px it takes two lines, as drawn. So the "known open point" is really this measuring error, not a choice for the owner.

**Blocking**

B1. "Answer first" and "Waits on" are drawn at 13 px (`--t-body`). The approved picture draws them at 12 px (`--t-small`). This breaks checklist item 1 (P-001-m3g-picture.md, A: "build it as drawn"), item 27 (desk-v2 README: "board text is 11 and 12 px") and item 8 (type roles).
- **Evidence from widths.** I measured the picture's text at 2× and compared it with real IBM Plex Sans in Chromium at 12 and 13 px:

  | Text in the picture | Picture | Plex 12 px | Plex 13 px |
  |---|---|---|---|
  | "Waits on question 1" | 211 | 212 | 230 |
  | "Waits on questions 2 and" | 269 | 270 | 293 |
  | "Waits on a question being" | 275 | 276 | 299 |
  | "Answer first · cards 4 and 10 wait on it" | 409 | 412 | 446 |

  - The 414 dark frame gives the same: 411 px.
  - The same frame's section question title, "Should Plan show estimates…", is 576 px against 579 at 13 px, weight 500. So the font renders the same way, and the "8% narrower" text is simply 12 px (12/13 = 0.92).
  - Cap heights agree: the "A" of "Answer first" is 17 px tall in the picture, the same as a 12 px lane title in the build. The build's 13 px "A" is 18 px.
  - Files: docs/design/builds/m3g-picture/m3g-f1-board-360-light-full.png and -414-dark-first-screen.png.
- **What it does to the board.** I listed every text size inside lane and strip cards at 360 light:
  - Before QW3, everything there was 11 or 12 px (title `.v2-tt` 12 px, weight 500).
  - The "Waits on" link is now the only 13 px text in those cards, bigger than the card's title.
  - In the section, "Answer first" is 13 px, weight 400, almost level with the 13 px, weight 500 question title. The picture has it one size down.
- **Cause.** AC96's "Settled from QW3's build", point 3, says "18 px from ascender to baseline at 2×, as the titles' 13 px". That fits the section titles, not the lane titles, which are 12 px both in the picture and in the build. Point 3's own intent is "the picture's size, which governs the look" (AC95), and the owner's ruling outranks the spec (pack, "order of authority"). So this goes to the Definer as a correction to point 3, not to the owner.
- **Fix.** `.v2-afirst` and `.v2-waits` go back to `--t-small`, as built at ceb432d (src/public/sandbox.css, the two rules added at about line 640). Keep f9bd815's other parts and the focus change. Re-check that each link is still at least 24 px tall.
- **Knock-on.** At 12 px the held line takes two lines at 360 px, matching AC95's "may wrap to two lines" and the picture. That also clears the stage's own capture check, which currently ends "8 failed". I re-ran tests/desk/tools/glance-shots.mjs with prefix `qw3-`: every 360 capture reports "Waits on a question being asked in your session" on 3 lines.

**Non-blocking**

N1. Already there before QW3 (from QW1): "Also asked in your session: answer in one place" is 13 px (`.v2-body`), but the picture draws it at 12 px (505 px against 508 at 12 px). File it as a follow-up under item 1.

N2. In the sheet, the uncounted entries put the code in Plex Sans, e.g. "#999: not waiting on you now" and "queue/P-404-stop-1.md: …". The entry-first order is the spec's (AC96, "What counts"), and the spec outranks the checklist. But item 19 asks for codes in small monospace. A note for the Definer.

N3. A row in "Cards waiting on it" shows the full title, uncut. One fixture card runs to six lines at 414 (qw3-blocker-sheet-414x896-dark). Board titles are cut at three lines (reading (d)). The sheet list is not drawn in the picture or ruled, so this is a note only.

N4. Already there before QW3 (the strip, from G2/QW2): shorter cards in the Kicked back strip spread their rows to match the tallest card. Measured on the base: the Gamma card's kind line sits at 34 px, against 25 px on the Alpha card. QW3's "Waits on" row is spread with them, which is why one box is 33.8 px tall against 26.8. Follow-up only.

**What holds (evidence: my own renders with Playwright and Chromium, fonts confirmed loaded: IBM Plex Sans 400/500/600 and IBM Plex Mono 400)**
- **Frames 1 and 3, with the held-place ruling.**
  - Alpha's section reads 1 of 12, 2 of 12, then the held question. Beta reads its kicked-back blocker 1 of 6, then its held question (P-001-m3g-held-place, B).
  - "Answer first" sits under the lock or clock line and before the choices.
  - "Waits on" sits under the meta line, numbered lines before the held one.
  - The numbers are right: cards 5 and 7, 7 and 8, 4 and 10.
- **Colour (items 10, 13, 14, 25).** Both lines are `--ink`: 17.6:1 in light, 16.3:1 in dark. The sheet's grey words are 6.4:1 in light and 7.7:1 in dark. No new colour; the accent is untouched.
- **Targets (item 11).**
  - Every "Waits on" box is at least 26.8 px tall and every link 27 px.
  - On a wrapped "questions 1 and 2" line, the two links overlap by about 8 px where the lines meet. A hit test shows each still keeps a full 24 × 24 area: link 1 is 121 × 27, link 2 is 33 × 27.
  - The sheet rows are at least 24 px.
- **Taps and loops.**
  - "Waits on question 1" opens Alpha-pick's sheet ("… · 1 of 12 waiting"). "and 2" opens Alpha-second's. Escape closes.
  - The held tap scrolls to the held card and focuses it, with Alpha alone shown too. With the keyboard, the focus ring shows (2 px solid ink, light and dark); with a finger, no ring.
  - The loop and edge cases are covered in tests/desk/ac96-qw3-blockers.test.mjs.
- **Sheet list.** "Cards waiting on it" comes under Unblocks and Context, then the uncounted entries in their words. The question itself is dropped; "can't read: card 7" is shown.
- **Width (item 12).** Nothing scrolls sideways (scrollWidth − innerWidth = 0) on Waiting, Alpha alone, Home, Plan (`#/work`), the Alpha, Beta and Gamma pages, and the Timeline, at 360 and 414, light and dark.
- **Unchanged screens.** I rendered from a0437b8 and from 226bc81 with the same fixture (qw2BusiestState). Plan, three project pages and the Timeline are pixel-identical in all 8 width and theme combinations. Home matches too, apart from timing noise that also appears between two tip runs.
- **Other checks.** No new motion: the scroll is instant (item 24). Fonts are Plex (item 23).
- **Every project.** QW3 draws only where a question has a `Blocks:` line (AC96, "Every project"). The service-desk and poom fixtures have none, and the ac88 dark-mode test walks those screens and passes. Suite: `npm --prefix src test` gives 1444 pass, 0 fail.

**Questions for the owner**

Q1. This is only needed if the Orchestrator or the Definer disputes B1's measurement; otherwise B1's fix settles it. Plain wording to put:

"On a narrow 360-pixel Android screen, the line 'Waits on a question being asked in your session' wraps to three lines in a lane card. On every iPhone (375 pixels or wider) it takes two. The picture you approved draws it at 12 px, which fits two lines even at 360. Which do you want?
- (A) The picture's size, 12 px, words unchanged. **Recommended**: it is the picture as you approved it, and it matches the other board text.
- (B) Keep the larger 13 px and shorten the words to 'Waits on a question asked in your session'. That is two lines at every width I measured (360–430), and it keeps the 'asked in your session' wording used elsewhere.
- (C) Keep 13 px and allow three lines at 360."

Measured fits at 13 px in a 145 px lane (360 px screen):

| Wording | Lines |
|---|---|
| current | 3 |
| "…a question asked in your session" | 2 |
| "…a question in your session" | 2 |
| "…the question asked in this chat" | 2 |

At 12 px, the current words take 2 lines. At 375, 390, 393, 414 and 430 px, every wording takes 2 lines at 13 px. I advise against "this chat": the desk says "your session" everywhere else (place line, quiet line, held line), so it would be a second name for the same thing (item 19).

**Captures for the owner** (re-take them after B1's fix)
1. qw3-busiest-360x740-light: **the one to show beside the picture**, docs/design/builds/m3g-picture/m3g-f1-board-360-light-full.png.
2. qw3-one-alpha-414x896-dark
3. qw3-held-sheet-360x740-light: the list, and the entries in words.
4. qw3-blocker-sheet-414x896-dark

They are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw3/shots/. My own re-renders are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/shots/, my probe scripts in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/tools/, and the suite log at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/suite.txt.
