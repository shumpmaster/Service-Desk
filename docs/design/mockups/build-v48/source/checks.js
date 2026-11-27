  /* ================= v48: the pull-request sheet shows its actual checks, option A of options-r9-pr-checks/ (round 9, answers 3 and 4;
     decisions/questions/P-005-design-round-9.md): "can you find a way to incorporate the actual checks instead of just “checks passed”", then
     "A and no". Every check named in two groups, the automatic checks and the AI reviews, running or failed first, each tapping through to its
     run on GitHub or its review's record. The owner's own say on a change to the rules is NOT drawn as a check waiting on the owner ("no"):
     the rules row reads Passed, the heading counts without it, and the Merge answer says that merging also gives that say.
     The pull request's form check is shown running again (its description edited at 11:24 am), so a running state stays visible.
     Names are the real ones: governance.yml (jobs governance and owner-signal), desk-build.yml (build), pr-body.yml; the 47 rules of
     `govlib.py list-checks`; the reviews of governance/risk-paths.toml, recorded in reviews/<PR>/<reviewer>.md. scrub-proof.yml never runs on a
     pull request, so it is not drawn. The pull request, its number, times, durations and review words are an example and say so. ================= */
  var PC = { run: true };
  var PCI = {
    ok: NYI.ok, run: NYI.wait, bad: NYI.back,
    back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5L5.5 8 10 12.5"/></svg>'
  };
  var PC_PR = '212';   /* an example number */
  /* the 47 rules, in the groups `govlib.py list-checks` gives them, in plain words */
  var PC_RULES = [
    { g: 'Who changed what', r: [
      ['surface_guard.map', 'The map of who owns which part is in order'], ['surface_guard.ownership', 'Every file has exactly one owner'],
      ['surface_guard.diff', 'The change stays inside the parts it may touch'], ['surface_guard.range.authorship', 'Each change made by the agent that owns that part; no reviewer changed anything'],
      ['surface_guard.range.trailers', 'Each change names its session and its spec'], ['surface_guard.range.paths', 'Each commit inside its author’s part'],
      ['surface_guard.range.branch', 'The builder worked on a branch of its own'], ['surface_guard.range.independence', 'The tests were not written by the code’s builder'],
      ['surface_guard.range.spec', 'No change follows a spec that was replaced'], ['surface_guard.charters', 'Each agent’s written part is up to date'] ] },
    { g: 'The ledger', r: [
      ['ledger_check.entries', 'The ledger’s entries are in their form'], ['ledger_check.append_only', 'The ledger was only added to, never edited'],
      ['digest.check', 'The digest and the reading packs are current and within size'] ] },
    { g: 'The project’s records', r: [
      ['governance_checks.sprints', 'The sprint files are in order'], ['governance_checks.questions', 'Every question to you is in its form'],
      ['governance_checks.reviewers', 'The reviewers hold reading tools only'], ['governance_checks.builders', 'Each builder has its own file and part'],
      ['governance_checks.handover', 'The handover is in its form'], ['governance_checks.scope', 'The change stays inside the agreed scope'] ] },
    { g: 'Reviews', r: [
      ['review_check.owner', 'Your own say on a change to the rules, given by your merge'],
      ['review_check.config', 'The list of which reviews each path needs is valid'], ['review_check.lint', 'Every review record is in its form, from a known reviewer'],
      ['review_check.verdicts', 'Every required AI review recorded as PASS'], ['review_check.pinning', 'Every added dependency is pinned to one version'] ] },
    { g: 'Specs', r: [
      ['spec_check.status', 'Each spec’s status is one the rules know'], ['spec_check.frozen', 'No frozen spec was edited'],
      ['spec_check.predates', 'The spec was frozen before the work it governs'], ['spec_check.facts', 'A spec being frozen lists its facts and limits, with evidence'] ] },
    { g: 'The rule switches', r: [['enforcement.lint', 'The file that can make a rule warn only is valid']] },
    { g: 'The plan', r: [
      ['v3_checks.scope', 'Each change inside its spec’s areas'], ['v3_checks.ready', 'Each plan’s first part is complete once its spec froze'],
      ['v3_checks.trace', 'Every criterion traces back to something you want'], ['v3_checks.freeze', 'A passing plan review came before the freeze'],
      ['v3_checks.joins', 'Every join between parts has a marked test'], ['v3_checks.holdouts', 'Changes to the held-back tests carry a ledger entry'],
      ['v3_checks.milestones', 'No milestone erased; your licence and the critic’s check recorded'], ['v3_checks.milestone_tags', 'New requests and drafts name their milestones'],
      ['v3_checks.gates', 'Each gate’s case is in its form and cited'], ['v3_checks.sessions', 'Each session’s lines are in their form, only added to'] ] },
    { g: 'The orchestrator’s records', r: [
      ['record-decisions', 'Your answers came from you, or from a proxy with your words'], ['record-merges', 'Each merge checked against its own files'],
      ['record-routing', 'The dispatch log’s chain holds'], ['record-build-cap', 'Builds counted against the cap (reports only)'],
      ['record-grants', 'Grants counted (reports only, until their form is set)'], ['gate-packs', 'Every reading pack within its role’s reads'],
      ['gate-handback', 'A passing check run came before any review'], ['gate-freeze', 'No build started before its spec froze'] ] }
  ];
  var PC_NRULES = PC_RULES.reduce(function (n, g) { return n + g.r.length; }, 0);
  /* the automatic checks: GitHub's runs on the pull request's last change (example times and durations) */
  function pcRuns() {
    var R = [
      { id: 'gov', name: 'The rules', code: 'governance / governance', st: 'ok', word: 'Passed', dur: '4 min 31 s', at: '9:07 am',
        line: 'All ' + PC_NRULES + ' rules passed.',
        does: 'Runs the desk’s tests, then the ' + PC_NRULES + ' rules of the operating model against every change since the pull request’s base.',
        steps: [['Check out', '3 s'], ['Tests', 'npm ci, build, test · 3 min 52 s'], ['Governance checks', PC_NRULES + ' rules · 36 s'], ['Record owner signal inputs', '1 s']],
        rec: '.github/workflows/governance.yml, job governance; governance/checks/check_all.sh' },
      { id: 'build', name: 'The build and tests', code: 'desk-build / build', st: 'ok', word: 'Passed', dur: '3 min 48 s', at: '9:06 am',
        line: 'The desk builds, and every test passes.',
        does: 'Checks the desk’s settings and its alert workflows, then installs, builds and runs every test. It holds no secret.',
        steps: [['Config check', '2 s'], ['Notification workflows check', '1 s'], ['Notification workflows check, its test', '2 s'], ['Build and test', 'npm ci, build, test · 3 min 39 s']],
        rec: '.github/workflows/desk-build.yml, job build' },
      { id: 'form', name: 'The pull request’s form', code: 'pr-body / pr-body', st: 'ok', word: 'Passed', dur: '9 s', at: '9:02 am',
        line: 'It opens with “What this means for you”, in plain words.',
        does: 'Reads the pull request’s description: it must open with “What this means for you” and a plain paragraph. A red mark here does not stop a merge.',
        steps: [['Check out', '2 s'], ['PR body leads with what it means', '4 s']],
        rec: '.github/workflows/pr-body.yml, job pr-body' },
      { id: 'sig', name: 'The signal to the desk', code: 'governance / owner-signal', st: 'ok', word: 'Passed', dur: '14 s', at: '9:07 am',
        line: 'It told the desk this needs you, and that no question is open.',
        does: 'Posts two marks on the change for the desk to read: whether your verdict is needed, and whether a question is open.',
        steps: [['Check out', '2 s'], ['Post owner signal', 'owner-verdict: Owner verdict needed · R3; owner-questions: No open questions · 3 s']],
        rec: '.github/workflows/governance.yml, job owner-signal' }
    ];
    if (PC.run) { var f = R[2]; f.st = 'run'; f.word = 'Running'; f.dur = '12 s so far'; f.line = 'Checking again: its description was edited at 11:24 am.'; f.steps = [['Check out', '2 s'], ['PR body leads with what it means', 'running', 'run']]; }
    var ord = { bad: 0, run: 1, ok: 2 };
    return R.map(function (r, i) { r.i = i; return r; }).sort(function (a, b) { return ord[a.st] - ord[b.st] || a.i - b.i; });
  }
  var PC_REVS = [
    { id: 'reviewer', name: 'The reviewer', code: 'reviews/' + PC_PR + '/reviewer.md', at: '9:48 am', verdict: 'PASS',
      line: 'Ran the tests and the rules; each change was made by the agent that owns that part.',
      who: 'reviewer (read-only, fresh context)', against: 'PR #' + PC_PR + ' at 3f9c2ad (base 8e1d04b), against spec S-039, criteria AC1 to AC6',
      ran: ['The operating model’s tests: all pass', 'check_all.sh against the base: every rule passes', 'surface_guard over the range: three commits, each by its part’s builder, each naming its session and spec', 'The handover flag’s form against five hand-made session files: the two bad ones are refused'],
      notes: ['N1: the flag’s reason has no length limit; a follow-up may cap it.'], why: 'required for R1 and above (governance/risk-paths.toml)' },
    { id: 'design-reviewer', name: 'The design reviewer', code: 'reviews/' + PC_PR + '/design-reviewer.md', at: '10:14 am', verdict: 'PASS',
      line: 'Read the session names as the desk shows them, at 360 and 414 wide: plain and readable.',
      who: 'design-reviewer (read-only, fresh context)', against: 'PR #' + PC_PR + ' at 3f9c2ad, the pages the desk serves',
      ran: ['The desk’s sheets at 360 and 414 wide, light and dark: no sideways scroll', 'Every word measured at 4.5:1 or better', 'The names read as plain words, with the code after them in grey'],
      notes: [], why: 'required for the pages the desk serves, src/public/** (governance/risk-paths.toml)' }
  ];
  function pcSt(st, word) { return '<span class="ny-st ' + (st === 'run' ? 'wait' : st) + '">' + esc(word) + '</span>'; }
  function pcMark(st) { return '<span class="pc-m ' + st + '">' + (PCI[st] || PCI.ok) + '</span>'; }
  function pcRunRow(r) {
    return '<li class="pc-li"><button type="button" class="pc-r" data-pcrun="' + r.id + '">' + pcMark(r.st) +
      '<span class="pc-bd"><span class="pc-top"><span class="pc-n">' + esc(r.name) + '</span>' + pcSt(r.st, r.word) + '</span>' +
      '<span class="pc-l">' + esc(r.line) + '</span><span class="pc-meta">' + esc(r.dur) + ' · <span class="pw-code">' + esc(r.code) + '</span></span></span>' + NYI.chev + '</button></li>';
  }
  function pcRevRow(v) {
    return '<li class="pc-li"><button type="button" class="pc-r" data-pcrev="' + v.id + '">' + pcMark('ok') +
      '<span class="pc-bd"><span class="pc-top"><span class="pc-n">' + esc(v.name) + '</span>' + pcSt('ok', v.verdict) + '</span>' +
      '<span class="pc-l">' + esc(v.line) + '</span><span class="pc-meta">' + esc(v.at) + ' · <span class="pw-code">' + esc(v.code) + '</span></span></span>' + NYI.chev + '</button></li>';
  }
  function pcSumLine(runs) {
    var ok = runs.filter(function (r) { return r.st === 'ok'; }).length, run = runs.filter(function (r) { return r.st === 'run'; }).length,
      bad = runs.filter(function (r) { return r.st === 'bad'; }).length;
    return ok + ' of ' + runs.length + ' passed' + (run ? ', ' + run + ' running' : '') + (bad ? ', ' + bad + ' failed' : '');
  }
  /* every check named, in two short groups (option A) */
  function pcA() {
    var runs = pcRuns();
    return '<h3>Automatic checks <span class="pc-c">' + esc(pcSumLine(runs)) + '</span></h3><ul class="ck pc-list" data-pcgroup="auto">' + runs.map(pcRunRow).join('') + '</ul>' +
      '<h3>AI reviews <span class="pc-c">2 of 2 passed</span></h3><ul class="ck pc-list" data-pcgroup="rev">' + PC_REVS.map(pcRevRow).join('') + '</ul>';
  }
  /* the sheet itself: today's, with the checks in its "What it is" place */
  var PC_MERGE = 'Opens the pull request on GitHub at its merge button; one tap there merges it, and the session names reach the desk. It changes the rules, so merging also gives your own say that the rules ask for.';
  function pcPr() {
    return '<div class="kd">' + ICONS.pr + 'Pull request</div><p class="pw-what">A pull request is a set of changes waiting to be merged into a project.</p>' +
      '<h2>Merge the session names and the handover flag into the operating model?</h2><p class="pw-code pw-sub">Pull request #' + PC_PR + ' · operating model' + NY_EX + '</p>' +
      '<div class="row">' + knSt('wait', 'Waiting on you') + knYou('Yours') + '</div>' + pcA() +
      '<h3>What it changes</h3><ul class="ck"><li><span class="m"></span><span>Each session writes a plain name and, when it must, a handover flag</span></li></ul>' +
      '<h3>Your answer</h3><div class="opts">' +
        nyOpt('Merge', PC_MERGE, 'merge', 'In the desk this opens the pull request at its merge button; your merge is also your own say on the change to the rules.').replace('class="opt"', 'class="opt" data-pcmerge="1"') +
        nyOpt('Not yet', 'It stays open and stays here. The AI team is told you held it; nothing changes.', 'hold', 'In the desk this tells the AI team you held it.') + '</div><div class="kn-ans"></div>' +
      knRec(['An example: no pull request carries it; the checks’ names are the real ones', '.github/workflows/governance.yml, desk-build.yml, pr-body.yml', 'governance/checks/govlib.py list-checks (' + PC_NRULES + ' rules)', 'governance/risk-paths.toml (which reviews a path needs; R3, your own say on a change to the rules)', 'docs/design/requests/2026-11-27-session-names-and-handover.md (what it would hold)']);
  }
  NY_SHEETS.pr = pcPr;
  /* the readers: the run on GitHub, a review's record, the commits; each with Back to the pull request */
  var PC_BACK = '<button type="button" class="pc-back" data-pcback="1">' + PCI.back + 'The pull request</button>';
  function pcReadRun(id) {
    var r = pcRuns().filter(function (x) { return x.id === id; })[0]; if (!r) return;
    nySheetOpen(PC_BACK + '<div class="kd">' + ICONS.pr + 'The run on GitHub</div><h2>' + esc(r.name) + '</h2><p class="pw-code pw-sub">' + esc(r.code) + ' · run 4182 · ' + esc(r.at) + NY_EX + '</p>' +
      '<div class="row">' + pcSt(r.st, r.word) + '<span class="pc-meta">' + esc(r.dur) + '</span></div><h3>What it does</h3><p>' + esc(r.does) + '</p>' +
      '<h3>Its steps</h3><ul class="ck">' + r.steps.map(function (s) { return '<li>' + pcMark(s[2] || 'ok') + '<span>' + esc(s[0]) + '<small>' + esc(s[1]) + '</small></span></li>'; }).join('') + '</ul>' +
      '<div class="ny-acts"><button type="button" class="ny-main" data-nysay="In the desk this opens the run’s page on GitHub, with every line of its log.">Open on GitHub</button></div><div class="kn-ans"></div>' +
      knRec([r.rec]), 'The run on GitHub');
  }
  function pcReadRev(id) {
    var v = PC_REVS.filter(function (x) { return x.id === id; })[0]; if (!v) return;
    nySheetOpen(PC_BACK + '<div class="kd">' + ICONS.decision + 'AI review · its record</div><h2>' + esc(v.name) + ': ' + esc(v.verdict) + '</h2><p class="pw-code pw-sub">' + esc(v.code) + ' · ' + esc(v.at) + NY_EX + '</p>' +
      '<div class="row">' + pcSt('ok', 'Verdict: ' + v.verdict) + '</div><div class="q pc-q">' + esc(v.line) + '</div>' +
      '<h3>Who and what</h3><p>' + esc(v.who) + '. Reviewed ' + esc(v.against) + '. Needed because it is ' + esc(v.why) + '.</p>' +
      '<h3>What it ran</h3><ul class="ck">' + v.ran.map(function (s) { return '<li>' + pcMark('ok') + '<span>' + esc(s) + '</span></li>'; }).join('') + '</ul>' +
      (v.notes.length ? '<h3>Notes, not blocking</h3><ul class="ck">' + v.notes.map(function (s) { return '<li><span class="m"></span><span>' + esc(s) + '</span></li>'; }).join('') + '</ul>' : '') +
      knRec([v.code + ' (its shape: reviews/40/reviewer.md)']), v.name);
  }
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest || !t.closest('.ny-sheet')) return;
    var r = t.closest('[data-pcrun]'); if (r) { pcReadRun(r.dataset.pcrun); return; }
    var v = t.closest('[data-pcrev]'); if (v) { pcReadRev(v.dataset.pcrev); return; }
    if (t.closest('[data-pcback]')) { nySheet('pr'); return; }
  });
