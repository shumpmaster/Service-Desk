# Bigger headers plan: the Design reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/definer/m3b-plan at f6c194c (AC98 and HD1, draft 1).

---

Verdict: PASS

In plain English: AC98 builds the approved header picture, with the owner's three answers applied.
- **Titles:** screen titles become 28 px and sheet titles 20 px.
- **Section and sheet-block heads:** they become 15 px semibold and dark everywhere.
- **Smaller group heads:** they become 13 px.
- **An opened phase's two group heads:** they become 12 px.
- **Two long headings:** they keep their time or count small and grey, so each stays on one line.
- **Kept small:** the labels that should stay small do.
- **The small grey part of the split headings,** which the picture didn't draw, reads right.
- **The two grey sub-heads** (the Timeline's goal labels and Plan's card label) read right as quieter labels under dark section heads.
- **HD1's tests** measure every role's size, weight and colour, so they would catch drift.
- **Regressions:** none found.

There are two small notes:
- The design pack's size list needs the two new sizes before HD1 is reviewed.
- The time in "Since you last looked · <time>" is set in Sans, not Plex Mono. That predates this change.

How I judged it: the diff 548031e..f6c194c changes only specs/S-001.md, and nothing under src/ or tests/. I checked the plan against:
- the amendment (S-001.md:3655-3757) and AC98 (:11764-11818), plus the notes on AC80, AC81, AC85, AC91, AC92 and AC94;
- the request docs/design/references/owner-request-2026-10-29-header-sizes.md;
- the three answers, decisions/questions/P-001-headers-approve.md (B), P-001-headers-colour.md (A) and P-001-headers-wrap.md (A);
- the audit /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/reviews-hd/picture-design.md;
- the picture's own CSS, /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/tools/override.css and override-titles.css;
- images 1, 4, 5 and 8 in docs/design/builds/headers-picture/;
- the design pack.

