Verdict: PASS

**Evidence**
- **AC17 (ruling P-001-audit-copy A; item 17).** Checked with `contentPrefill: false` and with `linkCap: 60` on:
  - Letters: the lettered, numbered, gate, mixed, unlettered, no-default, overdue and long-title sheets;
  - Alpha's decision card and gate;
  - Service-Desk's questions.

  On every one of them:
  - each choice's box holds one "Copy" (aria-label "Copy: Answer A" and so on);
  - nothing sits above the choices: no Copy, and no visible answer text;
  - the cause's words sit under the choices;
  - every answer link holds the file name only (no `value=`);
  - the numbered question has one Copy beside its one "Answer ↗";
  - each Copy's text equals its file in the fold, character for character, with and without the owner's words typed (probe pressed each Copy);
  - Copy buttons are 36 px tall, 12 px, weight 500.

  Crops: CROPS/s5-copy-in-choice-360-light.png, CROPS/s5-copy-gate-414-dark.png and CROPS/s5-decision-fold-360-light.png.
- **AC89 (j), past settle times.**
  - Sheet: "Was due to settle itself as B on 19 Oct, 10:00 (per the question file: 24 hours); not settled yet".
  - Card: "Was due to settle as B · 19 Oct, 10:00".
  - Briefing: "one question was due to settle itself 19 Oct, 10:00 · 3 questions settle themselves, the first Tue 14:59".
  - The older fixtures change the same way (15 Oct, 8 Oct, 16 Oct). The base read "Settles as B · Mon 10:00", a weekday for a past time.
  - The 1 Nov clock change was checked by the passing test only; I did not render it.
  - Crop: CROPS/s5-board-cut-due-360-dark.png.
- **AC89 (j), the default line.** It reads "Default, per the question file:", then the file's own words set apart as quoted record text (13 px, `v2-quote`). "Default: not given" shows where the file has none. Crop: CROPS/crop-s5-default-360-dark.png.
- **AC89 (j), other answering points.**
  - Split messages are true: "a line between its options is neither lettered nor numbered". The real design-pick file reads "one of its lines …", and its last line is in fact the unlettered one.
  - A v2.5 question's copy text is now AC19's form, "Ruling: A" (Delta-1 in md-extremes).
- **AC89 (j), three-line cuts.**
  - Board card titles: 47.88 px = 3 × 15.96 px.
  - Plan's gate row: 3 × 17.55 px.
  - The gate sheet's title: 3 × 23.4 px, with "Read it all" under it.
  - The fade is a mask, drawn only when the text is cut: across 7,602 faded titles, none fades without a cut and no cut lacks a fade.
  - Crop: CROPS/crop-s5-gate-title-360-light.png.
- **Nothing else moved.** In board-and-sheets mode, every difference is one of the points above: main 48 of 136 captures identical; md-extremes 48 of 440, plus letters, long, pick and sdq.
- **Part A items 9 to 12, 25, 27 and 34 pass.**
  - No sideways scroll, no contrast failures.
  - Sizes on screen are 11, 12, 13, 15, 18 and 24 px.
  - "Was due" keeps the clock icon and its words, so it stays told apart from the lock.

**Non-blocking findings**
- **N1 (AC89 (j) "the whole one tap away"; item 16).** For a gate card on the board, and for Plan's gate row, a tap opens a gate sheet whose title is cut again. The whole title is a second tap away. This is a spec tension: the spec also asks for the sheet's title to be cut.
- **N2 (item 19).** The decision card's fold is still labelled "The whole record". The question and gate folds say "· and the file each answer writes". The Copy-failed text points to "the fold below".
- **N3 (follow-up, already there before the change).** A choice's "Copied" label stays after the owner types new words, though pressing it again would copy different text.

**Coverage notes**
- Stage 5 was rendered in board-and-sheets mode: Team and member pages were not re-rendered, since stage 5 changes none of their code.
- For stages 3 and 4, I stopped the pf-x-cards runs (md-extremes plus the portfolio). md-extremes itself was fully covered.

**Open questions**
- N1: should a gate's title be cut on both the board and its sheet, given that this puts the whole title two taps away?
- N2: should the decision card's fold say it holds the answer files?
(Recorded verbatim by the orchestrator from reviews/M3D/_stage-3-4-5-design-r1-verbatim.md, its stage 5 part.)
