# Critic, round 1, on S-001 amendment 49daf31 (verbatim)

Verdict: FAIL

For the owner: The amendment does what you chose. The automatic job's pull requests show as "Being recorded by the automatic job" and stop counting as waiting on you, and those words are yours. But as written it can't be built in full, and one of its own tests still says the opposite. Two pieces it says the desk can reuse from the phone's sender need more than the desk has. The sender's check that the job's permission is still valid looks through the project's history, which the desk can't see. And working out whether the job has given up on a pull request takes three rounds of reads, one after another, which won't fit in the one read a minute it promises. Its worst-case count of daily calls also covers only one project. With all five, it goes over the desk's free-plan margin. Separately, you should know that the desk will sometimes show such a pull request as waiting before your phone does: for a moment each time you open the desk, and right away when the job says it will try again. The cost is also higher than the question said: about 4 GitHub reads a minute for each such pull request while it is open, not 5 to 8 per pull request. Nothing here is irreversible; the Definer revises and I check again.

I read the changed sections at commit 49daf31 (spec lines 1144–1164, 1341–1344, 1454–1456, 1580–1582, 2694–2696, 5230–5236, 5500–5564, 6215–6218, 7139–7141, 7996–7999, 8731–8737, 9291–9296, 9629–9633), plus the shared code they move: src/notify/jobcand.mjs and src/notify/grant.mjs. I compared them with the question that was filed, /home/user/sd-def-apr/questions/P-001-answer-pr-on-desk.md. I could not read the ruling record itself (decisions/questions/P-001-answer-pr-on-desk.md): it is not at 00be83d or in /home/user/Service-Desk. So the line 1 quoted at spec lines 1155–1157 and 5504–5507 is not checked (see M).

**Blocking (all routed to the Definer, spec stage)**

A. The grant reader can't run on the page. Lines 5509–5510 and 5551–5553 say the page imports J16's `find_grant` mirror "unchanged", reading docs/LEDGER.md as one blob. But `findGrant(checkout)` in src/notify/grant.mjs (lines 91–112, 131–135) needs a git checkout. It walks the ledger's first-parent history to find the commit that brought the grant in, and refuses one that arrived with a `Merged-By:` trailer. The page has only the tree and blobs. If the page keeps just the form checks, it would accept a grant the sender and the job refuse. The desk would then show "Being recorded" while the phone notifies, which breaks the promise at 5520–5521 that the phone is never ahead of the desk. The spec must say what the page uses for rule (d) and what follows from it.

B. The reads depend on each other, so they don't fit "one blob call a poll" or "within about a minute" (5502–5503, 5533–5550, 1580–1582, 8731–8733). The chain:
- The candidate's check runs give `completed_at`.
- That picks which asks-merge runs count.
- Each run's jobs give the `merge` job's id.
- Only then can its log be read.