**Each role's size, weight and colour (AC98's table): holds**
- **Screen title** (`.v2-title`, `.sb-hdr h1`): 600 28 px, `--ink`. Sheet title (`.v2-stitle`, `.sb-sheet-t`): 600 20 px. Both match image 8's right-hand side and the override for answer B.
- **Section head** (`.v2-sh`, `.v2-shw`, Plan's `.v2-plh` and `.v2-plhw`, `.v2-hgt`, `.v2-mds`, `.v2-kh`, `.v2-bh`, `.v2-vth`, `.sb-h2`, `.sb-sec h3`): 600 15 px, now `--ink`.
  - This is the picture's set, with its colour moved from "kept" to dark by answer A.
  - Images 1, 4 and 5 show the heads at 15 px: "Since you last looked", "Your projects · active", "Milestones by phase", "Service-Desk · milestones ahead".
- **Sub-head** (`.v2-lh`, `.v2-gn`, `.v2-runh`, `.v2-goal .v2-label`, `.v2-plcard > .v2-label`, `.sb-h3`): 600 13 px, each keeping its colour, as the override has it. Image 4 shows "Run 2 · 8 Oct – now" at 13 px.
- **`.v2-subh`:** 600 12 px. It stays one step under its run head (AC92 (d)), as in image 4 ("Your milestones · 3", "Standard checklist · …").
- **`.v2-kq`:** 500 13 px (`--t-row`), `--ink2`. It stays quieter than a section with cards (AC91 (f)).
- **Line heights:** the titles keep their tokens' 1.2 and 1.3 rather than the picture's scratch 1.15 and 1.25. That is about 1 to 1.5 px per line. The reason is functional: the gate sheet's two-line clip, `calc(2 * 1.3em)`, and HD1 tests it. This is a note, not a finding.

**The new 28 and 20 pairs, and the scale: holds**
- The scale becomes 28, 24, 20, 18, 15, 13, 12 and 11 px, plus 16 px for text boxes. The weights stay 400, 500 and 600, and no colour token is added.
- AC81's pair test gains exactly '600 28' and '600 20'.
- Tokens keep their values, so AC97's figures stay at 24 px and Home's briefing count stays at 18 px. On Home the order still holds: title 28, then the briefing's 18, then section heads at 15 (AC91 (a)).
- On the targets' sheet, the 24 px figures were already larger than the sheet title (18, now 20), so nothing is reversed.

**The kept-small list (AC98, "Kept small, on purpose"): holds**
- It matches the audit's list and the override's comment, item for item:
  - the Timeline's band (600 12) and compact title (600 15), under frame 7b and P-001-redesign-conflicts.md item 3;
  - Technical, Context and Why, under P-001-timeline-labels.md;
  - a card's kind label and the board's buttons at 11 px, under P-001-board-layout.md;
  - folds, field labels, tabs, chips, the Now line and Team's eyebrow;
  - the tile name and a phase row's name.
- HD1 measures each one unchanged.

**The split heading's small part: I judge `--t-small` (400 12 px) `--ink2` right**
- Answer A separates "the heading words at 15 px" from "the time or count after them at 12 px". So the time or count is not the heading. Answer A on colour ("every section head … in the darkest text colour") governs the heading words, which AC98 makes `--ink`.
- Grey 400 for the secondary part follows the desk's convention for words beside a head. Examples are the count beside a group head, "↑ start at the foot", and the same part before this change (grey in images 1 and 4).
- Its contrast is 6.4:1 in light and 7.7:1 in dark (item 10). The words are unchanged and are read whole by a screen reader.
- HD1 tests the 15 px words, the 12 px `--ink2` part, the one-line box at 360 px, and the three time and count forms beside "Mark as seen" and "↑ start at the foot". The Definer marks this as mine to judge against the picture in HD1's review; I will.

**Sub-heads keeping their colours next to dark section heads: reads right**
- The Timeline's goal labels ("What we're delivering", "Where we started") and Plan's card label ("Rough finish, in this order") stay `--ink2` at 600 13 px.
- They are labels on a box, not section heads. The colour answer was put of section heads ("Section heads are grey on Home, project pages and Plan, but dark on Waiting"), and the approved picture draws these two grey.
- On Plan, the grey card label above dark 15 px group heads ranks as quieter, which is right. On the Timeline there is no 15 px section head nearby, and grey matches the Timeline's other small grey words (P-001-timeline-labels.md).
- The ink sub-heads (lane heads, group names, run heads) were already ink, so no colour has two meanings (item 14).

**Would HD1's tests catch drift from the picture: yes**
- HD1's row checks every role by selector: computed size, weight and colour, in light and dark, at 360 and 414 px. It does so across Home, Waiting, a project's page (including the v2.5 one), Plan, the Timeline, Team and the Details views, and every named sheet, from `service-desk/`, `poom/` and `md-extremes/`.
- It also checks:
  - each kept-small role, measured;
  - the tokens unchanged, and AC81 gaining exactly the two pairs;
  - the split headings on one line;
  - the gate title's two-line clip;
  - 4.5:1 or better in both themes;
  - AC88's dark cascade;
  - the stage-8 guard's `HD1_ONCE`;
  - each locked case it rewrites, by file and line.

**Regressions:** none found.
- Words, counts, order, the reads, notifications and colour tokens are unchanged.
- AC91 (a), AC92 (d), AC94 and AC91 (f) keep their relationships, and the board's small text is kept (P-001-board-layout.md).
- The notes on AC80, AC81, AC85, AC91, AC92 and AC94 each say "from HD1" and agree with AC98.

**Blocking:** none.

**Non-blocking**

N1. The design pack's size list (governance/domains/design/README.md, "Sized like Linear" and part B item 27: "24, 18, 15, 13, 12 and 11 px") predates P-001-headers-approve.md, B.
- Under the pack's own rule a later ruling replaces an earlier one, so 28 and 20 px are not findings.
- But the pack lists neither the three header answers nor the new sizes, so a fresh HD1 Design reviewer would have to work that out.
- Adding the three P-001-headers-*.md rulings to the pack's standing rulings, and 28 and 20 to item 27, before HD1's review would prevent a false FAIL. That is outside the Builder's lane and this spec.

N2. "yesterday, 04:00" in "Since you last looked · <time>" is in IBM Plex Sans, while P-001-redesign-type.md sets Plex Mono for times (item 23).
- It was Sans at 11 px before, as images 1's "before" panels show, and the event times beside it are mono. So this predates HD1 and is not made worse.
- HD1 now gives that part its own span, so it could cheaply take `--t-mono` for the clock time. This is a follow-up, not a finding.

**Questions for the owner:** none.

Files:
- /home/user/sd-m3bdef/specs/S-001.md: the amendment and HD1's row at :3655-3757; AC98 at :11764-11818; AC81's note at :8512-8520
- /home/user/sd-m3bdef/docs/design/builds/headers-picture/headers-1-home.png, headers-4-project-page.png, headers-5-plan.png and headers-8-option-bigger-titles.png
- /home/user/sd-m3bdef/governance/domains/design/README.md (N1)
