// A made-up portfolio for stage 6b's tests (spec S-001, AC87, J23, J24): **NOT real records**. The portfolio
// repository (shumpmaster/portfolio) is private, so none of its files is copied or read here; these are
// written for the tests in poom/'s placeholder form: the forms J23 names (the idea log's level-2 headings
// with their `state:` lines, J2's card sections, the rarer records' folders), with made-up words, each file
// saying it is made up. tests/desk/fixtures/README.md lists them.
import { repo, PORTFOLIO_REPO } from './fake-desk.mjs';
import { CONFIG, PORTFOLIO } from './helpers.mjs';

export const MADE_UP = 'made up for the desk\'s tests, NOT a real record';

/** The idea log: ideas in each state, one with no `state:` line and one with another value (J23), after the template's own example heading. */
export const IDEAS = `# Ideas (${MADE_UP})

## YYYY-MM-DD <the idea's name>
state: captured

## 2026-10-15 A made-up reading-list app
state: shaping

## 2026-10-16 A made-up weekly digest
state: captured

## 2026-10-17 A made-up price tracker
state: \`approved\`
state: stopped

## 2026-10-18 A made-up route planner
state: re-aimed

## 2026-10-19 A made-up habit log
state: stopped

## 2026-10-20 A made-up idea with no state line
Notes only.

## 2026-10-21 A made-up idea with another value
state: maybe
`;

/**
 * A decision card in the portfolio template's form, made up (review round 1, B2): its sections as J2 reads a
 * card's (`## 1. The decision` to `## 7. Who has checked it`, the options under `## 4. Options`) and a
 * `Milestone:` line, and no `answer:` line, which the model's portfolio template doesn't write (J23 reads no
 * portfolio answer form). `milestone`: the line's value, or null for none.
 */
export const cardText = (n = 1, title = 'Whether to explore the made-up reading-list app as a project', { milestone = 'PM1' } = {}) => `# Decision card — PF-001 explore-${n} (${MADE_UP})
${milestone == null ? '' : `\nMilestone: ${milestone}\n`}
## 1. The decision
${title}

## 2. Why it is here
A made-up idea reached shaping in the made-up idea log.

## 3. What was checked
Nothing: it is made up.

## 4. Options
- \`explore\` — open it as a project (made up)
- \`park\` — keep it in the idea log (made up)

## 5. Recommendation
\`park\` until the desk is live (made up).

## 6. What happens next
Made up.

## 7. Who has checked it
No one: made up.
`;

/** The made-up portfolio's files: { path: text }. `queue`: the cards in its queue (file → text); `more`: any other file. */
export function pfFiles({ ideas = IDEAS, queue = {}, more = {} } = {}) {
  const f = {
    'README.md': `# Portfolio (${MADE_UP})\n`,
    'queue/_DECISION_CARD.md': `# The decision card's template (${MADE_UP})\n`,
    'queue/_CRITIQUE_DIGEST.md': `# The critique digest's template (${MADE_UP})\n`,
    'rulings/README.md': `# Rulings (${MADE_UP})\n`,
    'rulings/R-001-made-up.md': `Ruling: A (${MADE_UP})\n`,
    'rulings/R-002-made-up.md': `Ruling: B (${MADE_UP})\n`,
    'intent/README.md': `# Standing intent (${MADE_UP})\n`,
    'intent/_TEMPLATE.md': `# Intent's template (${MADE_UP})\n`,
    'library/facts/README.md': `# Library facts (${MADE_UP})\n`,
    ...(ideas == null ? {} : { 'ideas/IDEAS.md': ideas }),
    ...Object.fromEntries(Object.entries(queue).map(([k, v]) => [`queue/${k}`, v])),
    ...more,
  };
  return f;
}

/** A config with J7's portfolio (the committed `{ repo: "shumpmaster/portfolio", defaultBranch: "main" }`). */
export const withPortfolio = (config = CONFIG) => ({ ...config, portfolio: PORTFOLIO });

/** Add the made-up portfolio to a test's repos (under the fake server's own key). */
export function addPortfolio(repos, files = pfFiles()) {
  const r = repo(files);
  repos[PORTFOLIO_REPO] = r;
  return r;
}
