# Critic, round 1, verbatim — questions/P-004-widget-why-and-data.md (2026-11-04)

**Verdict: FAIL.** There are 2 blocking findings and 7 non-blocking ones.

The quotes for Parts 1 and 2 match the handoff exactly (docs/handoff/2026-11-04-chief-of-staff-widget.md:41-46): both questions, all the options and both answers, with the same session id and date. Context bullet 1 matches round 3 (reviews/P-004-brief/_critic-r3-verbatim.md:3, :15-25). Context bullet 4's section heading exists (decisions/questions/P-001-card-recommendation.md:16). RISK CLASS R0 is correct, because questions/** is R0 (governance/risk-paths.toml:28). The `Asked in session:` line is beyond questions/_TEMPLATE.md but has precedent (reviews/P-002-plan-place/_critic-r1-verbatim.md:40) and sits under `Milestone:` where AC77 reads it. Keeping the answers out of Context is right (AGENTS.md:70).

## Blocking

1. **Line 23, "How to go on … you answered: "File the answers, then one check (Recommended)".", with the frame on lines 1, 6 and 8-16.**
   - **No record holds this quote.** The handoff has no such answer: its "Update: P-004's plan" section stops after round 2 (lines 38-52). I searched the whole repository for "File the answers" and "Drop the quotes", and both appear only in this file. So the owner's exact words (D-066), the question as put, and the description "this as its one blocking finding" cannot be checked against any record. Context bullet 3 says the answers are "also kept in the session's handoff". That is true of two of the three only.
   - **The card does not carry this ruling as it carries the other two.** The title, the WHY and the OPTIONS cover only "two things", Part 1 and Part 2. The stop-rule choice has no options in OPTIONS, no recommendation and no risk line. So the answer record will have no "Options, as put" for it, as the precedent has (decisions/questions/P-001-card-recommendation.md:6-9). The WHY also never mentions the failure that led to it: the plan reached the Critic's three-round limit. AGENTS.md §4 and §5 ask the card to lead with failures ("Plain English first; codes as cross-references; lead with failures").
   - **Stage:** asking the owner and continuity (Chief of Staff, AGENTS.md §5, model S-033). The handoff was not updated with the third ask before the card quoted it.

2. **Lines 14 and 16, option D's "Your phone's own iCloud backup may still copy app storage; that is your phone's setting, outside the desk's rule", and the missing parts of the decision card.**
   - **The record would show the owner accepting a point they were never asked.** The owner was asked only "Where may the widget keep your records and the GitHub key? …" and chose "Phone only (Recommended)" (line 22; handoff:43-46). The backup point is round 3's finding 6, raised after that answer. Round 3 said one sentence settles it: "the owner either accepts this as their own phone's setting … or the copy is kept out of backups". Writing that acceptance into option D, then recording "D" as the ruling, makes it look as if the owner chose it. The same goes, less seriously, for the "so you …" glosses added to A to C on lines 9-11. The options that will be recorded must be the ones as put (lines 21-22). Anything added afterwards must be marked as added, and must not be taken as ruled.
   - **Two of the seven parts of a decision card are missing** (OPERATING_MODEL.md:69-73, "Decision cards (D-019)"):
     - The recommendation gives a confidence but not what would change it.
     - There is no line saying who has checked the card.
     - The desk's precedent rated both as blocking and fixed them before passing (reviews/P-001-card-recommendation/_critic-r1-verbatim.md:11-12, :32; _critic-r3-verbatim.md:18).
   - **Stage:** card drafting (Chief of Staff, D-019).

## Non-blocking

3. **Line 28, Context bullet 2, and line 14, option D's "the projects' content goes only to GitHub and Cloudflare".**
   - docs/PROJECT.md:165-167 says the desk "may send their content only to GitHub and Cloudflare, plus Anthropic if U3 leads to sessions".
   - The bullet cuts the sentence short, and its line number should be 165-166.
   - **Stage:** card drafting (citation).

4. **Lines 8-15: one card holds two decisions with five options (A to E), and line 23 adds a third decision.**
   - D-019 asks for one decision with 2-3 options.
   - The desk's option reader also cannot parse this block. The lines "  Part 1, …" and "  Part 2, …" are neither lettered nor numbered, so src/lib/sandbox.js:745-772 falls back to "This question file couldn't be split into questions". On Waiting the file will show as one unsplit box waiting on the owner, though nothing is left to answer.
   - The answer record also needs one `Ruling:` first line to cover three choices.
   - **Stage:** card drafting.

5. **Line 29, Context bullet 3, cites the handoff, but the handoff's last paragraph (lines 48-52) says "Neither is treated as a ruling".**
   - That is the reverse of what this file does, and round 3 found it unsound.
   - The card should say the handoff's reading has been superseded, or the handoff should be updated. Otherwise a cold reader finds two records that contradict each other.
   - **Stage:** continuity (handoff).

6. **Line 3: "Milestone: none (P-004's milestone, M5, is only proposed; these answers shape its plan)".**
   - The reason in brackets says the answers do serve M5. Part 1 is M5's why.
   - "none" may stand while M5 is only a proposal (docs/PROJECT.md:642), but the reason should say plainly why it serves no milestone yet, not that it shapes one.
   - **Stage:** card drafting.

7. **Line 6, plain English for a non-expert.**
   - "which the model asks for" will read as an AI model. Say "the desk's rules".
   - "Scriptable", "keychain", "GitHub key", "stop rule" and "the Critic's three-round limit" (line 23) are never explained.
   - "Nothing changes until P-004's plan passes its checks" is fine.
   - **Stage:** card drafting (AGENTS.md §4, "Plain English first").

8. **Line 17, BLAST RADIUS: "only P-004's plan in the desk's project document; nothing on the desk".**
   - docs/PROJECT.md is itself the desk's project document. "Nothing on the desk" probably means "nothing the desk does or shows", so say that.
   - **Stage:** card drafting.

9. **Line 24: "they are recorded word for word with this question's answer".**
   - This file asks nothing new, so "this question's answer" is unclear.
   - Say that they will be recorded, with the owner's exact words, in the answer record under the same name (decisions/questions/P-004-widget-why-and-data.md).
   - **Stage:** card drafting.
