# Board mockup: screenshots

Screenshots of [../board.html](../board.html), the Orchestrator's proposal for the "waiting on you" screen as a
board (the owner's request of 19 Oct: [../../references/owner-request-2026-10-19-board.md](../../references/owner-request-2026-10-19-board.md)).
Taken with Playwright Chromium at device scale 2, each one of a single labelled frame.

## Version 4: lanes left to right, two options to pick from

The owner, after version 3: "I wanted Left to right lanes. Not vertical". On every width the lanes now run left
to right: Waiting on you | Kicked back | Done. The page shows two phone options side by side, both with version
3's behaviour (Done at once, confirmed with GitHub per step, kicked back on a mismatch after about 5 minutes).
`board.html?view=1` or `?view=2` opens one option full screen, as on a phone; the shots below are taken that way.
The state shown is five waiting, one kicked back and two done, from items that waited on the owner on 19 Oct
(#135 and two board questions join version 3's five); the times are examples.

- **Option 1, all three lanes at once.** Three columns share the screen. Compact cards: the title clipped to
  three lines, a tiny "Service-Desk #n" line, one short button ("Verdict ↗", "Merge ↗", "Answer ↗"). A tap on the
  card opens a sheet with the whole title, why, the step and "Done ✓"; press and hold drags a card into Done.
- **Option 2, swipe between lanes.** Each lane is 85% of the screen, the next peeking in at the right; the lanes
  snap. Tabs with counts jump between them. Press and hold a card and drag it to the right edge, where a
  "Done ✓" target appears, or tap "Done ✓".

| File | State | Viewport |
|---|---|---|
| option1-360-v4.png | Option 1: five waiting, one kicked back, two done | 360 × 740 |
| option1-414-v4.png | Option 1: the same | 414 × 896 |
| option1-dark-414-v4.png | Option 1 in dark mode | 414 × 896 |
| option1-sheet-414-v4.png | Option 1: a tap on a card opens its sheet (after one card was dragged to Done) | 414 × 896 |
| option2-360-v4.png | Option 2: the Waiting lane, Kicked back peeking in | 360 × 740 |
| option2-414-v4.png | Option 2: the same | 414 × 896 |
| option2-mid-swipe-414-v4.png | Option 2 part-way between Waiting on you and Kicked back | 414 × 896 |
| option2-drag-414-v4.png | Option 2: a card dragged to the right edge's "Done ✓" target | 414 × 896 |
| page-1024-v4.png | The page: the two options side by side, labelled | 1024 × 900 |

Checked for version 4 at 360, 414 and 1024, light and dark: the page never scrolls sideways, and the only thing
that does is option 2's lane strip; every button, link and fold is at least 44 × 44 px. Option 1's columns are
104 px wide at 360 and 122 px at 414; option 2's lanes are 85% of the screen. Tried: a touch long-press drag into
Done in each option, the sheet's "Done ✓", the tabs, a sideways swipe on a card (it scrolls the lanes and does not
drag), #135's verdict bringing its Step 2 card, and no script errors.

Versions 1 to 3 drew the lanes stacked; their files are kept below for the record.

## Version 3: Done at once, then confirmed

The owner's clarification: "My intention is that if i move a card over and then pass my verdict or update - the
desk takes that in stride and it accepts my statussing. The check is intended to then confirm - at whatever
cadence - is currently capable. If the desk status shows a mismatch between what github shows, then that gets
marked and the card gets captured into the "kicked back" column."

- **No "Checking…" state.** A card moved to Done is done at once and leaves the count. It shows "Done ✓ <time>"
  with a grey ✓, a grey "confirming with GitHub" note and Undo; once GitHub agrees, the note and Undo go and
  the ✓ turns green.
- **Confirmed per step.** Merge: the pull request is merged. Verdict: `reviews/<n>/owner.md` is on the branch,
  and a new "Step 2 of 2: merge" card appears. Answer: the answer file is on main, or a pull request adding it is
  open. Deploy: the run is no longer waiting.
- **Kicked back.** If GitHub still doesn't show the step after about 5 minutes, the card leaves Done for
  "Kicked back", with the reason and its one button, and counts again.
- A line under Done: "Your Done marks are kept on this phone; other devices show them once GitHub confirms."
- Kept from version 2: the layout, the top-line counts, the name note, and kicked-back cards going to Done again.

| File | State | Viewport |
|---|---|---|
| a-five-waiting-414-v3.png | (a) Five waiting on you | 414 × 896 |
| c-two-marked-done-414-v3.png | (c) #126 and #127 marked done, each "confirming with GitHub", not counted | 414 × 896 |
| d-kicked-back-414-v3.png | (d) #128 kicked back; #126 and #127 confirmed | 414 × 896 |
| g-130-after-verdict-414-v3.png | (g) #130's verdict confirmed; its Step 2 card waits for the merge | 414 × 896 |
| wide-414-v3.png | The wide frame on a phone: the phone layout | 414 × 896 |
| wide-1024-v3.png | Three columns: #130 and the question waiting, #128 kicked back, #127 marked done, #126 confirmed | 1024 × 900 |

## Version 2: "Kicked back"

The owner chose option A, with a change: a card GitHub still doesn't show done after about 5 minutes moves to a
lane of its own, "Kicked back" (the owner's word, theirs to confirm; their other example was "Hung up"), and
never back to "Waiting on you". On a phone it sits above "Waiting on you", only when it has cards; at 700px and
wider the board has three columns: Waiting on you | Kicked back | Done.

| File | State | Viewport |
|---|---|---|
| a-five-waiting-414-v2.png | (a) Five waiting on you; no Kicked back lane, since it is empty | 414 × 896 |
| d-kicked-back-414-v2.png | (d) #128 in Kicked back with why (it went through "Checking…" first, since replaced); #130 and the question waiting; #126 and #127 confirmed | 414 × 896 |
| wide-1024-v2.png | Three columns: #130 and the question waiting, #128 kicked back, #127 checking, #126 done | 1024 × 900 |

## Version 1

Kept for the record. (d) here shows version 1's rule, since replaced: the card went back to "Waiting on you"
with "Still waiting".

| File | State | Viewport |
|---|---|---|
| a-five-waiting-360.png | (a) Five waiting on you: #126, #127, #128, #130 and the M3A wording question | 360 × 740 |
| a-five-waiting-414.png | (a) the same | 414 × 896 |
| b-mid-drag-414.png | (b) #127 mid-drag; Done pinned to the foot of the screen | 414 × 896 |
| c-two-checking-414.png | (c) #126 and #127 in Done as "Checking…", not counted | 414 × 896 |
| d-still-waiting-414.png | (d) version 1: #128 back in "Waiting on you" with "Still waiting" | 414 × 896 |
| e-nothing-waiting-414.png | (e) Nothing waiting on you | 414 × 896 |
| f-dark-414.png | (f) State (a) in dark mode | 414 × 896 |
| wide-1024.png | Version 1's two lanes side by side (state c) | 1024 × 900 |

## Checks

Checked at 360, 414 and 1024 wide, light and dark: nothing scrolls sideways, and every button, link and
fold is at least 44 × 44 px. Drag was tried with a mouse and with a touch long-press; a quick swipe on a
card scrolls the page and does not drag. In version 3, the demo was run through: a card marked done counts out
at once with the confirming note, then is confirmed; #130's verdict brings its Step 2 card; #128 is kicked back,
marked done again, undone back into Kicked back, and then goes to Done by itself; Undo on a marked card returns it.
No script errors. In version 2, the demo was also run through: a card kicked back,
dragged to Done again, "Checking…", then confirmed; Undo returns a card to the lane it came from; and a
kicked-back card moves to Done by itself when GitHub confirms it. Times shown in Done are examples.
