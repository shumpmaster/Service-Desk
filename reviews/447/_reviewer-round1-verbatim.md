Verdict: FAIL

The Reviewer's first-round verdict on PR #447 (R3: the Definer's pack, L-0055; the owner's three answers on S-011's second plan review), on d0dd7067, verbatim below. Recorded by the orchestrator, session session_01QBwHGL7cLBqyQ4o1BxNuyh, 2026-11-14. B1 was addressed in the pull request's body; N1 by the owner's confirmation in decisions/questions/P-005-s011-m8-reading.md; N3 in L-0055 and the register row. N2 and the two open questions are for the operating model.

## The Reviewer's return

Verdict: FAIL

The fail is for one cheap thing: the opening paragraph of the PR body. Everything else checks out. The pack change does what it claims and nothing more, the 224 to 240 figure reproduces exactly, and the full check suite passes against main. Changing the paragraph alone would turn this into a PASS.

**Blocking**

B1. The opening paragraph uses ids, which AGENTS.md §4 forbids. PR #447 does open with `## What this means for you` and a paragraph, as required. But AGENTS.md §4 says that paragraph holds "No file paths, code or ids… record numbers go after the words they support, as cross-references." This one uses the milestone id as a noun: "the spec's reading of M8 is enough". It also says "the work reaches stop card 5". A stranger cannot tell what M8 is. #444's paragraph, which the Reviewer passed, had no ids. Since a body without a plain opening paragraph is a FAIL finding, this one is too.
- Fix (body only): for example, "the spec's reading of your phone-alert milestone is enough (M8)", and "the work stops for your ruling (stop card 5)".

**Non-blocking**

N1. The M8 answer covers slightly less than the reading it is recorded as accepting.
- The question file and the session's first ask listed five parts of the reading: no promised minutes, misses before a fallback window counted rather than prevented, the normal alert level if Time Sensitive is not available, and no daily cap.
- The owner replied with a clarifying question. The question was then put again in shorter form ("sent to your phone by name, aiming at 5 minutes and counting every late or missed alert, without a guaranteed time"), and the owner answered that form. It leaves out the Time Sensitive fallback and the no-cap part.
- decisions/questions/P-005-s011-m8-reading.md, "How it is carried out", says S-011's whole reading "stands as the owner's".
- The record quotes both asks honestly, and the ruling is reversible (R0). Still, a stranger could argue that parts (3) and (4) were never answered. Either say in the record that the second ask stood for the full reading the owner saw first, or confirm it at the Design gate.

N2. .claude/agents/definer.md still says the Definer may read only "Past specs; the pattern library." The charter card now says less than the pack allows. The same was left alone for the Critic after L-0053, and the cards come from the model. L-0055 says the gap goes to the model.

N3. The figures are true as measured, but they will not match a rerun after merge.
- 224 and 240 were measured on the tree before this PR, and they include BRIEF.md and the agent file.
- Once merged, the pack gains this PR's three answers too, so 17 answer records rather than 14.
- decisions/questions/P-005-definer-pack.md says so. L-0055 and the register row do not.

N4. `check_all.sh . origin/main 447` fails only on review_check. The missing verdicts are reviews/447/reviewer.md and reviews/447/owner.md, which R3 requires. That is expected: both are unticked tasks with an "(added: …)" note, and the PR is not a draft.

**What I verified**

1. Answer records (`git diff origin/main..origin/claude/chief-of-staff-timeline-7bfp34`, compared with decisions/questions/P-005-critic-pack.md and P-005-model-3.7.3.md):
   - All three follow the earlier form: Ruling line, Question, Milestone, the question and options "as put", the recommendation, how it was answered, the owner's words verbatim, and how it is carried out.
   - The milestones match the question files: M7 for widths, M8 for the M8 reading, and M6, M7, M8 for the pack.
   - As in the earlier records, the options are quoted as the session tool's labels, such as "Fix the pack (Recommended)". The A/B wording in the files is not quoted.
   - Each ruling is option A of the file it closes. The risk and reversibility match: widths and M8 are R0 and reversible, the pack is R3 and irreversible.
   - The three files under questions/ are deleted and match `git show origin/main:questions/<name>`.
   - The session id appears in sessions/chief-of-staff/session_01QBwHGL7cLBqyQ4o1BxNuyh.jsonl. I cannot check the owner's exact words beyond the session record.
   - S-011 on item/P-005 is consistent: its open questions 1 to 3, AC17's proposed 360 and 414, and its M8 note with the four narrowings.

