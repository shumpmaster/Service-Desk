// ac-test: S-001/AC11 — a flagged card's full text, rendered from its markdown, with every option
// and the answer path the card names, without sideways scrolling on a phone.
// ac-test: S-001/AC12 — a flagged owner question's view: title, WHY, options with letters, the
// recommendation marked, risk class, reversibility, blast radius and the DEFAULT label.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderMarkdown, escapeHtml } from '../../src/lib/markdown.js';
import { buildModel, parseRecord } from '../../src/lib/model.js';
import { defaultLabel } from '../../src/lib/records.js';
import { blastLine, undoLine } from '../../src/lib/sheets.js';
import { fixture, CONFIG, SD, SRC } from './helpers.mjs';

const sd = (p) => fixture(`service-desk/${p}`);

test('AC11: the card view has the full text rendered, every option, and the answer path', () => {
  const text = sd('queue/P-001-stop-6.md');
  const tree = new Map([['queue/P-001-stop-6.md', { sha: '1'.repeat(40) }]]);
  const records = new Map([['queue/P-001-stop-6.md', parseRecord('card', text, 'queue/P-001-stop-6.md')]]);
  const m = buildModel({ project: SD, config: CONFIG, tree, records, now: new Date('2026-10-06T19:00:00Z') });
  const card = m.flagged[0].card;
  assert.equal(card.parsed.answerPath, 'decisions/P-001/stop-6.md');
  assert.deepEqual(card.parsed.options.map((o) => o.word), ['re-specify', 'criteria-wrong', 'confirm', 're-scope', 'drop']);
  const html = renderMarkdown(card.parsed.text);
  for (const w of ['re-specify', 'criteria-wrong', 'confirm', 're-scope', 'drop']) assert.ok(html.includes(`<code>${w}</code>`), w);
  assert.ok(html.includes('<h2>Decision card — P-001 stop-6</h2>'));
  assert.ok(html.includes('<h3>4. Options</h3>'));
  assert.ok(html.includes('<code>decisions/P-001/stop-6.md</code>'));
  assert.ok(html.includes('The work reached the stop rule. What happens next?'));
  assert.equal(card.link, 'https://github.com/shumpmaster/Service-Desk/blob/main/queue/P-001-stop-6.md');
});

test('AC11/AC12: record text is data, never markup — it is escaped, and only http(s) links become anchors', () => {
  const html = renderMarkdown('# <img src=x onerror=alert(1)>\n\n<script>alert(1)</script> [x](javascript:alert(1)) [ok](https://github.com/a) `<b>`\n');
  assert.ok(!/<script|<img|javascript:alert\(1\)"|onerror=alert\(1\)>/.test(html), html);
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('<a href="https://github.com/a" rel="noopener noreferrer" target="_blank">ok</a>'));
  assert.ok(html.includes('<code>&lt;b&gt;</code>'));
  assert.equal(escapeHtml(`"'&<>`), '&quot;&#39;&amp;&lt;&gt;');
});

test('AC11/AC12 (review N2): a markdown link to a non-http(s) scheme parses as a link and still produces no anchor or href', () => {
  // These have no parenthesis inside the target, so the link pattern matches them and the href
  // filter is what decides.
  for (const target of ['javascript:void0', 'JavaScript:void0', 'data:text/html,x', 'vbscript:x', '//evil.example/x', 'mailto:a@b.c']) {
    const html = renderMarkdown(`see [x](${target}) here`);
    assert.ok(!/<a\b/i.test(html), `${target}: ${html}`);
    assert.ok(!/href/i.test(html), `${target}: ${html}`);
    // The link was parsed (text then target in brackets), not left as raw markdown.
    assert.ok(!html.includes('[x]('), `${target} parsed as a link: ${html}`);
  }
  // Control: the same form with https does become an anchor.
  assert.match(renderMarkdown('[x](https://github.com/a)'), /<a href="https:\/\/github\.com\/a"/);
});

test('AC11/AC12: the page wraps long words and preformatted text, so nothing needs sideways scrolling at 360 px', () => {
  const css = readFileSync(join(SRC, 'public', 'style.css'), 'utf8');
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*hidden/);
  assert.match(css, /\.record pre\s*\{\s*white-space:\s*pre-wrap/);
  const html = readFileSync(join(SRC, 'public', 'index.html'), 'utf8');
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
});

