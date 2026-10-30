# Bigger headers plan: the Reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/definer/m3b-plan at f6c194c (AC98 and HD1, draft 1).

---

Verdict: PASS

This is a review of the bigger-headers plan (AC98, stage HD1), draft 1, at f6c194c on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only on the diff from 548031e, which touches only that file. The three answers are written in faithfully and quoted word for word, the role table is complete, and nothing regressed.

**1. Each answer is written in, and the "Answered: from the header picture" block is word for word.**
- I checked the block with the same script as before (/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/cmp.py) against P-001-headers-approve.md, -colour.md and -wrap.md. Each question, every option, each "How it was answered" paragraph and each ruling match. The filing commit 05846b7 exists.
- **Approve, B:** titles go to 600 28px/1.2 and 600 20px/1.3, as two pairs added to AC81's scale.
- **Colour, A:** every section head turns `--ink`.
- **Wrap, A:** the part after " · " in the two headings goes to 12 px, so each fits one line.
- The owner's request is quoted exactly.

**2. The role table matches the audit, with nothing missed or double-counted.** I checked every row of the Design reviewer's inventory against AC98's table and the selectors in src/public/sandbox.css at 548031e.
- **Screen titles:** `.v2-title` :574 and `.sb-hdr h1` :96.
- **Sheet titles:** `.v2-stitle` :706 and `.sb-sheet-t` :253/:533. The gate's `.v2-stt` is only a clip span inside `.v2-stitle`, so it inherits the title's size.
- **Section heads:**
  - `.v2-sh` :812, `.v2-shw` :813 and `.v2-plh`/`.v2-plhw` :1281-1282;
  - `.v2-hgt` :841, inside `.v2-hg` :840;
  - `.v2-mds` :970, `.v2-kh` :613, `.v2-bh` :708 and `.v2-vth` :1420;
  - `.sb-h2` :103 and `.sb-sec h3` :255.
- **Sub-heads:**
  - `.v2-lh` :599 and `.v2-gn` :658, inside `.v2-grp` :657;
  - `.v2-runh` :1090, `.v2-goal .v2-label` :1164 and `.v2-plcard > .v2-label`;
  - `.sb-h3` :974 and :1127.
- **Opened-phase group heads:** `.v2-subh` :1100.
- **Empty section line:** `.v2-kq` :611.
- **Kept small:** `.v2-tn`, `.v2-tpn`, the tile's name, `.v2-sn`, and the inventory's last row of labels.
- Each role appears exactly once, and its "Before" matches the CSS.

**3. The kept-small list is justified by its rulings.** I checked each quote against its record:
- P-001-redesign-conflicts.md, item 3 (the Timeline);
- P-001-timeline-labels.md, A ("small grey words");
- P-001-board-layout.md ("IF - thefont size … can be brought down");
- P-001-text-box-size.md ("sized like Linear").

The folds, field labels, tabs, the Now line and Team's eyebrow are labels or controls rather than heads, so they stay small with no ruling needed.

**4. The readings are sound.**
- **Pairs, not tokens:** this is necessary. `--t-title` and `--t-sheet` also carry AC97's figures and the briefing's count, and `--t-label` carries kind labels and tabs. Keeping the titles' line heights at 1.2 and 1.3 keeps the gate title's `calc(2 * 1.3em)` clip holding two lines.
- **Only section heads turn dark:** this follows answer A's words. The Timeline's goal labels, Plan's card label and the empty-section line are not section heads, and the picture draws them grey.
- **The small part in `--t-small` `--ink2`:** this matches the desk's other secondary words beside a head.
- **The new rules go in mockup v2's block,** so AC62's check of the older block and AC81's pair test, which scans that block, both hold.

**5. The locked cases are named exactly.** Each file:line exists at 548031e and asserts what the plan says:
- ac81-bar-type.test.mjs:134 (`PAIRS`) and :136 (the test's name);
- ac80-board.test.mjs:808 (`.v2-lh` 600 11);
- ac83-page.test.mjs:559 (`.v2-runh` in the token list);
- ac85-sheets.test.mjs:114 (`.v2-stitle` `--t-sheet`);
- ac91-glance-home.test.mjs:142 (24px);
- ac91-glance-gates.test.mjs:224 (18px, 600);
- ac91-glance-waiting.test.mjs:145, :204 (11px 500 ink2) and :287 (12px 600 ink);
- ac91-g8d.test.mjs:906;
- ac92-glance-standard.test.mjs:195 (11px 500) and :239 (11px 600);
- ac94-qw1-questions.test.mjs:696 (12px 600) and :716 (allowed sizes);
- ac88-dark.test.mjs:1091, :1545 and :1715, the stage-8 guard's pins on `p.v2-kq`, `p.v2-kq` and `h3.v2-vth`. The other guard ranges are as named.

I scanned the test files at 548031e for computed-size assertions on header selectors, and found none unnamed that would break.

**6. AC81's scale change is consistent.** The test allows token fonts plus `PAIRS`, so adding `'600 20'` and `'600 28'` is exactly what HD1 needs. The tokens test (`--t-title` 24, `--t-sheet` 18) stays unchanged, as the plan says. The new sizes are 28, 24, 20, 18, 15, 13, 12 and 11 px, with no new weight.

**Checks run.** `surface_guard diff --range 548031e..f6c194c` is OK. v3_checks trace, joins and ready, and spec_check status, are all OK. The working tree is clean.

**Non-blocking findings (risks)**

N1. Two locked cases will keep passing while their messages go wrong.
- ac80-board.test.mjs:813 and ac81-bar-type.test.mjs:336 assert `rule('.v2-grp')` is `--t-label`, with the message "a group's name 500 11 px".
- After HD1 the container `.v2-grp` stays `--t-label`, but the name `.v2-gn` becomes 600 13. Both tests still pass while describing something untrue.
- Name them in HD1's row, to be rewritten so they check `.v2-gn`.

N2. AC85's note reads "its title in `--t-sheet` (600 20 px from HD1)". But the title leaves the token for a pair, and `--t-sheet` stays 18 px, as AC81's note says. Reword it to "its title 600 20 px from HD1, no longer `--t-sheet`".

N3. "Text that crowds can be cut" is in quotation marks, but P-001-redesign-conflicts.md reads "Text that crowds the page can be cut". Either quote it exactly or drop the marks.

**Open questions**
None.