A blob call is one list of requests sent up front, so a first judgment, or a newly finished run, takes about 3 calls. They come either in one poll (breaking AC14's "at most one extra blob call a poll") or across 3 polls (rule (b) counting 2–3 minutes late, and the phone ahead of the desk). Also, `judgeCandidate` skips a run whose jobs or log come back `null` (jobcand.mjs:116–121) and returns "not left". So on the page, a read not yet made reads as "being recorded". That is the opposite of choice 2's lean toward counting. The spec must say how the chain is staged, and that a pending read counts.

C. The worst case covers only one project (8734–8736). AC14's day has 5 connected projects (1556), and its J12 case already takes all 5 as v3 (8747). A candidate the job has left keeps being re-judged every poll for as long as it stays open. A failed one can sit all day, at 960 calls a project. All 5 projects: 5,500 + 4,800 = 10,300, over the 10,000 margin. That is the same figure the J12 review rejected (8749). The sums as stated are right: 60 × 16 = 960, 5,788 + 960 = 6,748, and 3 × 3 + 1 = 10. Only the "at worst" claim is wrong.

D. AC77's test contradicts AC79. Line 5269 still asserts "the answer record's pull request still in Merges, counted, with its added words". AC77's text (5230–5234) and AC79 now say not counted while the job may merge it. The changed-in-place list (1162–1163) names only AC77's "The pull request itself".

**Non-blocking (Definer unless noted)**

E. There is more than "One difference" (5517–5521). The page passes no `seenMs`, so rule (c) runs from the head commit's time alone (5539), while J16 uses the later of that and when the sender first saw the head (7239–7240). That is a second difference, on the counting side. The test line "judged alike by the page and by J16's sender on the same inputs" (5562–5563) contradicts both differences.

F. Choice 2, leaning toward counting, is a sound direction but isn't told to the owner. Line 5520 counts a retried reason at once, while the job may still merge the pull request, which goes beyond the ruling's "not yet left for the owner". Before the first judgment, each opening shows the pull request as waiting, on Home's top line and the pill. The spec doesn't say whether AC79's reads are needed reads or optional ones behind A3's 6-call first cycle (8650–8654). If optional, the "waiting" can last minutes. The owner paragraph's "counts again within about a minute, as your phone is told" (1148–1150) leaves all of this out. It is also not said whether a failed AC79 read touches "read successfully", which J20 says its own reads never do (7470–7471).

G. The cost differs from what the owner ruled on. The question's option B said "about 5 to 8 more GitHub reads per pull request, a few a day". The spec reads about 4 a minute per candidate, plus a function call a minute (5549, 8731–8734). The paragraph at 1150–1151 states it but doesn't flag that it is more than the question said. "usually minutes a day" is unclear. Routed also to the question stage (the Chief of Staff's): the question understated the cost. D-050 flag: if a Critic passed that question, that check is implicated. I can't tell from this session whether it was mine.

H. Choice 3, returning only the `PR #` lines, is sound. It also keeps `PR #n: merged` lines, which `logVerdict` needs. Still to state:
- the lines come back in their original order, since the last one wins (jobcand.mjs:24–33);
- a size or CPU cap on the log scan, like `COMPARE_SCAN_CHARS`, for AC14's "no Error 1102";
- how the job-log redirect is followed without sending the read token to another host.

J6's request fields and refusals for the new reads are not named: 6215–6218 versus the list at 6275–6285. J6's test is not among the tests named in step 7 (9633).

I. A known limit is unstated. The read token gets 403 on check runs in a private repository (8090–8092, 8418–8420). Every candidate there would always count. Service-Desk is public, so it works today.

J. The row's behaviour is unstated:
- whether the "Being recorded" row opens the response sheet or the owner's verdict box (2807, 2854: "every open pull request in Merges");
- whether it can fill the owner's tile's three "next lines" (2220–2221);
- whether it can trigger "Waiting on you" under 2197's rule ("the queue holds an item").

K. AC73 is stale. Its "less the pull requests the asks-merge job may still merge" (4736–4738) is now redundant, because Terms excludes them. Its test (4792) subtracts "J16's job candidates", meaning all of them, from a desk list that now excludes only those not yet left. AC73 is not in the changed list.

L. The brief's step 7 (9629–9633) omits the function's change (src/functions/), though Areas touched names it (7998). The page loads src/public/lib copies, which no line mentions. grant.mjs imports `../lib/pulls.js`, so a move can't be literally "unchanged".

M. The ruling record should be checked. The Orchestrator should confirm line 1 at d8026fa matches what lines 1155–1157 and 5504–5507 quote. The sentence "on the branch cos/answer-pr-answer until pull request #125 merges" (1160–1161) goes stale once it lands.

Checked and sound: "Being recorded by the automatic job" matches the ruling's words. "The automatic job left this for you" is plain English. The shape of the A3 sums is right. AC2, AC52's Merges, Terms, J16's text and "Quiet" agree with AC79 apart from the items above. Choice 1 (keeping finished runs' jobs and logs by id) is right in principle, since those never change; it is undone only by B and C.
