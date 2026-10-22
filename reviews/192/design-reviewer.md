Verdict: PASS

Stage 8, design review round 2, at f634c86 (range bd4097d..f634c86). The branch head is still f634c86.

The chosen design is now the desk at its plain address, and nothing blocks it. The one blocking problem from round 1 is fixed everywhere it showed: the "unblocks" words on the owner's Team tile are the right size again. Each screen now starts at the same height as the approved mockup, and the web-commit note has a calm eye mark in place of a cross. Beyond the removed "Sandbox" line and the tab title, the desk differs from the trial view only in the hold and merge sheets' new "whole record" fold and these fixes. Old icon and notification addresses still open the right screen. Nothing here is irreversible.

**What I ran**
- **Worktrees:** fresh detached worktrees at f634c86, ec715da (round 1) and bd4097d, all removed at the end with clean status.
- **Captures:** the dr8-h harness. f634c86 at `/` is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr8-h/cap-r2/ and .../dr8-h/cap-r2-tap*/; f634c86 through `/?sandbox` in .../dr8-h/cap-r2old/ and cap-r2old-tap*/. Both are compared with bd4097d's trial view in .../dr8-h/cap-base/.
- **Scope of captures:** main, extremes, sdq, unread25 and letters; the six portfolio states from the 6b fixtures; signed-out; a forced render error; and three taps (gone key, pull request, decision card). All at 360×740 and 414×896, light and dark.
- **Comparison:** `cmp8.mjs` checks every element's computed style and size, the text and the tab title.
- **Tests:** the locked page tests ac80-board, ac81-bar-type and ac48-62-63-look, plus ac88-dark: 52 of 52 pass. The locked files are unchanged since ec715da. The full suite: 1,059 of 1,059 pass (.../dr8-h/suite-r2.txt).

## Round 1 items

- **B1 (blocking) is fixed.** `span.sb-unb-t` no longer differs from bd4097d in any capture of any fixture. That includes the sdq and letters Team tiles: no size change on the tile, its list or its rows, so no re-wrap. Round 1 had 24 differing captures in main, 120 in extremes, plus sdq and letters.
- **Non-blocking 1, top spacing, is fixed.** Measured at 360 and 414, light and dark (.../dr8-h/top-r2.txt):

  | Screen | Frame | Mockup | f634c86 | ec715da |
  |---|---|---|---|---|
  | Home, Waiting (first row) | H1, 1 | 14 px | 14 px | 4 px |
  | Project page title | 5 | 70 px | 70 px | 60 px |
  | Plan title | 11 | 23.6 px | 23.6 px | 13.6 px |
  | Timeline pinned head | 7b | 0 px | 0 px | 4 px |

  - Team and the detail screens, which no frame draws, also start at 14 px.
  - Pinned parts still sit flush at the top when scrolled (Team's phase line and the Timeline head, at 300 and 900 px).
  - Home's and Waiting's titles sit at 21.6 px against the frames' 23.6 px. Their header row is 44 px, where the frames' "⋯" button makes it 48. That button was never built, so this is not a finding.
  - Capture: .../dr8-h/crops/home-top-r2.png.
- **Non-blocking 3, the mark, is fixed.** The web-commit note now carries the eye, the same mark as the blast-radius line above it, in ink, 12 px, in both themes. Tested with `webCommitsToDefault: false` on question, numbered-question, gate and decision sheets: no low contrast, no undersized targets, no sideways scroll. Captures: .../dr8-h/sheets-r2/web-letters-*, crop .../dr8-h/crops/eye.png.

## Nothing else changed against bd4097d

Across all f634c86 sets the only differences are:
- every screen's top padding to 14 px, from 0 on Team and detail screens and 4 px on v2 screens;
- the Timeline head's −14 px margin;
- the marker gone;
- the tab title "Service Desk — <state>";
- the hold and merge sheets' "The whole record" fold.

Nothing else, apart from three harness artefacts:
- known full-page capture races in the running log, which I checked by direct probe in round 1;
- a "5 h 2 m" against "5 h 3 m" waiting time in letters;
- an empty line my marker stripping leaves on the tap-gone capture, whose text is otherwise identical.

The portfolio states, signed-out, render error and taps match line for line, apart from the padding. In every set: no "sandbox", "trial view" or "candidate" in rendered text, nothing scrolls sideways, no text under 4.5:1, text boxes 16 px.

## Old addresses and taps

- **Taps**, at plain and old addresses, all four variants:
  - `/?open=` and `/?sandbox&open=` for a pull request and a decision card both land on the card's sheet with "Opened from a notification";
  - a key that no longer waits lands on `/#/p/Service-Desk` with "That no longer waits on you".
  - Text identical to bd4097d.
- **Old routes:** `?sandbox` with hash routes, `?sandbox=1`, `sandbox` after `open=`, the old Queue address (to `/#/waiting/Alpha`), the v2.5 pipeline and the Actions-usage tap all land on the same screen as the plain address. Text and history length are identical, and every one ends at `/` (.../dr8-h/oldaddr.mjs).
- All 612 main captures loaded through `/?sandbox` differ from bd4097d only in the expected ways above.

## Non-blocking follow-ups

1. The copy route's placement, round 1's non-blocking 2, is with the planner.
2. Carried from stage 7: the seam between a Plan bubble's top row and its ground, and "Cost: –" on the Working now sheet.
3. Correcting my round 1 note: the one extra colour on dark sheets is the sheet's scrim, rgba(0,0,0,0.58), which is mockup v2's own dark `--scrim`. Not a finding.

## Open questions
None.
(Recorded verbatim by the orchestrator from reviews/S-001-desk-v2/_build-8-design-round2-verbatim.md.)
