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
  const app = readFileSync(join(SRC, 'public', 'app.js'), 'utf8');
  assert.ok(app.includes("'not given'"), 'the view prints "not given" for a missing field');
});
