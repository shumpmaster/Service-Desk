# M3D stage 2 (S-001 after MD3): the Design reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/builder/m3d-2 at 75572bc, a narrow confirmation of round 1's B1.

---

Verdict: PASS

The focus problem from round 1 is fixed. After a reload, closing "About the phases" now puts the focus on the closed "More detail" row that holds its link, with a clear focus ring, in light and dark, at both phone widths. I also found one more sheet of the same kind, a Done row hidden under "<n> more" on the board, and it is fixed the same way. Nothing else on the page changed: 2,556 captures compared against a57ad0e match exactly in styles, sizes and text. One small point is not part of this change and doesn't block it. When a sheet is closed by a tap outside it, the focus goes to the right control but Chromium shows no ring. That already happened on every sheet before this change.

**Findings**

1. B1 is fixed. Rulebook item 15, AC89 (i) at specs/S-001.md:7898, item 25 (dark). Not blocking.
   - To test it I opened the sheet the way the owner would: the "More detail" fold, then "About the phases". Then I reloaded, then closed the sheet by Escape, by Close and by a tap outside. I ran this at 360×740 and 414×896, light and dark, with Alpha (main setup) and Service-Desk (sdq setup).
   - After the reload, focus is on Close with its ring in every run.
   - After closing, the hash goes back to #/p/<name>. The fold is still closed, and focus is on its row (`summary.v2-prow`, "Details · Agents and usage…"). Escape and Close show a 2 px ring in `--ink` (rgb 24,25,28 light; 236,237,239 dark), on screen. The next Tab goes to the Home tab, not back up to "Back".
   - On a57ad0e the same runs put focus on the page body, and the next Tab went to "Back". That is the round-1 failure, reproduced.
   - Without a reload, focus still goes back to the "About the phases" link itself, as before.
   - Results: scratchpad/dr-m3d2-c/mx-new/main-*.json and sdq-*.json; a57ad0e in mx-base/.
   - Crops (ring visible): /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-m3d2-c/crops/c-info-A-escape-{360,414}-{light,dark}.png and c-info-SD-escape-{360,414}-{light,dark}.png

2. Every other sheet that opens from a fold behaves the same. Rulebook item 15, AC89 (i). Not blocking.
   - How I found them: on every screen of six setups (main, sdq, done5, md-extremes, pf-cards, unread25), I listed each sheet link that sits in a closed fold or appears only after a fold button opens. Results: scratchpad/dr-m3d2-c/disc-*.json.
   - Only two kinds exist: each project's "About the phases", and Done rows beyond the first three under "<n> more".
   - For the Done rows I added a setup with five Done rows for Alpha (the fourth and fifth sit under "2 more"). I opened the fifth row's sheet, reloaded, and closed it all three ways, on the whole board (#/waiting) and on the Alpha-only board (#/waiting/Alpha), at all four sizes and themes.
   - After the reload, focus is on Close. After closing, "2 more" is still closed, and focus is on it with the ring.
   - On a57ad0e both boards put focus on the page body, so this was the same bug, and it is now fixed.
   - Checks that nothing else moved, in all 4 combinations: a row in the first three still gets the focus back on its own link. Without a reload (fold open), the hidden row's own link gets it.
   - Results: mx-new/done5-*.json and mx-base/done5-*.json.
   - Crops: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-m3d2-c/crops/c-dh-all-escape-*.png and c-dh-one-escape-*.png

3. Nothing else moved against a57ad0e. Part A as a whole, "No visible change" for everything outside the fix. Not blocking.
   - I ran the stage harness (my copies of cap8n.mjs and cmp8.mjs) on both commits, with fixtures from 75572bc, at 360 and 414, light and dark.
   - Every capture matched in computed style, size and text: main 620/620, md-extremes 1028/1028, sdq 224/224, unread25 208/208, letters 136/136, pf-cards 108/108, pf-x-cards 108/108, pf-q-one 84/84, pf-access 72/72, pf-fail 72/72, pf-none 72/72, signedout 4/4, boom 8/8, tapgone 4/4, tapcard 4/4, tapdec 4/4.
   - The page-error lists are the same on both commits. They are the harness's own "no button" lookups and the signed-out errors, as in round 1.
   - Outputs: scratchpad/dr-m3d2-c/seq/cmp-*.txt and log-*.txt.

4. Tests. Not blocking.
   - The locked page tests (ac80-board, ac81-bar-type, ac48-62-63-look) and ac88-dark, run on 75572bc: 52/52 pass.
   - The two test files the commit changes (ac56-moving-refresh, ac89-after-md3): 49/49 pass.
   - The diff touches only src/public/sandbox.js and those two test files under tests/desk/. No locked test file is touched.

5. After a tap outside, focus is right but no ring shows. Rulebook item 15. Not blocking, and it was already there before this change.
   - In every tap-outside run, focus is on the correct control (the fold's row, "2 more", or the row link) and on screen, but `:focus-visible` is false, so Chromium draws no ring. That is the browser's rule after a pointer tap.
   - a57ad0e does exactly the same on sheets that worked before, such as a top-three Done row or "About the phases" without a reload. So this change didn't cause it, and AC89 (i)'s "returns focus" is met.
   - Your brief asked for a visible ring on all three ways of closing. Only Escape and Close meet that.

**Follow-ups**
- Owner or Definer: decide whether closing a sheet with a tap outside should also show the focus ring, which would mean overriding the browser's rule. Today no sheet shows one, before or after this change.
- Reviewer, outside design: the commit also changes an existing test in ac56-moving-refresh.test.mjs. It now opens a link's fold before tapping the link, so the old check matches what the owner does. That looks right, but it is a change to an existing test.

My worktrees are removed. Everything else is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-m3d2-c/: the harness copies (rl2.mjs, scen-close.mjs, scen-disc.mjs, seq.sh, matrix.sh), the results, and 16 small crops (1.6 MB in all). I wrote nothing in m3d2-h or in the repository.