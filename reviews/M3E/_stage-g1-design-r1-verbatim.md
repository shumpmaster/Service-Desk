# M3E stage G1: the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/g1-home at ae09c2d (base e1cfa2e).

---

Verdict: PASS

**In plain English.** G1 does what the owner ruled for Home, and in substance it matches the accepted glance-emphasis mockup. "N need you" is now the largest text under the title. Each settle time and each "can't be undone" sits on its own line with a clock or a lock. A stopped project's line moves to the top of its tile, in dark ink with a clock, and is not red. A project the desk can't read now says "✕ Can't read since HH:MM" in red in the tile's corner. The tile's foot then gives only the reason, in grey, so the time is said once. The red tile border is gone. "Since you last looked" can no longer say "Nothing new" while a project is unread. "At work:" names the agent at work in dark ink. Each "Since" entry is cut at two lines. I found nothing that breaks a ruling, the spec or part A. Three points go to the Definer as questions; none blocks.

Design review of G1, "After the glance audit" (S-001 AC91 (a) to (e); AC71 and AC82 changed). Branch build/builder/g1-home at ae09c2d, compared with e1cfa2e. I did not see the Builder's summary: I read the diff, not the commit body. I changed nothing in either repository. Both trees were exported with `git archive` into scratch, and `git status` in /home/user/sd-g1 is clean at ae09c2d.

All captures are in the reviewer's scratch folder (outside the repository), g1-design/:
- **Full pages, first screens and JSON dumps** (rendered text, size, weight, colour, ground and contrast for every text run, plus a G1 element probe): `before/` and `after/` (9 states × 360×740 and 414×896 × light and dark), `before-x/` and `after-x/` (3 more states), and `before-el2/` and `after-el2/` (element shots of each tile, the briefing, and briefing + "Since", with the tab bar hidden).
- **Scripts** (outside the repository): g1-scripts/cap.mjs and probe.js, derived from the branch's tests/desk/tools/glance-shots.mjs, with the after tree's fake desk and glance-fixtures used for both commits.
- **States:** count-mix3 (past, coming and undo lines), count-mix, stall, unread-nothing-waiting, unread-cards-waiting, unread-from-open, signed-out, signed-out-later, ext, ext-unread, ext-unread-open (Delta and the long-named Epsilon failing), text.

TESTS
- Full suite `node --test tests/desk/` at ae09c2d: 1166 of 1166 pass. Log: g1-design/full-suite.txt
- The rewritten locked cases keep their strength; each is rewritten for the spec's change and labelled:
  - ac69-72: AC71 is now ink, never --you or --bad, and sits under the name row.
  - ac82: the briefing's `due`, the corner "Can't read since HH:MM", the "Reason:" foot, and the two-line cut.
  - ac85 AC89 (j): the past-due line on its own line.
  - md-sandbox: the corner in --bad.
  - The stage-8 guard's G1 exception (ac88-dark) pins each declaration, before and after, in each theme, on its own element, and asserts the excepted set is exactly that.
- The new tests/desk/ac91-glance-home.test.mjs covers (a) to (e), including the can't-draw tile and "Not read since" with one and with two projects unreadable.

EVIDENCE BY CHECKLIST ITEM

