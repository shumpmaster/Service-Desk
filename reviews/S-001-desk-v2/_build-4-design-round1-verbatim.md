# S-001 desk v2, stage 4 (the question and gate sheets): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-4 at 1862e4d.

---

Verdict: FAIL

The question and gate sheets match mockup frames 3, 3b and 4 closely, and they keep the owner's rulings on buttons, recommendations, text boxes and sizes. They fail on one point. When the desk shows a question's whole file, its numbered lists lose their numbers. On a numbered question, the owner sees eleven questions with no "1." to "11.". On a file that can't be split, the line that explains why disappears from the sheet itself. That is one blocking finding, and the fix is small. Everything else is either not blocking or was already there before this stage. Nothing here is irreversible. Home, Plan, the project page, the Timeline and Team are unchanged from 99a6437. Waiting is unchanged apart from the sheets and AC85's own card lines.

Evidence base: Playwright Chromium (/opt/pw-browsers). The page came from a detached worktree at 1862e4d, its calls answered by tests/desk/fake-desk.mjs with tests/desk/ac85-fixtures.mjs, plus my variants: no user representative, no case, long text. Captures are at 360×740 and 414×896, light and dark, device scale 2. IBM Plex Sans 400/500/600 and Plex Mono 400 were confirmed loaded. Captures are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr4r/shots/, measurements in its m-*.json. The worktrees are removed.

## Blocking

