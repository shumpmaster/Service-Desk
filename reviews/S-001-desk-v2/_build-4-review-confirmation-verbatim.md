# S-001 desk v2, stage 4 (the question and gate sheets): the Reviewer's confirmation, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-4 at 0be0d16.

---

Verdict: PASS

I keep my stage 4 PASS for S-001 at 0be0d16 (build/builder/desk-v2-4). The two new commits, 574a728 and 0be0d16, break nothing I could find.

**1. The diff, the shared markdown.js, and codeWords**
- **Six files changed:** src/lib/markdown.js, src/public/lib/markdown.js (identical to it; build.mjs says "35 page modules in step"), sandbox.css, sandbox.js, and two test files.
- **Output without the option is byte-for-byte unchanged.**
  - I ran the 61b9e93 and 0be0d16 versions of `renderMarkdown` over every `.md` file under /home/user: 82,477 files, 468 MB of HTML, 46,277 ordered lists.
  - Each was called with no options, with `{}` and with `{ numbers: false }`. Result: 0 differences.
  - 7 edge cases also match: `2)` items, indented items, CRLF and lone CR, `01.`, empty input, a 21-digit number, inline code and links in items.
  - All the accepted views' callers still pass no option (app.js:619, 661, 681, 700, 713; sandbox.js:1848, 2309). Only the fold (sandbox.js:2031) and the one-box fallback (sandbox.js:2084) pass `{ numbers: true }`.
- **`value="N"` can't carry HTML.** It comes only from `[0-9]+` through `Number()`, so it is always a number.
- **codeWords builds text only** (sandbox.js:1989). It splits on backticks. Strings go through `h()`, which turns every non-Node child into `createTextNode` (sandbox.js:151–154). It never sets `html` (innerHTML).
- **Injection probe.** A temporary test drove the real gate sheet with these card lines:
  - `` `<img src=x onerror=alert(1)>` ``, `` `<script>alert(2)</script>` `` and a lone backtick in an option.
  - `` `<b onmouseover=alert(3)>x</b>` `` and `` `&lt;&amp;` `` in "Why it is here".
  - Result: the sheet has no img, script or b element. Each `<code>` holds its words as literal text, entities not decoded. The lone backtick stays as written.

**2. Each new test fails under its mutation.** 19 mutations, run against ac85-sheets and ac80-board. 18 were caught:
- **B1 list numbers:** caught when the option is ignored, always on, or counts k+1 instead of the file's number. Also caught when the fold or the fallback drops `{numbers:true}`, and when either CSS list rule is removed.
- **Separator:** caught when it is removed from the Done item (fails ac80 test 10 and ac85 test 38) or from the fold (test 39), and when it is made visible (no `sb-vh`).
- **N4a focus:** caught when the opener goes back to `card:` (test 50).
- **codeWords:** caught when it is a no-op, when "Why it is here" or the gate options skip it, when the code is set as `html`, and when `.v2-code` loses its mono font (test 40).
- **R2-N1:** caught when the `^` anchor is removed and when the trim is removed (test 51).
- **One survived (M16):** dropping the lone backtick. See finding N1.

**3. No test was weakened.**
- No test was removed: ac85 went from 20 to 23 tests (233 to 257 asserts); ac80 stays at 28.
- Each removed line was replaced:
  - The ac80-board change (`'Move to Donethen…'` → `'Move to Done · then answer on GitHub'`) is just as strict. It tracks the new separator, and M8 shows it fails when the separator goes.
  - The gate-option strings lost their backticks. In return, the test now checks each `<code>` element's text, that no raw backtick is left, and the `.v2-code` font. That is stricter.
- `review_check.py pr 999 --base 99a6437`: R1. It requires design-reviewer and reviewer, and its only two failures are their missing verdict files. That is expected for the dry-run PR number.

**4. Suite and checks**
- `cd src && node --test ../tests/desk/*.test.mjs`: 982 tests, 982 pass, 0 fail. This matches the orchestrator's count.
- `node src/tools/build.mjs`: PASS (exit 0).
- `bash governance/checks/check_all.sh . 99a6437`: exit 0, every line OK or PASS.
- `surface_guard.py diff --range 99a6437..0be0d16 --branch build/builder/desk-v2-4`: OK, 5 commits checked.

**New findings (none blocking)**
- **N1 (route to Build, stage 4 follow-up).** A lone backtick staying as written is untested. The comment at sandbox.js:1986–1987 says "a lone backtick stays", but M16 (drop it) passes all tests. The probe showed it does work today. It needs one assertion with an odd number of backticks.
- **N2 (note only, no action needed).** A list number of 22 digits or more gives `value="1e+21"`. A browser ignores that value and counts instead. No real record has such a number.

**Open questions:** none.

**Cleanup:** I removed my scratch worktrees (rv-v2-4c and rv-mut) and temp files. No project file was changed. Four other worktrees in the scratchpad aren't mine, so I left them: mainchk, wt-base, wt-dr4r2 and wt-r1, all under /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/.