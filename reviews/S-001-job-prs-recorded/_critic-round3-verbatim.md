# Critic, round 3, on S-001 amendment draft 3 (08138e7) (verbatim)

Verdict: PASS with notes

For the owner: Draft 3 closes all six of my round-2 notes, N to S, and adds nothing that conflicts with the rest of the spec. It still does what you chose: these pull requests show as "Being recorded by the automatic job", don't count, and count again about when your phone is told. Two sentences in the paragraph written for you (spec lines 1146–1162) should be reworded before it lands. First, the cost is described as "a little more" than the question's "5 to 8 reads". The new figure is up to 20, about two and a half times at the top. The real amount is still small, a few dozen GitHub reads a day per device, and the desk stays under its free-plan margin (7,077 calls on the worst day, against 10,000). So you don't need to be asked again, but the paragraph should say "up to about two and a half times". Second, one sentence reads "keeps counting it … until … it merges, even if the job then merges it on its next try". It means "even if the job's next try would merge it". Nothing else needs you.

Your message again included the Definer's summary of its own changes, which my role card says I must not see. I checked every claim against the spec text at 08138e7 instead of relying on it. I did not read the plan review's file.

**Round 2 notes**
- **N. Closed.** AC52's test now checks only "each counted pull request in Merges (not one 'Being recorded by the automatic job')" for the verdict box (2812–2814).
- **O. Closed.** There is one cap: 3 AC79 blob calls per candidate head per opening, failures and retries included. AC79 (5604–5610), A3 (8900–8901) and AC14's test (1596–1597) now say the same.
- **P. Closed.** J1 now counts the extra conditional reads (5788–5790). J6 names the poll response's `jobs` field (6347–6349).
- **Q. Closed.** J6's test (6473–6478) names each new edge case:
  - a malformed `jobs` part, and a sixth head;
  - a `jobLog` entry that isn't digits, and a sixth one;
  - a sixth `commitTime` entry;
  - the budget counts;
  - the redirect fetched with no `Authorization` header.
- **R. Closed.** The log scan is capped at 65,536 characters (5615–5618). The assumption about skipped runs is stated, along with which way it fails: more counting, the safe side (5593–5597). The 304 claim is labelled "C, untested with a fine-grained token" (5576–5577).
- **S. Mostly closed.** "Four quick … questions once a minute" (1159) is now clear, and so is "even if it were not, about 240 of your 5,000 an hour" (1160–1161). The process talk is gone. All the safe-side counts are listed, plus the new sticky case (1150–1155). Two fixes remain, in T.

**New notes (non-blocking)**
- **T. Owner paragraph (Definer).**
  - (i) Line 1158 says "a little more than the question's 'about 5 to 8'". The range is now 5 to 20, for each open device, plus 1 to 3 desk calls, which the question never mentioned. Say "up to about two and a half times".
  - (ii) Lines 1153–1155 say "until its contents change or it merges, even if the job then merges it on its next try", which contradicts itself. It should mean "even if the job's next try would merge it". AC79 (5565–5571) says it more clearly: usually up to about 15 minutes, and only for something the phone was told of.
  - (iii) "a few a day" (1157) reads as the number of reads. It means the number of such pull requests a day.

  Not material enough to ask the owner again. The record shows the owner was offered "5–8 more GitHub reads per such PR, a few a day" (record line 8). The real cost stays a small share of the hourly limit, and the free-plan margin holds.
- **U. A3's per-opening count (Definer).** The cap of 3 is per head per opening, and the opening's own call is outside it (5610). A candidate head still open when the desk is opened again gets a fresh cap of 3. Only the 288 × 3 and the 10 × 5 are counted (8912–8913). The worst case for that is about 10 openings × 5 projects × 5 candidates × 2 more calls = 500, giving about 7,577, still under 10,000. The sum itself checks: 5,500 + 288 + 60 + 215 + 864 + 50 + 100 = 7,077.
- **V. A citation that points to nothing (Definer).** A3 says the poll call's 29 requests are "within J1's 30" (8899–8900). No limit of 30 is stated in J1. The limit the spec does record is Free's 50 subrequests per invocation (8539). The claim holds either way; the citation needs fixing.
- **W. The default-branch filter rests on an unknown (Definer).** It covers every judging run, in the page and, as an R3 change, in the sender (5578–5582, 7343). Runs started by `workflow_run` are judged only if GitHub reports their `head_branch` as the default branch. EXP-006 case 10 lists that as untested (9160). The sender's live J18 lookup already relies on the same thing (7505), so it is probably true. But if it is false, both the phone and the desk miss a pull request the job leaves on a `workflow_run` run until the next scheduled run, up to about 15 minutes. That is the unsafe side. Facts relied on should name this assumption and its evidence.

Checked and consistent: Terms, AC2 (1464–1466), AC49 (2209–2212), AC53 (2868–2869), AC73 (4749–4756, 4806–4813), AC77 and its test (5286–5287), J16, "Quiet", the brief's step 7 and Areas touched. The new sticky "left" case keeps the guarantee AC79's test makes (5652–5655): the desk counts whenever the sender has left the pull request. Read from the job's own `run` (asks_merge.py:600–647), the dry pass is accurate: the module keeps reading up to 5 logs after a final verdict and stops only on a `merged` line.
