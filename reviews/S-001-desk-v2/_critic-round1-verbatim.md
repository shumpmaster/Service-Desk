# S-001, desk mockup v2, draft 1: the Critic's round-1 report, verbatim

Dispatched by the orchestrator on 2026-10-20 against build/definer/s001-desk-v2 at ceaf9a2.

---

Verdict: FAIL

**Blocking**

1. **AC54's "Latest" bubble is dropped as a (C) reading, but only the owner can decide that.** Routed to Define, to put to the owner.
   - Evidence in the spec: S-001.md:1788-1791, :3800-3801, :1832 (item 25), :6283.
   - The owner asked for the bubble: decisions/questions/P-001-trial-view-notes-1.md line 1 and note 2 ("Move the latest text the be a popup bubble…"). P-001-tile-summary-clip.md:15 says the bubble "stay[s] as built".
   - No later ruling replaces it. The rulebook lists it as a standing ruling (governance/domains/design/README.md:77-78). It does not appear among its spec points (:258-263).
   - Mockup v2 only leaves the bubble out. Its README does not name it under "Which ruling each choice follows" or under "Not ruled". Part B applies only "as far as v2 draws the point" (rulebook :48-49), so the standing ruling holds. The design reviewer would fail stage 2 on part A item 1.
   - The owner's answer 1 on the redesign's conflicts lets crowding text be cut. A bubble behind a control is not crowding text.
   - The owner's lead paragraph (:1602-1628) never mentions the bubble going.
   - Fix: make it an open question with a recommendation, as questions 8, 9 and 11 are, with the standing ruling holding until the owner answers.

2. **The sender rollout for "With the agents" can't deliver the lead's promise that "the phone and the desk keep agreeing" (:1619-1620; AC73's note, :6719-6725).** Routed to Define.
   - (a) The Risks section says stage 1b lands "before the preview deploy of 1a is approved" (:12725-12728). The brief says each stage's preview deploy is approved before the next stage opens (:13381-13382), and that 1b lands "with or after 1a" (:13390). Both can't be followed.
   - (b) No step moves the operating-model project's Workflow 4 pin (CS16) to the commit that carries rule 0. That pin is how that project's sender picks up Service-Desk code (:11603, :13464). Stage 1b (:13386-13391) and Setup CS24 to CS26 (:11671-11684) are both silent on it, so that project's phone notifications would keep firing for pull requests the board hides.

3. **The sender's new reads under rule 0 have no failure handling and no tests.** Routed to Define.
   - J16 (:10005-10010) adds the `owner-verdict` status read and each reviewer's verdict file read (`contents/…?ref=<head>`).
   - It does not say what a failed or refused read means, how a 404 differs from other failures, what happens when the checkout's `governance/risk-paths.toml` is missing or unreadable, or how a fork is judged.
   - The page's safe sides are not stated for the sender: an unread verdict counts as given, and files J20 can't read mean judging by (i) alone (J22 :10508-10510).
   - Neither J16's test nor AC73's gains a rule 0 case, unlike J22's (:10637-10643).
   - The sender's rule silences notifications, so a failure read as "missing" would hide a pull request from the phone without a sign. That is a V1 miss.

4. **Rule 0 (ii) rests on an unevidenced fact for the operating-model project.** Routed to Define.
   - The fact that a reviewer's verdict sits on the pull request's branch, at `reviews/<n>/<id>.md`, before merge is evidenced only by Service-Desk's #148 (:12335-12338).
   - Rule 0's real-on-real cases are Service-Desk pull requests only (:10637).
   - Yet J22 applies to every connected project, v2.5 included (:10592). The operating-model project needs `reviewer` on R1 to R3 changes (its governance/risk-paths.toml:34-38).
   - That project's reviews/ tree does not settle it. Some folders hold many unrelated reviews (reviews/7/ holds plan and build reviews of S-007 to S-016), and nothing shows its verdict files land on the pull request's branch before merge.
   - If they don't, every such pull request sits in "With the agents" for good, and is never shown or notified.
   - Fix: add evidence (placeholder form), or a fallback for a project where it isn't shown.

**Non-blocking (all Define)**

5. What waits on questions 8, 9, 11 and 1c disagrees between three places:
   - the stage table says stage 2 waits on 11 and stage 3 on 8 (:1712-1713);
   - the brief says those stages build the standing ruling while the question is open (:13393-13398);
   - question 1c says both "Stage 2 waits" and "the standing ruling keeps it" (:12934-12935).
6. The brief's stage 1a sheet keeps "AC52's contents but the text box" (:13355), but AC80 now puts the box in the sheet (:5801-5811), and AC85 is stage 4. Stage 1a also names frame 12 (dark mode), which is stage 7's work. Say which stage builds each.
7. AC44's step 2 counts "stages 1a to 7" (:2727), which includes 6b. But 6b waits on the owner's Setup P1 and serves MD3 (:1717), and stage 7 waits only on 6a (:1718). Say whether step 3, the owner's pick, waits for 6b.
8. AC81's type test allows the tokens plus four listed pairs (:6115-6119, :6162-6164). Frame 1 also uses Plex Sans at 400 11 px (desk-v2.html:166, :173 and :179: `.card .why`, `.gl`, `.empty`). Built as drawn, frame 1 would fail AC81's test.
9. AC80's marks paragraph still names the board's top line, the Queue's pill and Home's top line (:5876-5878). This revision removes all three (:5697-5699, :6101).
10. Terms dates "With the agents" "from 2026-10-20" (:2042-2043, :2141). It actually arrives with stages 1a and 1b, and the accepted views are unchanged until stage 8 (:1761).
11. The "⋯ More" pill is settled as (C) (:1792, :6283). It is drawn on every frame, and question 11's option (b) itself uses it (:12968). Fold it into question 11.
12. The spec says the Pi font subset holds the marks the desk draws (:6127-6128). Its ranges (:12322) miss ✕, ◆, ▸ and ⇅, which the desk draws, so those render in the fallback font.
13. The colour-distance figures are evidenced as "a Python computation" (:12327-12334), with no command or output, as the template asks.
14. Two open questions lead with codes rather than plain words (:12938, :12948), and CS26 files them for the owner.
15. AC80 has no V2 trace, though "With the agents" exists to cut false alarms (V2).

**The three (C) readings**

- **The words box back in the sheets: sound.** P-001-board-answer.md (C) rules one fully filled-in file per option. It never removes notes-1 note 15's box. Mockup v2 draws the box (desk-v2.html:528, :543), and its README cites note 15 for it. With the box empty, each file is exactly AC80's, and the lead tells the owner the box is back (:1622-1623).
- **AC54's "Latest" bubble dropped: the owner's decision** (finding 1).
- **The gate sheet's reason on Hold and Recycle: sound.** decisions/README.md:11-13 needs `Reason:` with `recycle` and `hold`, and never with `kill`. The mockup's label "asks for one on Recycle or Kill" (desk-v2.html:557) misstates the record. AC53 already puts the owner's words in `Reason:` for hold and recycle (:3731-3735).

**What holds**

- All six spec points in the rulebook are addressed (:1739-1749).
- The milestones match docs/PROJECT.md:110-112: MD2 and MD3 are not reached, and M3A was reached on 2026-10-20, which AC86 relies on.
- Areas touched cover the new work (:11266-11284).
- A3's sum is correct: 9,355 + 192 = 9,547.
- The colour tokens match desk-v2.html:18-54.
- The owner's lead is plain, apart from leaving out finding 1.

D-050: none of these findings implicates an earlier check of mine. The board's carried draft-4 logic was judged on its own terms.
