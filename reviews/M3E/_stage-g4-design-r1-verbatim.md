# M3E stage G4: the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g4 at a3c6ac7 (base 524f92f).

---

Verdict: PASS

**In plain English.** G4 makes five changes, and each one matches the accepted glance mockup in substance:
- **A calm project page looks calm.** "Nothing waiting on you" is now in soft grey instead of the bold ink that "◆ 6 wait on you" uses.
- **Unrecorded runs are said once.** Two or three "ran again · why it went back: not recorded" lines become one line, such as "Design and Build ran again · why: not recorded".
- **The Timeline opens with what comes next in view.** The Now line now rests a third of the way down the screen, so the next milestone shows above it whole. Before, it sat just under the band with only "No sprints planned yet" above it.
- **A desk that fails to load has a way out.** It shows a red ✕, "The desk couldn't load." and a 44 px Reload button that really reloads the page. This holds even when sandbox.css is missing too.
- **"Your last action" and a member's page use one date form.** They read "8 Oct, 16:42" instead of "Oct 8 16:42".

G3's two follow-ups are also built. Gate cards in the waits row are now named "the Launch gate for P-004". A gate card's Done row keeps its item whole.

I found nothing that breaks a ruling, the spec or part A. Two things the owner may notice are worth a look (N1, N2):
- the new gate names in the waits row split "P-002" across lines at 360 px ("P-" / "002");
- in every fixture state, the name that tells the second gate card apart falls past the row's two-line cut.

