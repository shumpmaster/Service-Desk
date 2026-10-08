// GitHub links the page builds (spec S-001, J3's URL form; EXP-004's test links), and from M2 the
// answer the desk offers for a flagged card or owner question (AC16–AC19). The desk writes nothing
// to GitHub: it opens GitHub's new-file page, prefilled, and the owner commits there.

function encSegments(s) {
  return String(s).split('/').map(encodeURIComponent).join('/');
}

/** A file on the project's default branch. */
export function blobLink(project, path) {
  return `https://github.com/${project.repo}/blob/${encSegments(project.defaultBranch)}/${encSegments(path)}`;
}

/**
 * GitHub's new-file page (J3): `https://github.com/<repo>/new/<defaultBranch>?filename=<path>&<param>=<content>`.
 * The content parameter is left out when `content` is null or the repository's contentPrefill is false.
 */
export function newFileUrl(project, path, content) {
  let url = `https://github.com/${project.repo}/new/${encSegments(project.defaultBranch)}?filename=${encodeURIComponent(path)}`;
  if (content != null && project.contentPrefill !== false) {
    url += `&${encodeURIComponent(project.contentParam || 'value')}=${encodeURIComponent(content)}`;
  }
  return url;
}

/**
 * A new-file link within the cap (AC17's rule): { url, copy } — when the full link would be longer
 * than linkCap, or the repository doesn't take prefilled content, `url` fills only the file name
 * and `copy` holds the text for the owner to paste.
 */
export function cappedNewFileLink(project, path, content, linkCap) {
  const full = newFileUrl(project, path, content);
  if (project.contentPrefill !== false && full.length <= linkCap) return { url: full, copy: null };
  return { url: newFileUrl(project, path, null), copy: content };
}

/** EXP-004's (a) content: `&`, `#`, `%`, an emoji and two newlines. */
export const EXP004_SHORT = 'EXP-004 link (a): ampersand & hash # percent % emoji \u{1F9EA}\nsecond line\n';
export const EXP004_LENGTHS = [null, 2000, 6000, 8000];

/** The content of EXP-004 link n (1–4) for a project, sized so the whole link is exactly its length. */
export function exp004Content(project, n) {
  const path = `docs/exp-004/link-test-${n}.md`;
  if (n === 1) return EXP004_SHORT;
  const target = EXP004_LENGTHS[n - 1];
  let content = `EXP-004 link (${'abcd'[n - 1]}), total link length ${target}\n`;
  let i = 1;
  for (;;) {
    const line = `line ${String(i).padStart(4, '0')} of the EXP-004 length test\n`;
    if (newFileUrl(project, path, content + line).length > target) break;
    content += line;
    i++;
  }
  while (newFileUrl(project, path, content).length < target) content += 'x';
  return content;
}

/** EXP-004's four links for a project: [{ n, label, path, url, length, content }]. */
export function exp004Links(project) {
  const labels = ['(a) short, with & # % an emoji and two newlines', '(b) 2,000 characters', '(c) 6,000 characters',
    '(d) 8,000 characters'];
  return [1, 2, 3, 4].map((n) => {
    const path = `docs/exp-004/link-test-${n}.md`;
    const content = exp004Content(project, n);
    const url = newFileUrl({ ...project, contentPrefill: true, contentParam: 'value' }, path, content);
    return { n, label: labels[n - 1], path, url, length: url.length, content };
  });
}

// ---------------------------------------------------------------------------
// Answering from the desk (M2: AC16–AC19, J3; AC46 and AC47 offer no answer)

/** The owner's note, tidied: line endings normalised, trailing blank space dropped; '' for none. */
export function tidyNote(note) {
  return String(note == null ? '' : note).replace(/\r\n?/g, '\n').replace(/\s+$/, '');
}

/** J3's card content: `Decision: <option>` and, with a note, a blank line and the note. */
export function cardAnswerContent(option, note) {
  const n = tidyNote(note);
  return `Decision: ${option}\n${n ? `\n${n}\n` : ''}`;
}

/** J3's question content: `Ruling: <letter>`, a blank line, `Question: questions/<name>.md`, then any note. */
export function questionAnswerContent(letter, name, note) {
  const n = tidyNote(note);
  return `Ruling: ${letter}\n\nQuestion: questions/${name}.md\n${n ? `\n${n}\n` : ''}`;
}

/** AC19's v2.5 text: `Ruling: <letter>` and the note, to copy to the session. */
export function v25RulingText(letter, note) {
  const n = tidyNote(note);
  return `Ruling: ${letter}\n${n ? `\n${n}\n` : ''}`;
}

export const HOLD_NO_ANSWER = 'No answer needed: fix or re-run the governance run; this clears once it passes.';
export const mergeNoAnswer = (item) => `No answer needed: merge item/${item} by hand, or change the item and let the merge gate try again.`;
export const V25_RULING_NOTE = 'this repository records rulings in its ledger; give this to your session';
export const webCommitsWarning = (branch, what) => `This repository doesn't take commits to ${branch} from the web. On GitHub, `
  + `choose 'Create a new branch' and then open the pull request GitHub offers; the ${what} stays flagged until that pull request is merged.`;
export const COPY_WORDS = 'The answer is too long to prefill, or this repository doesn\'t take prefilled content: copy it, then paste it into the page GitHub opens.';

/**
 * What the desk offers for a flagged item.
 * target: { kind: 'card' | 'question' | 'hold' | 'merge', answerPath, name, item, options: [word|letter],
 *   answered: null | { verdict } }.
 * Returns one of:
 *   { offer: 'none', words }                         — already answered, or a hold or merge card;
 *   { offer: 'choose' }                              — no option picked yet;
 *   { offer: 'copy', copy, words }                   — v2.5 question (AC19): no link at all;
 *   { offer: 'link', url, copy: null|text, words, warning: null|text, path, content }.
 */
export function answerPlan(project, linkCap, target, choice, note) {
  if (target.kind === 'hold') return { offer: 'none', words: HOLD_NO_ANSWER };
  if (target.kind === 'merge') return { offer: 'none', words: mergeNoAnswer(target.item) };
  if (target.answered) return { offer: 'none', words: `already answered: ${target.answered.verdict || 'not recorded'}` };
  if (!choice || !(target.options || []).includes(choice)) return { offer: 'choose' };
  if (target.kind === 'question' && project.model !== 'v3') {
    return { offer: 'copy', copy: v25RulingText(choice, note), words: V25_RULING_NOTE };
  }
  const path = target.kind === 'card' ? target.answerPath : `decisions/questions/${target.name}.md`;
  const content = target.kind === 'card' ? cardAnswerContent(choice, note) : questionAnswerContent(choice, target.name, note);
  const link = cappedNewFileLink(project, path, content, linkCap);
  return {
    offer: 'link', url: link.url, copy: link.copy, path, content,
    words: link.copy ? COPY_WORDS : null,
    warning: project.webCommitsToDefault === false ? webCommitsWarning(project.defaultBranch, target.kind === 'card' ? 'card' : 'question') : null,
  };
}