**(a) Count and due lines.** Items 1, 2, 8, 14, 27; P-001-glance-count.md A; mockup 03.
- Computed styles (count-mix3-360x740-light.json, probe.brief):
  - "8 need you" is 600 18px/23.4px IBM Plex Sans in ink (#18191c light, #ecedef dark); before it was 500 15px.
  - It is the largest text under the title. The title stays 600 24px.
  - The ◆ is 18×18. The ◆, the count and "Waiting ›" are all centred at y=178.
- The parts line is now just "8 waiting · oldest 8 d".
- The due lines, in order, are each 500 12px/16.2px ink with the clock or lock in ink:
  - "One question was due to settle itself 7 Oct, 10:00"
  - "One question settles itself Thu 03:20"
  - "One can't be undone"
- Code: sandbox.css:734-744, sandbox.js:695-716, lib/home.js:155-168.
- The Builder's flagged choices hold:
  - The 18 px ◆ centred with "Waiting ›" is "sized to it" (AC91 (a)) and is how mockup 03 draws the count line.
  - 500 12px/1.35 is AC91 (a)'s "500 12 px --ink". All sizes and weights are on the v2 scale (item 27).
- "Signed out" and the other briefing forms keep 500 15px (AC91 (a) C).
- Pairs: owner-pairs/01-*.

**(b) Stall line.** Items 1, 14; AC71 changed; P-001-glance2-palette.md; mockup 01.
- Order of the tile's children after: v2-thd, then **v2-ln.v2-stall**, then sb-sumbox. Before, the stall line was last, under "Next".
- Style: 500 12px/16.8px ink (#18191c / #ecedef), clock in ink, 16.99:1 light and 15.15:1 dark. It is not vermilion and not --bad.
- On tiles with no stall it is `display: none` (count-mix3 probe).
- Code: sandbox.css:810-814, sandbox.js:518-531, 889-890.
- Pairs: owner-pairs/02-*.

**(c) Can't read.** Items 1, 4, 5, 13, 14; mockups 02a and 02b.
- **Corner, nothing waiting** (unread-nothing-waiting, unread-from-open, signed-out): "✕ Can't read since 10:01".
  - 500 12px, #b3162a light (6.62:1) and #ff6b78 dark (6.45:1), ✕ in --bad.
  - Before it read "Can't read", grey 400.
  - The foot now reads "Reason: network error: …" in 400 12px --ink2 (6.18:1 and 7.2:1), so the time is said once.
- **Cards waiting and read failing** (unread-cards-waiting): the corner keeps "◆ 6 wait on you", and the foot keeps the red "✕ Can't read since 10:01: …".
- **Borders:** every tile's border is rgb(231,231,234) in all states. The `.v2-tile.bad` rule is gone (no remaining use in src/public). The can't-draw tile takes the usual edge and gets a ✕ line (sandbox.js:975-978). Only the test covers it; I could not force a draw error in the browser.
- **Signed-out briefing:** the clock (vi-clock) became the ✕ (vi-bad) in --bad, and the words are kept.
- **"Since you last looked":**
  - "✕ Not read since 10:01" when a read had succeeded earlier in this opening.
  - "✕ Not read in this opening" when no read succeeded in this opening (unread-from-open, signed-out).
  - Both use `.v2-ql.bad`: 6.85:1 light, 6.91:1 dark.
  - "Nothing new since …" never shows while a project can't be read.
- The Builder's "Not read in this opening" vs "Not read since" follows AC91 (c) (draft 2, N11). Mockup 02b's "Not read since 16:00" came from a fixture that had read first, and the build gives the same words in that case.
- Pairs: owner-pairs/03-* to 06-*.

**(d) At work.** Items 1, 14; P-001-glance-at-work.md A; mockup 09.
- "At work:" stays --ink2 (#5c5f66 / #a2a5ac).
- "Builder on P-003" is now in ink (16.99:1 / 15.15:1).
- "No agent run recorded since 8 Oct", "No dispatch log: not used here" and "At work: not available" stay wholly grey.
- Code: lib/home.js:661, sandbox.js:895-896.
- Pairs: owner-pairs/07-*.

**(e) Two-line "Since" entries.** Items 16, 1; P-001-glance-since.md A; mockup 06.
- `.v2-e1` max-height went from calc(3 × 1.45em) to calc(2 × 1.45em) (sandbox.css:763). Client height is 38 px (was 57) and the fade class `over` is set on the ext entries.
- A two-line entry that fits gets no fade.
- "12 more in the last 7 days ›" is kept.
- At 360 and 414 the result matches mockup 06.
- Pairs: owner-pairs/08-*.

**Items 10 and 25 (contrast, both themes).** No text run under 4.5:1 in any of the 120 captures, before or after (report.json in each folder). The lowest among the changed texts is 6.18:1.

**Item 12 (width).** scrollWidth equals clientWidth in all 120 captures, including the long-named Epsilon with the wider corner at 360 (owner-pairs/09-*: the name wraps, nothing overflows).

**Item 6 (every project).** service-desk (text, stall) and poom's placeholder (Personal-Org-Operating-Model in every state) render. md-extremes (ext, ext-unread, ext-unread-open) also renders. No page errors.

**Item 23 (typeface).** Plex Sans 400/500/600 and Plex Mono 400/500 load. Every changed run is IBM Plex Sans.

**Item 3 (Waiting is real).** Counts and the badge are unchanged in every state.

**Items 9, 11, 15, 24.** G1 adds no text box, no tap target, no sheet and no motion.

**Nothing else moved.** I diffed every rendered text run (text, size, weight, colour) between the two commits at 360 for all 12 states: g1-design/text-style-diff.txt. The only differences are the G1 changes above, plus:
- Clock noise: "checked N s ago", "Every project read N s ago", and one minute in the "Median answer time" line, which varies between runs of the same build.
- The portfolio and cap rows' minute changes with when the read failed.

FINDINGS (none blocking)
- **N1 (already there before G1, unchanged): the Home group head wraps.** "Your projects · active ◆ 6 waiting on you 1 can't be read 2 ⌄" puts its chevron on a second line at 360 (unread-nothing-waiting-360-dark-screen1 pair). The mockup's all-home-unread draws the same. There is no sideways scroll, so item 12 holds.

OPEN QUESTIONS
- **Q1 (Definer): should the briefing's own can't-read lines carry the ✕?** The briefing's "Can't read <project> since HH:MM" lines stay red with no ✕, before and after; the Builder flagged this. They match:
  - mockup all-home-unread-after, which draws them that way;
  - AC92 (a)'s kept-red list;
  - AC91 (c), whose list of places to change does not name them.

  But S-001:2516 says "every can't-read line carries the ✕ (AC91 (c))". The words already say "Can't read", so item 13 holds. Which reading does the Definer intend? I don't pick one.
- **Q2 (Definer, perhaps the owner): should "Since you last looked" say when its list is incomplete?** When some lines exist, the list shows them and says nothing about the unreadable project's missing ones:
  - unread-cards-waiting: Alpha can't be read and Service-Desk's lines show;
  - signed-out-later: every project fails, and two entries from the earlier read still show.

  AC91 (c) changes only the empty line, and the mockup draws the same, so this is not a finding under item 4: no quiet words appear, and the briefing and tiles say "can't read". Should the list say it is incomplete?
- **Q3 (Definer): which words when two projects fail differently?** With two unreadable projects, one read earlier in this opening and one never, `sinceUnreadWords` (lib/home.js:675) says "Not read in this opening". That is a defensible reading of AC91 (c), whose words don't settle the mixed case. Confirm the intended words?

BEST BEFORE/AFTER PAIRS FOR THE OWNER (labelled BEFORE e1cfa2e / AFTER G1 ae09c2d), all in g1-design/owner-pairs/, each also at 414 and in the other theme:
1. 01-count-and-due-lines-360-light.png: the count and the three due lines.
2. 02-stall-tile-360-light.png: the stall line, moved and in ink with a clock.
3. 03-cant-read-tile-360-light.png: "✕ Can't read since HH:MM" in the corner, "Reason:" at the foot.
4. 04-cant-read-with-cards-waiting-360-dark.png: the corner keeps what waits, the foot stays red, and "At work" is in ink.
5. 05-not-read-since-414-light.png: "Nothing new since …" replaced by "✕ Not read since 10:01".
6. 06-signed-out-360-dark.png: the signed-out ✕ and "Not read in this opening".
7. 08-since-two-lines-360-light.png: "Since" entries cut at two lines.
8. 09-long-name-cant-read-360-dark.png: the extreme long name with the new corner.