2. Pack change: the diff touches only `[roles.definer]` may_read, adding "experiments/{item}-*.md" and "decisions/questions/{item}-*.md". must_read, must_not_see and include_feedback are unchanged.

3. Ledger:
   - L-0055 is appended after L-0053.
   - item/P-005's ledger holds L-0054 ("S-010 superseded", line 692).
   - No other origin ref holds an L-0055 (I scanned every remote ref).
   - The register row and digest lines are present. `ledger_check` and `digest check` pass.

4. Measurement, re-run in a scratch folder:
   - `orchestrator_git.py tree --item P-005 --default-ref origin/main --overlay <empty> --out …/tree` returned OK. main is at 4ae7d08 and item/P-005 at a8e9274, matching the records.
   - `MODEL_DEFINER=x session_runner.py pack` with the given entry gave 224 files on main's config and 240 with `--config` set to the branch's governance/.
   - The 16 added are experiments/P-005-E1.md, experiments/P-005-E2.md and the 14 decisions/questions/P-005-*.md (acting, copying-job, critic-pack, experiments, groundwork-shortlist, lasting-copies, model-3.7.3, reading, route, spec-id-author, spec-id-clash, spec-id-fix, spec-sources, vendor-pages).

5. Exposure:
   - govlib.glob_to_regex: `*` never crosses `/`. The pattern needs the hyphen after the item id, so "P-0050-x.md" does not match.
   - session_runner cmd_pack drops `decisions/**/*-notes.md` by name, and holdouts are always excluded.
   - Seeded test: I added decisions/questions/P-005-seed-notes.md, decisions/questions/P-0050-other.md and experiments/P-0051-E1.md to a copy of the tree. The pack stayed at 240 and none of the three entered it.
   - The existing decisions/questions/P-001-trial-view-notes-*.md files (another item) stay out. EXP-*.md registrations stay out.

6. `bash governance/checks/check_all.sh . origin/main` on HEAD d0dd7067 (working tree clean before and after): rc=0, "OK: all governance checks passed". This includes surface_guard diff, ledger_check, the v3 holdouts check, record_checks decisions and charters.

7. Commits:
   - 5403442a is by chief-of-staff (answers and PACKS.toml).
   - a281fd72 is by orchestrator (ledger, register, digest).
   - d0dd7067 is a merge commit (two parents, not squashed) by chief-of-staff.
   - Each uses `<id>@agents.invalid`, carries `Agent-Session: session_01QBwHGL7cLBqyQ4o1BxNuyh`, and has no model names or co-author lines.
   - None carries `Spec:`, which is correct: these are not builder commits for a spec.

8. PR body (`gh api repos/{owner}/{repo}/pulls/447`; GraphQL is blocked): head sha d0dd7067, not a draft. It has the heading and paragraph (see B1), the Milestone line, Context, Why with the owner's words verbatim and matching the records, and Tasks. Ticked tasks 1 to 3 are done in the diff. Tasks 4 and 5 are unticked with "(added: …)". The body does not end in `Word: value` lines.

**Open questions**
- My standing instruction points to a reviewer checklist in docs/archive/OPERATING_MODEL_v2.5.1.md §12 and cites L-0112. That file is not in Service-Desk, and the ledger has no L-0112 (it ends at L-0055). The model repository was not looked at this time. The #444 Reviewer raised the same pointer. I reviewed against AGENTS.md §1, §4 and §5 and .claude/agents/reviewer.md instead. Should that instruction be corrected?
- AGENTS.md §1 calls the orchestrator "the sole merger", but merge commit d0dd7067 is by chief-of-staff. The same pattern went through in #444 (e5d1bc7b) and its Reviewer accepted it. Is that a permitted exception, and if so, where is it recorded?