test('AC12: the question view\'s fields from Q-005-sources, the recommendation marked, and "not given" for missing labels', () => {
  const text = sd('questions/Q-005-sources.md');
  const tree = new Map([['questions/Q-005-sources.md', { sha: '2'.repeat(40) }]]);
  const records = new Map([['questions/Q-005-sources.md', parseRecord('question', text, 'questions/Q-005-sources.md')]]);
  const history = new Map([['questions/Q-005-sources.md', { oldest: '2026-10-01T11:48:24Z' }]]);
  const m = buildModel({ project: SD, config: CONFIG, tree, records, history, now: new Date('2026-10-01T13:00:00Z') });
  const q = m.flagged[0].question;
  const p = q.parsed;
  assert.equal(p.title, 'do two Anthropic pages count as two sources?');
  assert.ok(p.why.length > 20);
  assert.deepEqual(p.options.map((o) => `${o.letter}. ${o.text.split(' — ')[0]}`), ['A. Accept', 'B. Strict']);
  assert.equal(p.recommendationLetter, 'A');
  assert.equal(p.riskClass, 'R0');
  assert.equal(p.reversibility, 'reversible');
  assert.ok(p.blastRadius);
  assert.equal(q.raisedAt.toISOString(), '2026-10-01T11:48:24.000Z');
  const fmt = (d) => d.toISOString();
  assert.equal(defaultLabel(p, q.raisedAt, fmt), 'per the question file: defaults to A at 2026-10-02T11:48:24.000Z');
  // An irreversible question never defaults; the label only reports the file.
  const irr = parseRecord('question', text.replace('REVERSIBILITY: reversible', 'REVERSIBILITY: irreversible'), 'questions/Q-005-sources.md');
  assert.equal(defaultLabel(irr, q.raisedAt, fmt), 'per the question file: never defaults');
  // A file lacking fields: still flagged, fields null ("not given" in the view).
  const thin = parseRecord('question', '# Ruling needed: thin\n\nWHY: because\n', 'questions/thin.md');
  assert.equal(thin.riskClass, null);
  assert.equal(thin.blastRadius, null);
  assert.equal(defaultLabel(thin, null), 'not given');
  // From stage 8 (AC44, step 4, specs/S-001.md:2918-2921): the accepted question view is gone; the desk's question
  // sheet (AC85) prints "not given" for each missing field, from its record (AC12's words).
  assert.equal(blastLine(thin), 'Blast radius: not given · risk not given', 'the eye line');
  assert.equal(undoLine(thin, null, 'America/Chicago').text, 'Reversibility: not given · Default: not given', 'the undo line');
  assert.ok(readFileSync(join(SRC, 'public', 'sandbox.js'), 'utf8').includes('blastLine(') && readFileSync(join(SRC, 'public', 'sandbox.js'), 'utf8').includes('undoLine('), 'the desk draws both lines');
});


test('AC12 (S-001 stage 4\'s build review, round 1, B1 and N5): the desk\'s DEFAULT label (the accepted view\'s until stage 8) reads a default only from a letter starting the field; a DEFAULT naming none is quoted as the file writes it, with no letter and no time', async () => {
  // Service-Desk's real questions/P-001-design-pick.md at f8dfd1b: `DEFAULT: none — this is your pick and never defaults (AC43)   TIMEOUT: none`.
  const text = fixture('trial-view/P-001-design-pick.md');
  const p = parseRecord('question', text, 'questions/P-001-design-pick.md');
  const raised = new Date('2026-10-14T16:00:00Z');
  const fmt = (d) => d.toISOString();
  assert.equal(defaultLabel(p, raised, fmt), 'per the question file: DEFAULT none — this is your pick and never defaults (AC43)', 'never "defaults to A" from AC43');
  assert.equal(defaultLabel({ ...p, timeout: '48' }, raised, fmt), 'per the question file: DEFAULT none — this is your pick and never defaults (AC43)', 'with a TIMEOUT in hours, no time');
  assert.equal(defaultLabel({ reversibility: 'reversible', default: 'none', timeout: '48' }, raised), 'per the question file: DEFAULT none', 'no raw time');
  // A letter starting the field reads as before.
  assert.equal(defaultLabel({ reversibility: 'reversible', default: 'A', timeout: '24' }, raised, fmt), 'per the question file: defaults to A at 2026-10-15T16:00:00.000Z');
  // On the desk's question sheet itself (from stage 8, AC44, step 4, specs/S-001.md:2918-2921: the accepted question view
  // is gone; AC85's sheet quotes the same field, from the same rule, records.js's defaultLetter). Rewritten at stage 5 of
  // "After MD3" (AC89 (j), :7916-7917): "the default line reads 'Default, per the question file: <its DEFAULT: words>',
  // the file's words set apart as quoted record text, never 'DEFAULT' twice".
  const { loadSandbox, byClass } = await import('./sandbox-helpers.mjs');
  const { repo } = await import('./fake-desk.mjs');
  const sd = repo({ 'governance/ROUTING.toml': fixture('service-desk/governance/ROUTING.toml'), 'questions/P-001-design-pick.md': text }, [], [{ name: 'governance', status: 'completed', conclusion: 'success' }]);
  sd.history = { 'questions/P-001-design-pick.md': [{ commit: { committer: { date: '2026-10-14T16:00:00Z' } } }] };
  const repos = { 'Service-Desk': sd, 'Personal-Org-Operating-Model': repo({ 'docs/LEDGER.md': fixture('poom/docs/LEDGER.md') }, [], [{ name: 'tests', status: 'completed', conclusion: 'success' }]) };
  const app = await loadSandbox({ config: CONFIG, repos, now: Date.parse('2026-10-14T17:00:00Z'), hash: `#/waiting/card/${encodeURIComponent('Service-Desk|question|questions/P-001-design-pick.md')}` });
  try {
    await app.advance(1000);
    const sheet = byClass(app.view, 'v2-sheet')[0];
    assert.ok(sheet, 'the question\'s sheet');
    assert.ok(sheet.textContent.includes('Default, per the question file: none — this is your pick and never defaults (AC43)'), sheet.textContent);
    assert.equal(byClass(sheet, 'v2-dq')[0].textContent, 'none — this is your pick and never defaults (AC43)', 'the file\'s words, quoted, "DEFAULT" never twice');
    assert.doesNotMatch(sheet.textContent, /Settles itself|defaults to A/, 'never "defaults to A" from AC43');
  } finally {
    app.restore();
  }
});