Design review of G4, "After the glance audit" (S-001 AC91 (i) to (l); AC89 (c) and AC91 (h) after G3's reviews). Branch build/builder/g4 at a3c6ac7, compared with 524f92f.
- I did not see the Builder's summary. I read the diff, not the commit bodies.
- I changed nothing in the repository. Both trees were exported with `git archive`. /home/user/sd-g4 is clean at a3c6ac7.

All evidence is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/:
- **before/ and after/**: 22 states × 360×740 and 414×896 × light and dark, for each commit's src/public. Both use the after tree's fake desk and glance fixtures (made up, NOT real records).
  - Each capture has a PNG (full page plus `-screen1`, or the viewport only for the Timeline and failed-load states) and a JSON file.
  - The JSON holds every text run's size, weight, family, colour, ground and contrast, plus a G4 probe: page rows, ran-again lines, last action, waits-row ids, what shows above the Now line, failed-load parts, Done rows, dates and small targets.
  - Each folder has report.json.
- **States:**
  - Project pages: page-quiet, page-mix, page-gates, page-gates-one-item (no case lines), page-gates-one-item-case, page-poom, page-ext-alpha, page-ext-eps (md-extremes).
  - Timeline: timeline-opens, timeline-mix-opens, timeline-ext-opens, timeline-refresh.
  - Team: member-orch, member-cos, member-owner, team.
  - Waiting and gates: done-gates, sheet-unread-gate, waiting-gates.
  - Failed load: failed-load, failed-load-no-css.
  - Home: home-quiet.
- **tool-after/**: the Builder's tool, `node tests/desk/tools/glance-shots.mjs <out> g4-`, run on the after tree (10 states × 4).
- **scripts/**: cap4.mjs, probe4.js, dump.js, sum.py, reload.mjs and pairs.py.

TESTS
- Full suite `node --test tests/desk/` on the exported a3c6ac7 tree: 1203 of 1203 pass. Log: g4-design/full-suite.txt.
- Reload, clicked in Chromium (scripts/reload.mjs): the page loads again (index requests 1 → 2). The button takes focus. The line has role="alert".

EVIDENCE BY CHECKLIST ITEM

**AC91 (j), calm looks calm.** Items 1, 2, 8; mock 08a.
- "Nothing waiting on you" went from 500 13px `--ink` (#18191c) to 400 13px `--ink2`: #5c5f66 light, #a2a5ac dark.
  - Seen on page-quiet and page-poom, at both widths and in both themes.
  - Contrast stays well above 4.5:1 (no run under 4.5 anywhere).
- The ✓ and "checked <age> ago" are unchanged. "◆ <n> wait on you" stays 500 13px ink, and "At work now" keeps its weight.
- Code: sandbox.js:1253-1255 (`titleCls: 'soft'`), and only in the read-ok branch. "Checking…" and "Can't read" are untouched, so item 4 holds.
- Matches mock 08a.
- Pair: 01.

**AC91 (j), ran again said once.** Items 1, 5, 14; P-001-glance-ran-again.md, A; mock 08b.
- page-mix and page-ext: "Design ran again · why…: not recorded" plus "Build ran again from 14 Oct · why…: not recorded" become "Design and Build ran again · why: not recorded".
- page-gates: three phases become "Design, Build and Launch ran again · why: not recorded".
- page-quiet: a single unrecorded line keeps AC83's form ("Design ran again from 8 Oct · why it went back: not recorded").
- Type is 400 12px `--ink2`, the grey of a gap the agents fill. No coral.
- The merged line takes the first unrecorded line's place, as mock p8b does (changes.js:90-92). Recorded and "not available yet" lines are kept apart (projectpage.js:176-183). Those two cases are covered by the tests only; no fixture reaches them on screen.
- Pair: 02.

**AC91 (i), the Timeline opens with what comes next in view.** Items 1, 15; part B 32; mock 07.
- **Opened from the project page**, the Now line's top sits at 247 px (360×740) and 299 px (414×896), exactly a third of the height, in service-desk, mix and md-extremes. Before, it sat at 140 px in all of them.
- **Above Now, after:**
  - 360: MD3 "The chosen design running on the real back end" (service-desk), or MD2 (mix), whole with its Done when and "No sprints planned yet".
  - 414: two milestones (mix and ext).
  - Before, only "No sprints planned yet" showed.
- The run's shared line ("Run 2 began 8 Oct · why it went back: not recorded") shows just under Now.
- **Refresh:** scrolled to 600, then reloaded: it comes back at 600 (timeline-refresh). AC56 holds.
- **Sprint link:** the code path is unchanged (sandbox.js:3216-3227). It is covered by the tests, not captured.
- No smooth scroll: no `scroll-behavior` in the CSS (item 24).
- The screen is pixel-alike to mock 07 "after", apart from the fixture's date.
- Pair: 03.

**AC91 (k), the failed-load screen.** Items 4, 8, 11, 13, 14, 25; mock 10.
- **After, both widths and themes:** the ✕ (an SVG drawn by app.js, 16×16, stroke = `--bad`: #b3162a light, #ff6b78 dark) before "The desk couldn't load." in 400 15px Plex Sans `--ink`.
  - Text contrast: 17.58:1 light, 16.25:1 dark.
  - The ✕ is about 6.9:1 against its ground, above 3:1 for a graphic.
- **Reload** is a `<button>` of 89.8×44 in 500 15px ink on `--bg`, with a 1px `--line2` border.
- Nothing else is on the page. The title reads "Service Desk — The desk couldn't load."
- **Before:** one 12px line in red, "The desk couldn't load. Reload to try again.", with no control.
- **Without sandbox.css:** the words and the ✕ show in style.css's look (16px system-ui, ✕ in `--flag`: #b3261e light, #ffb4ab dark). Reload stays 81.8×44, and the button's text contrast is 13.61:1 or more.
- `--bad` is used only for this failure (item 14).
- No sideways scroll.
- Pair: 04.

**AC91 (l), one date form.** Items 1, 2, 5, 20.
- **"Your last action":** "Oct 8 16:42" became "8 Oct, 16:42" (page-quiet). It is a `live` span.
- **Member pages:**
  - Orchestrator: 63 dates, all in the new form, none left in J9's form, at both widths and in both themes.
  - Owner: 31 dates, the same.
  - The CoS page and the Team screen show no clock dates in these fixtures.
- "Today" stays "09:30". There is no fixture on screen for it. It is covered by the tests: ac49-branch-log.test.mjs (+"P-001: definer finished — ok, 09:30") and ac55-status.test.mjs.
- Times are in America/Chicago (`dayTimeText` with TZ).
- Home's and Team's runs are identical before and after.
- A member page is drawn again at midnight (sandbox.js:4792-4797).
- Pair: 06.

**AC89 (c) after G3, the waits row's gate names.** Items 1, 2, 16, 19.
- "the Build gate" became "the Build gate for P-002", with the item in 400 11px Plex Mono, as ids are.
- Two items at one gate: "the Launch gate for P-004 · the Launch gate for P-005".
- One item, two cards with case lines: "the Launch gate for P-004, case 1 · … , case 2".
- One item, two cards without case lines: "…for P-004, launch-1 · …for P-004, launch-2", with "launch-n" in mono.
- The row is still cut at two lines (33.6px) with the fade, and its tap is unchanged.
- See N1 and N2.
- Pair: 05.

**AC91 (h), the Done row and the unread card.**
- On the confirming card and on the confirmed row, the title is "The Launch gate, case 1 ·" with `.v2-gitem` "P-004" / "P-009" on one line (16px high) in a two-line title at both widths. This closes my G3 N4.
- The unread gate sheet already read "The card's file: not available" before G4 (same text both sides). G4 adds only its test.

**Item 3 (waiting is real), item 22 (badge).** Counts and badges are unchanged (page-* "6/8 wait on you", the same before and after).

**Items 10 and 25 (contrast).** No text run under 4.5:1 in any of the 176 after captures or the 176 before captures.

**Item 12 (width).** scrollWidth equals clientWidth in every capture, md-extremes' long project name included.

**Item 6 (every project).**
- service-desk, mix and md-extremes (Alpha and Epsilon-…-wraps) render with no page errors.
- poom's page shows only the soft row change.
- The only console errors are the intended 404s of the failed-load states.

**Items 8, 23 and 27 (type roles, typeface, sizes).**
- Fonts loaded: Plex Sans 400/500/600 and Plex Mono.
- The changed runs are 15/400 (lead), 15/500 (button), 13/400, 12/400 and 11/400 mono, all on v2's scale.
- The no-css fallback is style.css's system-ui, as (k) says.

**Item 11 (tap targets).** Reload is 44 px tall. No other new target; the waits row's link is unchanged.

**Items 9, 13, 21, 24.** No text box, no new colour meaning, no board lane change, no motion.

**Part B (26, 32) against the mockup.**
- Items 7, 8a, 8b and 10 match in substance (08a, 08b, 07 and 10 compared with tool-after/ and after/).
- The only difference is the failed-load ✕, 16px here against the mock's 18px, with the margin to match. It is not on any stated size; not a finding.

BUILDER'S CHOICES, JUDGED
1. **Earlier days read "8 Oct, 16:42", with no "yesterday" and no year:** acceptable.
   - It is what (l) names: "`dayWords` and `hhmm`", and dayWords has neither.
   - But (l) also says "AC82's form", and AC82's own `sinceWords` (home.js:84-87) says "yesterday, 15:40" and adds the year in another year. See Q3.
2. **Which screens count as "a member's page":**
   - memberPage covers each member and the owner, including the Rulings "latest:"; cosPage covers the Chief of Staff's groups and log. Correct.
   - Team cards keep J9's form, as (l) lists. Correct.
   - Sheets over the page keep J9's form; see N4.
3. **The merged line's place, where the first unrecorded line was:** correct. It is the mock's own rule (p8b) and the spec is silent.
4. **"launch-2" in mono as the fallback for one item's two gate cards with no case lines:** correct. They are AC89 (c)'s words, both cards get their own (launch-1, launch-2), and ids are in Plex Mono (AC48).
5. **"Reload to try again." dropped:** correct. (k) says "nothing else", and mock 10 shows only "The desk couldn't load." and the button.
6. **Waits-row ids breaking at hyphens:** acceptable under the spec, but visible. See N1.

FINDINGS (none blocking)

**N1 (note; item 19; AC91 (h)'s "item kept whole" by analogy).** At 360 px, "the Build gate for P-002" breaks inside the id as "P-" / "002". This happens on every page with a Build gate card (page-mix, page-gates, page-gates-one-item*, page-ext-alpha), and at 414 the row's fade cuts "P-".
- It is Chromium's break after a hyphen; `overflow-wrap: anywhere` is not the cause.
- It is pre-existing behaviour of the row: before G4, page-ext-eps at 360 already split "a merge of P-002".
- No rule covers the waits row. G3 and G4 keep the gate's item whole in its four other places (`.v2-gitem`).
- Evidence: pair 02; crops/waits-rows.png.

**N2 (note; item 16; AC89 (c)).** In every fixture state, at both widths, the second gate card's distinguishing part falls past the two-line cut: "…for P-005", ", case 2" and "launch-2". So the row does not yet tell them apart at a glance here.
- The longer names also push earlier items out: "a merge of P-002" no longer shows at 360 in page-mix.
- The spec keeps the cut and the tap ("its cut and its tap are unchanged"). The fixtures hold 6 to 8 waits.
- Evidence: pairs 02 and 05.

**N3 (note).** Member log rows now read "Q-012: waiting on you — card stop-1, 8 Oct, 12:22", with three commas in a row. These are the spec's words; not a fault.

**N4 (code only; AC91 (l)).** Sheets opened over a member's page keep J9's "Oct 8 16:48":
- the Working now sheet's Started and Last check-in (lib/sandbox.js:1543-1596);
- a handed-back piece's sheet, `cosPieceWords(piece, now, TZ)` (sandbox.js:3398).

The page under them uses "8 Oct, 16:48". (l) names Team cards and Details' views as kept but not these sheets. I could not reach them with the fixtures.

**Pre-existing, not changed by G4.**
- The known `--soft` follow-up does not appear on any changed screen.
- Nothing else new.

OPEN QUESTIONS
- **Q1 (Definer):** should waits-row ids be kept whole (as `.v2-gitem` does in the gate title) so "P-002" never splits (N1)?
- **Q2 (Definer, perhaps the owner):** with two gate cards at one gate, the part that tells them apart is usually past the two-line cut (N2). Keep the cut, or order or shorten so both show?
- **Q3 (Definer):** (l) says "AC82's form, with `dayWords` and `hhmm`". AC82's own form says "yesterday, 15:40" and adds a year; dayWords does neither. Which is meant (choice 1)?
- **Q4 (Definer):** do sheets over a member's page (Working now, a handed-back piece) take the one date form too (N4)?

BEST BEFORE/AFTER PAIRS FOR THE OWNER (BEFORE 524f92f | AFTER G4 a3c6ac7), in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/:
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/01-page-calm-row-and-last-action-date-360x740-light.png: "Nothing waiting on you" in soft grey; "Your last action … 8 Oct, 16:42".
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/02-page-ran-again-once-and-gate-name-360x740-light.png: two ran-again lines become one; "the Build gate for P-002", and the "P-"/"002" split (N1).
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/03-timeline-opens-next-milestone-in-view-360x740-light.png: the Timeline as it opens, with Now a third of the way down and MD3 in view.
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/04-failed-load-reload-button-360x740-dark.png: the 12px red line becomes ✕, "The desk couldn't load." and Reload.
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/05-waits-row-two-gate-cards-414x896-light.png: "the Launch gate · the Launch gate" becomes "…for P-004, case 1 · the Launch gate…", with case 2 past the cut (N2).
6. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/06-member-page-dates-414x896-dark.png: the Orchestrator's page, "Oct 8 16:48" becoming "8 Oct, 16:48".