**B1. The whole record drops its list numbers and bullets.** Judged against AC85 ("a fold holding the question file rendered whole (AC12)"), AC53 (the one-box fallback shows the file whole; rulebook item 2) and notes-1 note 15 (each answer under its question's number).
- Captures:
  - /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr4r/ev/numbered-fold-no-numbers-{360,414}-{light,dark}.png
  - …/dr4r/shots/letters-q-mixed-360-light-s0.png
  - …/dr4r/shots/letters-q-irrev-fold-360-light-s1.png
- Measured:
  - In P-001-design-lab-open's fold, the `.sb-record` holds 1 `<ol>` and 11 `<li>`. Both compute `list-style-type: none`, so "1." to "11." never render.
  - In P-003-mixed's fallback, shown on the sheet itself, "2. A numbered line among lettered ones." renders without "2.". The line above says the lettered and numbered lines are mixed, so the sheet no longer shows why the file can't be split.
  - The `## Context` bullets lose their bullets as well.
- Cause: the reset `:where(.v2) :where(ol, ul) { list-style: none; padding: 0; }` at src/public/sandbox.css:814 was already there. It now reaches the `.sb-record` that stage 4 puts in `.v2-sheet` (sandbox.js, `sheetList` and the fallback in `questionSheetParts`).
- Note for the fix: markdown.js also writes `<ol>` with no `start`. Restoring markers alone would show "1." in place of the file's "2.". The record has to keep its own numbers.

## Not blocking

**N1. Gate title length** (item 26, frame 4).
- The title "Launch gate: The launch review passed. The case for going live … Proceed, hold, recycle or kill?" runs 8 lines of 18/600 at 360. It fills about 330 of the sheet's 684 px; frame 4 has one line.
- It follows AC85's "<Phase> gate: <the card's question>" from the Orchestrator's card form, and base's title was just as long.
- Capture: …/dr4r/shots/letters-gate-360-light-s0.png
- Open question for the Definer: should the title be shorter than the card's whole first line?

**N2. A settle time already past still reads as future** (items 19 and 34, AC12).
- The sdq and md-extremes fixtures, with the clock at 19 Oct, give "Settles itself as A on Thu 8 Oct, 05:00 if left (per the question file: 48 hours)".
- Capture: …/dr4r/all-sdq/sdq-0-question-360-light.png
- The board card's "Settles as A · Thu 05:00" (weekday only, reads like the coming Thursday) is the same on base, so it is not new.
- Open question for the Definer: what does the line say once the TIMEOUT has passed and no default is recorded?

**N3. The two sheet rows' accessible names run words together** (item 19).
- They read "Move to Donethen answer on GitHub" and "The whole questionand the file each answer writes" (Playwright, `document.activeElement.textContent` on keyboard focus).
- The ac80-board test asserts that exact joined string.

**N4. Already on 99a6437; follow-ups to file.**
- (a) Focus does not return to the card when a sheet is opened from a card's "Answer" step and closed by Escape, a tap outside or the close button. Focus lands on BODY, the same on base. Opened from the card's title, focus does return.
  - Log: …/dr4r/keys2.mjs output in this session.
  - Likely cause: sandbox.js:1744 sets `nav.opener = card:<id>` while the step's key is `step:<id>`.
  - AC85 names "focus going back to the card", so the Reviewer may decide stage 4 owes this.
- (b) Tab leaves the open sheet (`aria-modal`) into the tab bar and the board. Sequence SSSSSSSSSSXXXXXX on the branch, SSSSSSSSSSSXXXXX on base.
- (c) The gate's "what follows" lines show raw backticks ("`Reason:`", "`Into: <Phase>`", "`approve`"); base does the same (…/dr4r/base-gate-414.png). Item 19.

**N5. Small differences from the frames.**
- The letter in "A." is weight 600; frame 3 draws the whole label at 500. This was there before stage 4.
- The words box is 89 px tall (rows=3); the mockup's minimum is 64. The README states no height, so this is not a finding under "Sized like Linear".

## What passes, item by item
- **Sizes (item 27), owner's "closest to Linear".** In every sheet capture the text sizes are only 11, 12, 13, 15 and 18 px, and the weights only 400, 500 and 600. Every text box is 16px/22.4 Plex Sans (item 9), and the viewport doesn't lock zoom. Computed values match desk-v2.html's tokens:
  - head 11/400 Mono; title 18/600; opening 15/1.45; marks 12;
  - option box padding 10/12, radius 12; option 13/500; description 12;
  - "Recommended" 11/500 on the chip colour; answer buttons 12/500, 36 px tall, radius 18;
  - rows 44 px at 13/500; sheet radius 26, padding 6/16/18, gap 12.
- **Frames 3, 3b and 4 (items 26, 33 and 34).**
  - The lock with "Can't be undone. An email can't be unsent. Never settles itself…" and the clock with "Settles itself as A on Wed 21 Oct, 13:07…" are told apart by icon and words. 13:07 is the raised time plus 48 hours, in Chicago time.
  - The eye line shows blast radius and risk. One box per option, "Recommended" on one only, and no button is picked.
  - The gate sheet shows the case opening clipped to 3.02 lines with a fade, "Read the whole case ↗", the Critic's and user representative's views, the "3 taken on, 1 skipped" line, the four choices, and Kill outlined with the lock and "Can't be undone".
  - Hold and Recycle take "Your reason". With no user representative, the sheet has no row and the card says "User rep: not needed". A missing case and Critic read "not recorded".
- **Words box.** Typed text, quotes and an ampersand reach every answer file character for character (fold captures …-q-irrev-fold-…-s2/s3). It survives a 62 s refresh, keeping scroll and focus, and survives Escape and reopening.
- **Numbered question.** Eleven boxes, one "Answer ↗". The file that can't be split keeps one box and one button.
- **Width and taps (items 11 and 12).**
  - 0 px sideways scroll in every capture, including all 6 sheets of the main fixture and 31 of md-extremes at 360, with no page errors.
  - The close is 44×44; every other target is at least 24 px (folds and links 28 px, buttons 36 px).
- **Contrast (items 10 and 25).** The lowest text in any sheet is 6.4:1. The placeholder is about 4.97:1 in light and 6.6:1 in dark.
- **Accent (items 14 and 29).** Vermilion appears only on waiting cards' kind icons and the Waiting badge, never in a sheet.
- **Board (item 21).** The gate card shows four buttons in two rows with "Critic: recycle into Design" and "User rep: reject"; questions show their lock or clock line. Against base, the only other card change is a fix: "Settles as none — these are yours and never default" is gone.
- **Keyboard.** Opening a sheet focuses the close. Escape, a tap outside and the close all shut it. Focus goes back to the card's title link, but not for the step button (N4a).
- **Unchanged screens.** I diffed 124 captures of Home, Waiting, Plan, project pages, Team and the Timeline (main fixture) between 99a6437 and 1862e4d. Every pixel and text difference is the "checked N s ago" age; nothing else changed.
- **Locked page tests.** `node --test` on ac80-board, ac81-bar-type and ac48-62-63-look (and ac85-sheets) gives 65 pass, 0 fail. `node tools/build.mjs` reports PASS.

## Open questions
1. For the Orchestrator and Reviewer: this branch edits tests/desk/ac80-board.test.mjs:95-98 and :162-167, and ac53-answer-boxes.test.mjs:218-226. My brief calls ac80-board locked. Should a builder edit it?
2. For the Definer: the questions in N1 and N2.
3. The v2.5 copy-route sheet was not captured in a browser, because no fixture project gives one a question. ac85-sheets test 65 covers it under the fake DOM.

Scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr4r/: cap4.mjs, setups4.mjs, keys.mjs, keys2.mjs, allsheets.mjs and imgdiff.txt.