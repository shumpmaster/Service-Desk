// GitHub links the page builds (spec S-001, J3's URL form; EXP-004's test links).
// M1 answers nothing from the desk: it links to records on GitHub, and offers the two
// experiments' links. J3's answer links are M2's.

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
