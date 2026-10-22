// Records the accepted M1 and M2 views' facts for AC55's comparison (tests/desk/accepted-views.mjs), drawn by
// the accepted page itself (src/public/app.js) under tests/desk/page-harness.mjs as both stood at bd4097d, the last
// commit that drew the accepted views (S-001 AC44, step 4: stage 8 removes them), from the repository root:
//   node tests/desk/tools/accepted-views-snapshot.mjs
// It writes tests/desk/fixtures/accepted-views-bd4097d.json. After stage 8 it can no longer run (the accepted page and
// page-harness.mjs are gone; check out bd4097d to run it again): the record stands.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadApp } from '../page-harness.mjs';
import { POLL_MS } from '../../../src/lib/scheduler.js';
import { detailRepos, facts, WHEN, CASES } from '../accepted-views.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const out = { recordedAt: 'bd4097d', by: 'tests/desk/tools/accepted-views-snapshot.mjs', views: {} };
for (const [kind, acceptedHash, , names] of CASES) {
  for (const name of names) {
    const route = `#/p/${name}${acceptedHash ? `/${acceptedHash}` : ''}`;
    const acc = await loadApp({ hash: route, repos: detailRepos(), now: WHEN });
    try {
      await acc.advance(1000);
      await acc.advance(POLL_MS);
      out.views[`${kind}|${name}`] = { route, facts: facts(acc.els.view), text: acc.els.view.textContent.replace(/\s+/g, ' ') };
    } finally {
      acc.restore();
    }
  }
}
writeFileSync(join(HERE, '..', 'fixtures', 'accepted-views-bd4097d.json'), `${JSON.stringify(out, null, 1)}\n`);
console.log(Object.entries(out.views).map(([k, v]) => `${k}: ${v.facts.length} facts`).join('\n'));
