# Board mockup: screenshots

Screenshots of [../board.html](../board.html), the Orchestrator's proposal for the "waiting on you" screen as a
board (the owner's request of 19 Oct: [../../references/owner-request-2026-10-19-board.md](../../references/owner-request-2026-10-19-board.md)).
Taken with Playwright Chromium at device scale 2, each one of a single labelled frame.

## Version 2: "Kicked back"

The owner chose option A, with a change: a card GitHub still doesn't show done after about 5 minutes moves to a
lane of its own, "Kicked back" (the owner's word, theirs to confirm; their other example was "Hung up"), and
never back to "Waiting on you". On a phone it sits above "Waiting on you", only when it has cards; at 700px and
wider the board has three columns: Waiting on you | Kicked back | Done.

| File | State | Viewport |
|---|---|---|
| a-five-waiting-414-v2.png | (a) Five waiting on you; no Kicked back lane, since it is empty | 414 × 896 |
| d-kicked-back-414-v2.png | (d) #128 in Kicked back with why; #130 and the question waiting; #126 and #127 confirmed | 414 × 896 |
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
card scrolls the page and does not drag. In version 2, the demo was also run through: a card kicked back,
dragged to Done again, "Checking…", then confirmed; Undo returns a card to the lane it came from; and a
kicked-back card moves to Done by itself when GitHub confirms it. Times shown in Done are examples.
