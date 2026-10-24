Verdict: PASS

Stage 4 round 2 (build/builder/m3d-4 at 7349555, against c4b66e9) fixes my round-1 blocking finding. When the Chief of Staff has several pieces of work under way, tapping any row marked "now" now opens that row's own piece, with its name in full. Nothing else on screen changed. Nothing blocks the stage. Two small wording points are left, one of them older than this change, plus the chevron note from round 1. Nothing is irreversible, and I fixed nothing.

## B1 from round 1: fixed (part A items 2, 15 and 16; AC49 as changed)

I checked it on the stage's four-open fixture (`cosLanes()`, Lanes-four) at 360 and 414 px, light and dark.
- **Each row's sheet:** all four "now" rows link to …/chief-of-staff/now/<lane>. Each opens a "Working now" sheet naming its own piece in full, for example "Chief of Staff: Made-up piece C, open with three others".
- **Focus:** after Escape, Close and a tap outside, the sheet closes and focus lands back on the row that was tapped. That is 12 of 12 checks at each of the four sizes and themes.
- **After a reload:** on now/four-c line 1, the sheet reopens naming piece C and takes focus; Escape puts focus back on piece C's row. This holds in all four sizes and themes.
- **The old version, for comparison:** c4b66e9 at 360 light shows the bug. Rows A, B and C all open piece D's sheet ("names its piece": false on 9 of 12 checks).
- Crop: CROPS/r2-now-sheet-after-reload-360-light.png

## Other addresses (part A items 4 and 19)

- **Plain /now** with four pieces open still opens the piece started last (D), as before.
- **A piece still open** (fifth-a) gets its full Working now sheet.
- **A piece handed back** (fifth-b) reads "Chief of Staff: Made-up piece B · handed back 02:00". That is true, in words, with a Chicago time.
- **A lane that doesn't exist** reads "This entry is no longer in the running log the desk reads." It shows no other piece, so it is honest.
- Crop: CROPS/r2-now-handed-back-414-dark.png

## Nothing else moved (JSON compare of computed styles, sizes and text, against c4b66e9)

| Setup | Captures identical |
|---|---|
| lanes | 728 of 728 |
| main | 716 of 716 |
| md-extremes | 1260 of 1260 |
| sdq | 268 of 268 |
| letters | 183 of 184 (the other differs only by a one-minute clock tick) |

- The "handed back" wording now comes from a shared helper, `cosPieceWords`. Inside that function `t(...)` was already `whenText(...)`, so the words are unchanged, as the compare shows.
- No sideways scroll, no contrast failures and no page errors anywhere.
- Tests at 7349555 all pass, 87 of 87: ac80-board, ac81-bar-type, ac48-62-63-look, ac88-dark, ac49-lanes-after-md3, ac67-90-team-after-md3, j13-sessions and ac49-branch-log.
- A caveat on coverage: my capture script doesn't follow the new now/<lane> addresses, so those sheets were checked by the probe above, not by the compare.

## Findings (none blocking)

- **N1 (round 1's note, unchanged; item 1).** "10 idle ›" keeps its "›" when open, while Home's group heads switch their chevron. Not touched by this commit, and still not blocking.
- **N3 (new; item 19).** On a handed-back piece, the sheet is titled "Working now" above "… · handed back 02:00". The words are true, but the plain /now sheet in the same case says outright "… is not working now: the work this sheet was about has ended."

## Follow-up (older than this change)

- An owner's log address with /now (for example #/p/Lanes-owner/team/owner/now/Q-902) reads "You is not working now: …". It is the same at c4b66e9. No row links there; you only reach it by a typed or stale address.

## Files

Crops are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-m3d-b/crops/ (called CROPS above). Logs:
- the per-setup compare and check logs: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-m3d-b/s4r2/log/ (cmp2-*.txt and qa-*.txt);
- the test run: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-m3d-b/r2-tests.txt.

The probe is /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-m3d-b/nowprobe.mjs. The worktrees are removed and the other PNGs deleted.(Recorded verbatim by the orchestrator from reviews/M3D/_stage-4-design-r2-verbatim.md; round 1 is reviews/M3D/_stage-3-4-5-design-r1-verbatim.md, its stage 4 part.)
