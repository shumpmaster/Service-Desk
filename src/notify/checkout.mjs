// The sender's reader of its own project (spec S-001, J16): the workflow's checkout of the default
// branch, with its history (`fetch-depth: 0`), never a pull request's head. It reads the tree, the
// blobs the desk's readers need, a file's oldest commit and whether a commit is merged, with git
// alone. Nothing here runs anything from the checkout.

import { execFileSync } from 'node:child_process';

const MAX_BUFFER = 512 * 1024 * 1024;

/** A git runner for a checkout: (args, input?) → Buffer; throws when git fails. */
export function gitIn(root) {
  return (args, input) => execFileSync('git', ['-C', root, '-c', 'core.quotepath=off', ...args], {
    input, maxBuffer: MAX_BUFFER, stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0' } });
}

/** The exit status of a git command (0 or its code), for `merge-base --is-ancestor`. */
function gitStatus(git, args) {
  try {
    git(args);
    return 0;
  } catch (e) {
    return typeof e.status === 'number' ? e.status : -1;
  }
}

/**
 * Open a checkout. Returns { head, shallow, tree: Map(path → { sha, mode }), blobs(paths) →
 * Map(path → text|null), oldestAdd(path) → ISO|null, isAncestor(a, b) → true|false|null, git }.
 */
export function openCheckout(root, git = gitIn(root)) {
  const head = git(['rev-parse', '--verify', 'HEAD^{commit}']).toString('utf8').trim();
  const shallow = git(['rev-parse', '--is-shallow-repository']).toString('utf8').trim() === 'true';
  const tree = new Map();
  const raw = git(['ls-tree', '-r', '-z', '--full-tree', head]).toString('utf8');
  for (const entry of raw.split('\0')) {
    if (!entry) continue;
    const tab = entry.indexOf('\t');
    const [mode, type, sha] = entry.slice(0, tab).split(' ');
    if (type === 'blob') tree.set(entry.slice(tab + 1), { sha, mode });
  }

  function blobs(paths) {
    const out = new Map();
    const want = paths.filter((p) => tree.has(p));
    if (!want.length) return out;
    const data = git(['cat-file', '--batch'], Buffer.from(want.map((p) => tree.get(p).sha).join('\n') + '\n'));
    let pos = 0;
    for (const p of want) {
      const nl = data.indexOf(0x0a, pos);
      const header = data.subarray(pos, nl).toString('utf8').split(' ');
      if (header.length !== 3 || header[1] !== 'blob') {
        out.set(p, null);
        pos = nl + 1;
        continue;
      }
      const size = Number(header[2]);
      const body = data.subarray(nl + 1, nl + 1 + size);
      pos = nl + 1 + size + 1;
      let text = null;
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(body);
      } catch {
        text = null;
      }
      out.set(p, text);
    }
    return out;
  }

  /** The oldest commit adding a path (J16; AC20's "oldest commit"): `git log --diff-filter=A --format=%cI`, its last line. */
  function oldestAdd(path) {
    const outText = git(['log', '--diff-filter=A', '--format=%cI', head, '--', path]).toString('utf8').trim();
    if (!outText) return null;
    const ls = outText.split('\n');
    return ls[ls.length - 1].trim() || null;
  }

  /** `git merge-base --is-ancestor a b`: true, false, or null when git cannot say (an unknown commit). */
  function isAncestor(a, b) {
    if (!/^[0-9a-f]{40}$/.test(a || '') || !/^[0-9a-f]{40}$/.test(b || '')) return null;
    const st = gitStatus(git, ['merge-base', '--is-ancestor', a, b]);
    return st === 0 ? true : st === 1 ? false : null;
  }

  return { head, shallow, tree, blobs, oldestAdd, isAncestor, git };
}
