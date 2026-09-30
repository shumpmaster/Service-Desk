"""Shared parsing helpers for the governance tools.

Standard library only. Every tool in this directory imports this module, so
it is copied alongside them into a generated project's governance/checks/.
"""

import datetime
import os
import re
import subprocess
import sys
import unicodedata

SURFACES_REL = "governance/SURFACES.md"
LEDGER_REL = "docs/LEDGER.md"

RISK_PATHS_REL = "governance/risk-paths.toml"
AGENTS_MD_REL = "AGENTS.md"
# model S-009 AC1: this file's presence switches on the v3 checks; its content is never read.
V3_SWITCH_REL = "governance/v3.toml"

ORCHESTRATOR = "orchestrator"
OWNER = "owner"                       # reserved reviewer id: the human owner
AGENT_DOMAIN = "agents.invalid"       # agent commit emails are <id>@agents.invalid
CLASSES = ("builder", "reviewer", "reader", "researcher")
REVIEWER_CLASSES = ("reviewer", "reader", "researcher")
TIERS = ("T0", "T1", "T2", "T3")
RISK_CLASSES = ("R0", "R1", "R2", "R3")
STATUSES = ("installed", "planned")
AUTHORITIES = ("autonomous", "proposes", "escalates")

LEDGER_TYPES = (
    "ruling", "predeclaration", "reading", "kill", "incident", "postmortem",
    "delegation", "defaulted", "tier-change", "rule-experiment", "correction",
)

ENTRY_HEADING_RE = re.compile(r"^## (L-\d{4,}[a-z]?)\b(.*)$")
FIELD_RE = re.compile(r"^([a-z_]+):(.*)$")
LEDGER_ID_RE = re.compile(r"^L-\d{4,}[a-z]?$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def is_v3(root):
    """True when the project at root declares v3: governance/v3.toml exists (model S-009 AC1)."""
    return os.path.isfile(os.path.join(root, V3_SWITCH_REL))


class UsageError(Exception):
    """A usage or parse problem: the tool exits 2."""


class GitError(UsageError):
    """A git command failed."""


# --------------------------------------------------------------------------
# Files and git


def decode_utf8(data, where):
    """Decode bytes as UTF-8; anything else is a UsageError (exit 2) naming `where`."""
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise UsageError("%s is not valid UTF-8 (byte %d: %s)" % (where, exc.start, exc.reason))


def read_bytes(path):
    try:
        with open(path, "rb") as fh:
            return fh.read()
    except OSError as exc:
        raise UsageError("cannot read %s: %s" % (path, exc))


_BARE_CR_RE = re.compile(r"\r(?!\n)")
# The line rule (model S-003 §6): every C0 control but TAB and LF (CR only as part
# of CRLF, checked above), every C1 control (U+0085 included), and the Unicode
# line and paragraph separators.
_LINE_RULE_RE = re.compile("[\x00-\x08\x0b\x0c\x0e-\x1f\x80-\x9f\u2028\u2029]")
_CHAR_NAMES = {
    0x00: "a NUL character", 0x0B: "a vertical tab", 0x0C: "a form feed",
    0x1C: "an information separator", 0x1D: "an information separator",
    0x1E: "an information separator", 0x1F: "an information separator",
    0x85: "a next-line character (NEL)", 0x2028: "a line separator", 0x2029: "a paragraph separator",
}


def reject_bare_cr(text, where):
    """A carriage return not immediately followed by LF is a UsageError (exit 2)."""
    if _BARE_CR_RE.search(text):
        raise UsageError("%s contains a bare carriage return" % where)
    return text


def reject_bad_chars(text, where):
    """Apply the character rules to decoded text: L-0013's bare CR, then model S-003's line rule.

    One UsageError (exit 2) for the first rejected character of the file."""
    reject_bare_cr(text, where)
    m = _LINE_RULE_RE.search(text)
    if m:
        code = ord(m.group())
        name = _CHAR_NAMES.get(code, "a control character" if code < 0x80 else "a C1 control character")
        raise UsageError("%s contains %s (U+%04X) at line %d"
                         % (where, name, code, text.count("\n", 0, m.start()) + 1))
    return text


def strip_cf(text):
    """`text` without Unicode format (Cf) characters: what a reader sees."""
    return "".join(ch for ch in text if unicodedata.category(ch) != "Cf")


def reject_hidden_key(text, key, where):
    """A line whose visible text starts with `key:` but that has Cf characters before it
    is a UsageError (model S-003 §6: the tier line and first_field)."""
    prefix = key + ":"
    for n, line in enumerate(text.split("\n"), 1):
        if not line.startswith(prefix) and strip_cf(line).startswith(prefix):
            raise UsageError("%s line %d: a '%s' line has invisible format characters (Unicode Cf) before it"
                             % (where, n, prefix))


def load_toml(text, where):
    """tomllib.loads that turns a too-deeply nested document into a UsageError.

    Returns (data, error message or None); a TOML syntax error is returned,
    not raised, so callers can report it as a lint failure."""
    try:
        import tomllib
    except ImportError:  # pragma: no cover - guarded by the tools' version check
        raise UsageError("Python 3.11+ is required (tomllib)")
    try:
        return tomllib.loads(text), None
    except tomllib.TOMLDecodeError as exc:
        return None, "%s: invalid TOML: %s" % (where, exc)
    except RecursionError:
        raise UsageError("%s is nested too deeply to parse" % where)


def load_json(text, where):
    """json.loads with a UsageError for invalid or too-deeply nested JSON."""
    import json
    try:
        return json.loads(text)
    except RecursionError:
        raise UsageError("%s is nested too deeply to parse" % where)
    except ValueError as exc:
        raise UsageError("%s is not valid JSON: %s" % (where, exc))


def check_text(data, where, newline=None):
    """Apply the shared read rules (L-0013, model S-003 §6) to bytes read from a file or from git.

    The bytes must be strict UTF-8, must not contain a carriage return that is
    not immediately followed by LF, and must not contain any other control
    character but TAB (C0 or C1) or U+2028/U+2029; any problem is a UsageError
    (exit 2) naming `where`. CRLF is accepted: with newline=None it becomes LF; with
    newline="" the text is returned untranslated.
    """
    text = reject_bad_chars(decode_utf8(data, where), where)
    if newline is None:
        text = text.replace("\r\n", "\n")
    return text


def read_text(path, newline=None):
    """Read a governance file; every governance file is read through here (L-0013).

    The file must be strict UTF-8 and must not contain a carriage return that
    is not immediately followed by LF; either problem, or a file that cannot
    be read, is a UsageError (exit 2). CRLF is accepted: with newline=None it
    becomes LF; with newline="" the text is returned untranslated.
    """
    return check_text(read_bytes(path), path, newline)


def git_blob(root, rev, rel):
    """The bytes of `rel` (relative to root) at commit `rev`, or None when it is absent there."""
    spec = "%s:./%s" % (rev, rel)
    if not git_ok(root, ["cat-file", "-e", spec]):
        return None
    if git(root, ["cat-file", "-t", spec]).strip() != b"blob":
        return None
    return git(root, ["cat-file", "blob", spec])


def git_text(root, rev, rel, newline=None):
    """Read `rel` at commit `rev` through the shared read rules; None when absent."""
    data = git_blob(root, rev, rel)
    if data is None:
        return None
    return check_text(data, "%s at %s" % (rel, rev), newline)


def verify_commit(root, ref, what="base ref"):
    """Raise UsageError unless `ref` names a commit in root; return its full sha."""
    if not git_ok(root, ["rev-parse", "--verify", "-q", "%s^{commit}" % ref]):
        raise UsageError("%s %r is not a commit in %s" % (what, ref, root))
    return git(root, ["rev-parse", "--verify", "-q", "%s^{commit}" % ref]).decode().strip()


def normalize_path(path):
    path = path.strip().replace("\\", "/")
    while path.startswith("./"):
        path = path[2:]
    return path


def resolve_under_root(root, path, what="path"):
    """Return `path` as a POSIX path relative to `root`.

    `path` may be relative to root or absolute. Raises UsageError when it
    points outside root (including via `..` or a symlink) or at root itself.
    """
    if not path:
        raise UsageError("%s is empty" % what)
    root_real = os.path.realpath(root)
    full = path if os.path.isabs(path) else os.path.join(root_real, path)
    full_real = os.path.realpath(full)
    rel = os.path.relpath(full_real, root_real)
    if rel == "." or rel == ".." or rel.startswith(".." + os.sep) or os.path.isabs(rel):
        raise UsageError("%s %r is outside --root %s" % (what, path, root))
    return rel.replace(os.sep, "/")


def read_file_list(path):
    """Read a file list: one path per line, empty lines ignored.

    Only the line ending (newline, and a CR before it) is removed; every other
    character, including leading or trailing spaces, is part of the path.
    """
    try:
        with open(path, "rb") as fh:
            data = fh.read()
    except OSError as exc:
        raise UsageError("cannot read file list %s: %s" % (path, exc))
    text = decode_utf8(data, "file list %s" % path)
    out = []
    for line in text.split("\n"):
        if line.endswith("\r"):
            line = line[:-1]
        if line:
            out.append(line)
    return out


def git(root, args, input=None):
    """Run git in root and return stdout as bytes, or raise GitError."""
    try:
        proc = subprocess.run(
            ["git"] + list(args), cwd=root, input=input,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
    except OSError as exc:
        raise GitError("cannot run git: %s" % exc)
    if proc.returncode != 0:
        msg = proc.stderr.decode("utf-8", "replace").strip()
        raise GitError("git %s failed in %s: %s" % (" ".join(args), root, msg))
    return proc.stdout


def git_ok(root, args):
    """Run git in root; return True when it exits 0."""
    try:
        proc = subprocess.run(
            ["git"] + list(args), cwd=root,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
    except OSError:
        return False
    return proc.returncode == 0


def split_z(data):
    """Split NUL-separated git output. Paths are returned exactly as git gives them."""
    return [p for p in data.decode("utf-8", "surrogateescape").split("\0") if p]


# --------------------------------------------------------------------------
# Globs


def _segment_regex(seg):
    out = []
    for ch in seg:
        if ch == "*":
            out.append("[^/]*")
        elif ch == "?":
            out.append("[^/]")
        else:
            out.append(re.escape(ch))
    return "".join(out)


def glob_to_regex(pattern):
    """Translate a surface glob into an anchored regular expression.

    `**/` matches zero or more leading directory segments; a trailing
    `dir/**` matches `dir` itself and everything below it; `*` and `?`
    never cross `/`; everything else is literal.
    """
    pattern = normalize_path(pattern).lstrip("/")
    parts = []
    for seg in pattern.split("/"):
        # Consecutive `**` segments mean the same as one.
        if seg == "**" and parts and parts[-1] == "**":
            continue
        parts.append(seg)
    n = len(parts)
    out = []
    for i, seg in enumerate(parts):
        last = i == n - 1
        if seg == "**":
            if last:
                out.append(".*" if i == 0 else "(?:/.*)?")
            else:
                out.append("(?:[^/]+/)*")
        else:
            out.append(_segment_regex(seg))
            next_is_trailing_star = (i + 1 == n - 1 and parts[i + 1] == "**")
            if not last and not next_is_trailing_star:
                out.append("/")
    return re.compile("^" + "".join(out) + "$")


_GLOB_CACHE = {}


def glob_match(pattern, path):
    rx = _GLOB_CACHE.get(pattern)
    if rx is None:
        rx = glob_to_regex(pattern)
        _GLOB_CACHE[pattern] = rx
    return rx.match(path) is not None


def surface_includes(rules, path):
    """rules: list of (negated, glob). Later matching lines win."""
    included = False
    for negated, pattern in rules:
        if glob_match(pattern, path):
            included = not negated
    return included


# --------------------------------------------------------------------------
# Fenced blocks


_FENCE_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")


def fenced_blocks(text):
    """Return a list of (info, [(lineno, line)], open_lineno).

    Raises UsageError on an unterminated fence.
    """
    blocks = []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        m = _FENCE_RE.match(lines[i])
        if not m:
            i += 1
            continue
        fence = m.group(1)
        info = m.group(2).strip()
        open_no = i + 1
        body = []
        i += 1
        closed = False
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()
            if (stripped and stripped[0] == fence[0]
                    and len(stripped) >= len(fence)
                    and stripped == fence[0] * len(stripped)):
                closed = True
                i += 1
                break
            body.append((i + 1, line))
            i += 1
        if not closed:
            raise UsageError("unterminated code fence opened at line %d" % open_no)
        blocks.append((info, body, open_no))
    return blocks


def strip_comment(line):
    """Drop a comment: `#` at the start of the line or preceded by whitespace."""
    m = re.search(r"(^|\s)#", line)
    if m:
        line = line[:m.start()]
    return line.strip()


# --------------------------------------------------------------------------
# SURFACES.md


class RosterRow(object):
    def __init__(self, agent_id, cls, status, authority, defaulted, lineno):
        self.id = agent_id
        self.cls = cls
        self.status = status
        self.authority = authority
        self.defaulted = defaulted
        self.lineno = lineno


class Surfaces(object):
    def __init__(self):
        self.roster = []          # RosterRow, file order
        self.blocks = {}          # id -> list of (negated, glob)
        self.block_lines = {}     # id -> line number of the fence
        self.problems = []        # (lineno, message) found while parsing
        self.humans = []          # (lineno, name, email) from the `humans` block
        self.exempt = []          # (lineno, sha, ledger id) from the `exempt` block
        self.humans_line = None   # line of the first `humans` fence
        self.exempt_line = None   # line of the first `exempt` fence

    def roster_ids(self):
        return [r.id for r in self.roster]

    def row(self, agent_id):
        for r in self.roster:
            if r.id == agent_id:
                return r
        return None

    def reviewer_ids(self):
        """Reviewer-class ids: classes reviewer, reader and researcher."""
        return [r.id for r in self.roster if r.cls in REVIEWER_CLASSES]

    def builder_ids(self):
        return [r.id for r in self.roster if r.cls == "builder"]

    def is_reviewer_class(self, agent_id):
        row = self.row(agent_id)
        return row is not None and row.cls in REVIEWER_CLASSES

    def human_emails(self):
        """Lower-cased emails of the humans block."""
        return set(email.lower() for _, _, email in self.humans)

    def exempt_map(self):
        """Lower-cased full sha -> ledger id (first line wins)."""
        out = {}
        for _, sha, lid in self.exempt:
            out.setdefault(sha.lower(), lid)
        return out

    def owners(self, path):
        return sorted(a for a, rules in self.blocks.items()
                      if surface_includes(rules, path))


def parse_surfaces(text):
    s = Surfaces()
    for info, body, open_no in fenced_blocks(text):
        if info == "roster":
            for lineno, line in body:
                content = strip_comment(line)
                if not content:
                    continue
                fields = content.split()
                if len(fields) not in (3, 4):
                    s.problems.append((lineno, "roster line must be 'id class status [authority]', got %r" % content))
                    continue
                defaulted = len(fields) == 3
                authority = "autonomous" if defaulted else fields[3]
                s.roster.append(RosterRow(fields[0], fields[1], fields[2],
                                          authority, defaulted, lineno))
        elif info.startswith("surface:"):
            agent_id = info[len("surface:"):].strip()
            if not agent_id:
                s.problems.append((open_no, "surface block has no agent id"))
                continue
            if agent_id in s.blocks:
                s.problems.append((open_no, "second surface:%s block (first at line %d); each agent gets one block"
                                   % (agent_id, s.block_lines[agent_id])))
                continue
            rules = []
            for lineno, line in body:
                content = strip_comment(line)
                if not content:
                    continue
                negated = content.startswith("!")
                pattern = content[1:].strip() if negated else content
                if not pattern:
                    s.problems.append((lineno, "empty exclusion in surface:%s" % agent_id))
                    continue
                rules.append((negated, pattern))
            s.blocks[agent_id] = rules
            s.block_lines[agent_id] = open_no
        elif info == "humans":
            if s.humans_line is not None:
                s.problems.append((open_no, "second humans block (first at line %d); list every human in one block"
                                   % s.humans_line))
                continue
            s.humans_line = open_no
            _parse_humans(s, body)
        elif info == "exempt":
            if s.exempt_line is not None:
                s.problems.append((open_no, "second exempt block (first at line %d); list every exemption in one block"
                                   % s.exempt_line))
                continue
            s.exempt_line = open_no
            _parse_exempt(s, body)
    return s


HUMAN_RE = re.compile(r"^(.+?)\s*<([^<>\s]+@[^<>\s]+)>$")
SHA_RE = re.compile(r"^[0-9a-fA-F]{40}$")


def _parse_humans(s, body):
    seen = {}
    for lineno, line in body:
        content = strip_comment(line)
        if not content:
            continue
        m = HUMAN_RE.match(content)
        if not m:
            s.problems.append((lineno, "humans line must be 'Name <email>', got %r" % content))
            continue
        name, email = m.group(1).strip(), m.group(2)
        low = email.lower()
        if low.endswith("@" + AGENT_DOMAIN):
            s.problems.append((lineno, "humans email %s ends in @%s — that domain is reserved for agents"
                               % (email, AGENT_DOMAIN)))
            continue
        if low in seen:
            s.problems.append((lineno, "duplicate humans email %s (first at line %d)" % (email, seen[low])))
            continue
        seen[low] = lineno
        s.humans.append((lineno, name, email))


def _parse_exempt(s, body):
    seen = {}
    for lineno, line in body:
        content = strip_comment(line)
        if not content:
            continue
        fields = content.split()
        if len(fields) != 2:
            s.problems.append((lineno, "exempt line must be '<40-hex commit sha> <ledger id>', got %r" % content))
            continue
        sha, lid = fields
        if not SHA_RE.match(sha):
            s.problems.append((lineno, "exempt sha %r is not a full 40-hex commit sha" % sha))
            continue
        low = sha.lower()
        if low in seen:
            s.problems.append((lineno, "duplicate exempt sha %s (first at line %d)" % (sha, seen[low])))
            continue
        seen[low] = lineno
        s.exempt.append((lineno, sha, lid))


def load_surfaces(root):
    path = os.path.join(root, SURFACES_REL)
    if not os.path.isfile(path):
        raise UsageError("%s not found under %s" % (SURFACES_REL, root))
    try:
        return parse_surfaces(read_text(path))
    except UsageError as exc:
        raise UsageError("%s: %s" % (SURFACES_REL, exc))


# --------------------------------------------------------------------------
# LEDGER.md


class Entry(object):
    def __init__(self, entry_id, title, lineno):
        self.id = entry_id
        self.title = title
        self.lineno = lineno
        self.fields = {}

    def get(self, key, default=None):
        return self.fields.get(key, default)


def parse_ledger(text):
    """Return (preamble_text, [Entry])."""
    entries = []
    preamble = []
    current = None
    for idx, raw in enumerate(text.splitlines()):
        line = raw.rstrip("\r")
        m = ENTRY_HEADING_RE.match(line)
        if m:
            title = m.group(2).strip()
            title = re.sub(r"^[—:-]+", "", title).strip()
            current = Entry(m.group(1), title, idx + 1)
            entries.append(current)
            continue
        if current is None:
            preamble.append(line)
            continue
        fm = FIELD_RE.match(line)
        if fm and fm.group(1) not in current.fields:
            current.fields[fm.group(1)] = fm.group(2).strip()
    return "\n".join(preamble), entries


def valid_date(value):
    if value is None or not DATE_RE.match(value):
        return False
    try:
        datetime.date(int(value[0:4]), int(value[5:7]), int(value[8:10]))
    except ValueError:
        return False
    return True


def parse_supersedes(value):
    """Return (list_of_ids, error_or_None)."""
    if value is None:
        return [], None
    v = strip_comment(value)
    if not (v.startswith("[") and v.endswith("]")):
        return [], "supersedes must be a bracketed list such as [L-0087] or []"
    inner = v[1:-1].strip()
    if not inner:
        return [], None
    ids = []
    for item in inner.split(","):
        item = item.strip().strip("'\"")
        if not LEDGER_ID_RE.match(item):
            return [], "supersedes item %r is not a ledger ID" % item
        ids.append(item)
    return ids, None


def id_sort_key(entry_id):
    m = re.match(r"^L-(\d+)([a-z]?)$", entry_id)
    if not m:
        return (float("inf"), entry_id)
    return (int(m.group(1)), m.group(2))


# --------------------------------------------------------------------------
# Commit messages and trailers


_TRAILER_RE = re.compile(r"^([A-Za-z0-9-]+)[ \t]*:(.*)$")
_GIT_PREFIXES = ("Signed-off-by: ", "(cherry picked from commit ")


def _is_blank(line):
    return not line.strip()


def parse_trailers(message, comment_char="#"):
    """Return [(key, value)] from the message's final trailer paragraph.

    Follows `git interpret-trailers --parse` as `git log --format=%(trailers)`
    applies it (no `---` divider): the first paragraph is the title and never
    holds trailers; the last paragraph is a trailer block when every line in
    it is a trailer or a continuation, or when it has a git-generated line
    (Signed-off-by, cherry-picked) and at least a quarter of it is trailers.
    Comment lines are skipped and continuation lines are unfolded. Values are
    stripped; keys keep their spelling (compare them case-insensitively).
    """
    lines = message.replace("\r\n", "\n").split("\n")
    # Like git, ignore trailing comment and blank lines at the end of the message.
    while lines and (_is_blank(lines[-1]) or lines[-1].startswith(comment_char)):
        lines.pop()
    # The title: everything up to the first blank line (comment lines skipped).
    i = 0
    while i < len(lines) and (lines[i].startswith(comment_char) or not _is_blank(lines[i])):
        i += 1
    end_of_title = i
    # Drop trailing blank lines, then find the last paragraph.
    end = len(lines)
    while end > end_of_title and _is_blank(lines[end - 1]):
        end -= 1
    start = end
    while start > end_of_title and not _is_blank(lines[start - 1]):
        start -= 1
    if start <= end_of_title or start >= end:
        return []
    trailer_lines = non_trailer = possible_cont = 0
    recognized = False
    for line in reversed(lines[start:end]):
        if line.startswith(comment_char):
            non_trailer += possible_cont
            possible_cont = 0
            continue
        if line.startswith(_GIT_PREFIXES):
            trailer_lines += 1
            possible_cont = 0
            recognized = True
            continue
        if _TRAILER_RE.match(line):
            trailer_lines += 1
            possible_cont = 0
        elif line[:1].isspace():
            possible_cont += 1
        else:
            non_trailer += 1 + possible_cont
            possible_cont = 0
    non_trailer += possible_cont
    if not ((recognized and trailer_lines * 3 >= non_trailer)
            or (trailer_lines and not non_trailer)):
        return []
    block = [l for l in lines[start:end] if not l.startswith(comment_char)]
    out = []
    current = None
    for line in block:
        m = _TRAILER_RE.match(line)
        if m:
            current = [m.group(1), m.group(2).strip()]
            out.append(current)
        elif line[:1].isspace() and current is not None:
            extra = line.strip()
            if extra:
                current[1] = (current[1] + " " + extra).strip()
        else:
            current = None
    return [(k, v) for k, v in out]


def trailer_values(trailers, key):
    key = key.lower()
    return [v for k, v in trailers if k.lower() == key]


class Commit(object):
    def __init__(self, sha, parents, author_name, author_email, message, paths=None):
        self.sha = sha
        self.parents = list(parents)
        self.author_name = author_name
        self.author_email = author_email
        self.message = message
        self.paths = paths            # list, or None when not yet read
        self._trailers = None

    @property
    def short(self):
        return self.sha[:12]

    def is_merge(self):
        return len(self.parents) >= 2

    def trailers(self):
        if self._trailers is None:
            self._trailers = parse_trailers(self.message)
        return self._trailers

    def trailer(self, key):
        return trailer_values(self.trailers(), key)

    def agent_id(self):
        """The id when the author email is <id>@agents.invalid (case-sensitive), else None."""
        local, at, domain = self.author_email.rpartition("@")
        if at and local and domain == AGENT_DOMAIN:
            return local
        return None


_AUTHOR_RE = re.compile(r"^(.*?) ?<([^<>]*)>(?: .*)?$")


def parse_raw_commit(sha, raw):
    """Parse a raw commit object (as `git cat-file commit` prints it)."""
    text = raw.decode("utf-8", "replace")
    head, sep, message = text.partition("\n\n")
    parents, name, email = [], "", ""
    for line in head.split("\n"):
        if line.startswith("parent "):
            parents.append(line[len("parent "):].strip())
        elif line.startswith("author "):
            m = _AUTHOR_RE.match(line[len("author "):])
            if m:
                name, email = m.group(1), m.group(2)
    return Commit(sha, parents, name, email, message if sep else "")


def read_commits(root, shas):
    """Read commits by sha with one `git cat-file --batch`, in the given order."""
    shas = list(shas)
    if not shas:
        return []
    data = git(root, ["cat-file", "--batch"], input=("\n".join(shas) + "\n").encode())
    out = []
    pos = 0
    for sha in shas:
        nl = data.index(b"\n", pos)
        header = data[pos:nl].decode("utf-8", "replace").split()
        if len(header) != 3 or header[1] != "commit":
            raise GitError("%s is not a commit" % sha)
        size = int(header[2])
        body = data[nl + 1:nl + 1 + size]
        pos = nl + 1 + size + 1
        out.append(parse_raw_commit(header[0], body))
    return out


def rev_list(root, args):
    return [l for l in git(root, ["rev-list"] + list(args)).decode().split("\n") if l]


def commit_paths(root, sha):
    return split_z(git(root, ["diff-tree", "--no-commit-id", "--name-only", "-r",
                              "--no-renames", "-z", "--root", sha]))


# --------------------------------------------------------------------------
# Specs, and ledger fields that refer to specs or extend scope (model S-003)


SPECS_REL = "specs"
SPEC_STATUSES = ("draft", "frozen", "superseded")
SPEC_ID_RE = re.compile(r"^(S-\d{3,})(?=-|\.md$)")
SPEC_REF_RE = re.compile(r"^S-\d{3,}$")


def is_spec_name(name):
    """A spec file is a `specs/*.md` whose name doesn't start with `_`."""
    return name.endswith(".md") and not name.startswith("_")


def spec_id(name):
    """The id of a spec file name (its `S-nnn` prefix), or None."""
    m = SPEC_ID_RE.match(name)
    return m.group(1) if m else None


_SPEC_WORD_RE = re.compile(r"\s*(\S+)")


def spec_status(text, where=None):
    """Return (status, span) for a spec's text.

    The status is the first word after the first column-0 `status:` in the
    header (the lines before the first `## ` heading). `status` is None when
    the header has no such line, and '' when the line has no word; `span` is
    the (start, end) offset of the word in `text`, or None. With `where`, a
    header line whose visible text starts with `status:` behind Cf characters
    is a UsageError.
    """
    if where is not None:
        header = text.split("\n## ", 1)[0] if not text.startswith("## ") else ""
        reject_hidden_key(header, "status", where)
    pos = 0
    for line in text.split("\n"):
        if line.startswith("## "):
            break
        if line.startswith("status:"):
            m = _SPEC_WORD_RE.match(line, len("status:"))
            if not m:
                return "", None
            return m.group(1), (pos + m.start(1), pos + m.end(1))
        pos += len(line) + 1
    return None, None


def spec_files(root):
    """Names of the spec files in the working tree at root, sorted."""
    d = os.path.join(root, SPECS_REL)
    if not os.path.isdir(d):
        return []
    return sorted(n for n in os.listdir(d) if is_spec_name(n) and os.path.isfile(os.path.join(d, n)))


def spec_files_at(root, rev):
    """Names of the spec files at commit `rev`, sorted."""
    out = []
    for item in split_z(git(root, ["ls-tree", "-z", rev, "--", "./%s/" % SPECS_REL])):
        meta, _, path = item.partition("\t")
        fields = meta.split()
        name = path.rsplit("/", 1)[-1]
        if len(fields) == 3 and fields[1] == "blob" and is_spec_name(name):
            out.append(name)
    return sorted(out)


def parse_id_list(value, item_re, what):
    """Parse a bracketed, comma-separated list such as `[S-001, S-002]`.

    Returns (items, error_or_None)."""
    if value is None:
        return [], None
    v = strip_comment(value)
    if not (v.startswith("[") and v.endswith("]")):
        return [], "%s must be a bracketed list such as [S-001] or []" % what
    inner = v[1:-1].strip()
    if not inner:
        return [], None
    items = []
    for item in inner.split(","):
        item = item.strip().strip("'\"")
        if not item_re.match(item):
            return [], "%s item %r is not a spec id (S-nnn)" % (what, item)
        items.append(item)
    return items, None


def split_globs(value):
    """A comma-separated glob list (a sprint's `scope:`, a ledger `extends_scope:`).

    Returns the trimmed items in order; empty items are kept as ''."""
    return [item.strip() for item in value.split(",")]


def glob_list_includes(globs, path):
    """True when `path` is included by a glob list in surface-map syntax.

    Empty items are ignored; a leading `!` excludes; later items win."""
    rules = []
    for gl in globs:
        if not gl:
            continue
        negated = gl.startswith("!")
        pattern = gl[1:].strip() if negated else gl
        if pattern:
            rules.append((negated, pattern))
    return surface_includes(rules, path)


def ledger_entries_at(root, rev):
    """The ledger's entries at commit `rev` ([] when it has no ledger)."""
    text = git_text(root, rev, LEDGER_REL)
    return parse_ledger(text)[1] if text is not None else []


def added_ledger_entries(root, base):
    """Entries in the ledger at HEAD whose ids are not in the ledger at `base`."""
    old = set(e.id for e in ledger_entries_at(root, base))
    return [e for e in ledger_entries_at(root, "HEAD") if e.id not in old]


# --------------------------------------------------------------------------
# AGENTS.md tier


def read_tier(root):
    """Return (tier, note_or_None). Raises UsageError for an invalid tier value."""
    path = os.path.join(root, AGENTS_MD_REL)
    text = read_text(path) if os.path.isfile(path) else ""
    reject_hidden_key(text, "tier", AGENTS_MD_REL)
    for line in text.splitlines():
        m = re.match(r"^tier:(.*)$", line.rstrip("\r"))
        if m:
            value = strip_comment(m.group(1))
            if value not in TIERS:
                raise UsageError("%s: tier %r is not one of: %s" % (AGENTS_MD_REL, value, ", ".join(TIERS)))
            return value, None
    return "T1", "NOTE: no 'tier:' line in %s; assuming T1" % AGENTS_MD_REL


# --------------------------------------------------------------------------
# governance/risk-paths.toml (model S-002)


RISK_TOP_KEYS = ("unmatched", "classes", "reviews", "paths", "tests", "dependencies", "signal_code")
RISK_DOMAIN_KEYS = ("risk", "reviews", "checks")

# model S-003 §Format changes: the optional [tests] and [dependencies] tables.
# A missing table, or a missing key in a present table, takes these defaults.
TESTS_DEFAULTS = (
    ("globs", ["tests/**", "**/*_test.py", "**/test_*.py", "**/*.test.js", "**/*.spec.ts"]),
    ("skip_markers", ["@unittest.skip", ".skipTest(", "pytest.mark.skip", "pytest.mark.xfail",
                      ".only(", "it.skip(", "describe.skip(", "xit(", "xdescribe("]),
    ("assert_patterns", ["assert", "expect(", "self.assert"]),
    ("broad_catches", ["except:", "except Exception", "except BaseException", "catch (e) {}"]),
)
DEPENDENCIES_DEFAULTS = (
    ("manifests", ["requirements*.txt", "pyproject.toml", "package.json", "package-lock.json",
                   "go.mod", "Cargo.toml"]),
)
# model S-004 AC6: the paths whose change trips the owner-signal tripwire. A top-level
# `signal_code = [...]` list replaces them.
SIGNAL_CODE_DEFAULTS = (".github/**", "tools/**", "tests/**", "scripts/**", "governance/checks/**", "src/**")


class RiskPaths(object):
    def __init__(self):
        self.unmatched = "R1"
        self.classes = {}         # Rn -> [glob]
        self.reviews = {}         # Rn -> [reviewer id]
        self.domains = []         # (glob, risk or None, [reviewer id], [check]) in file order
        self.tests = dict((k, list(d)) for k, d in TESTS_DEFAULTS)
        self.dependencies = dict((k, list(d)) for k, d in DEPENDENCIES_DEFAULTS)
        self.signal_code = list(SIGNAL_CODE_DEFAULTS)

    def is_test(self, path):
        return any(glob_match(gl, path) for gl in self.tests["globs"])

    def is_manifest(self, path):
        """A manifest pattern without '/' matches the file name at any depth."""
        name = path.rsplit("/", 1)[-1]
        return any(glob_match(gl, path) or ("/" not in gl and glob_match(gl, name))
                   for gl in self.dependencies["manifests"])

    def path_class(self, path):
        best = None
        for cls in RISK_CLASSES:
            if any(glob_match(gl, path) for gl in self.classes.get(cls, [])):
                best = cls
        for gl, risk, _, _ in self.domains:
            if risk and glob_match(gl, path) and (best is None or risk > best):
                best = risk
        return best if best is not None else self.unmatched

    def change_class(self, paths):
        """Return (class, [paths that set it]); R0 and no paths when nothing changed."""
        by_path = dict((p, self.path_class(p)) for p in set(paths))
        if not by_path:
            return "R0", []
        best = max(by_path.values())
        return best, sorted(p for p, c in by_path.items() if c == best)

    def required(self, paths):
        """Return (class, setters, {reviewer: [reasons]}, [(glob, check)])."""
        cls, setters = self.change_class(paths)
        req = {}
        for rid in self.reviews.get(cls, []):
            req.setdefault(rid, []).append(cls)
        checks = []
        paths = sorted(set(paths))
        for gl, _, revs, chks in self.domains:
            if any(glob_match(gl, p) for p in paths):
                for rid in revs:
                    reasons = req.setdefault(rid, [])
                    reason = "domain %s" % gl
                    if reason not in reasons:
                        reasons.append(reason)
                for c in chks:
                    checks.append((gl, c))
        return cls, setters, req, checks


def _str_list(value):
    return isinstance(value, list) and all(isinstance(x, str) and x.strip() for x in value)


def parse_risk_paths(text, reviewer_ids):
    """Return (RiskPaths or None, [problem]). Problems are lint failures."""
    where = RISK_PATHS_REL
    data, err = load_toml(text, where)
    if err:
        return None, [err]
    problems = []
    rp = RiskPaths()
    allowed_reviewers = set(reviewer_ids) | {OWNER}

    def check_reviewers(ids, ctx):
        for rid in ids:
            if rid not in allowed_reviewers:
                problems.append("%s: %s names reviewer '%s', which is neither 'owner' nor a reviewer-class "
                                "roster id" % (where, ctx, rid))

    def check_globs(globs, ctx):
        for gl in globs:
            if gl.startswith("!"):
                problems.append("%s: %s glob %r starts with '!' — exclusions are not supported here"
                                % (where, ctx, gl))

    for key in sorted(data):
        if key not in RISK_TOP_KEYS:
            problems.append("%s: unknown top-level key '%s' (allowed: %s)" % (where, key, ", ".join(RISK_TOP_KEYS)))
    if "unmatched" in data:
        if data["unmatched"] not in RISK_CLASSES:
            problems.append("%s: unmatched = %r is not one of: %s" % (where, data["unmatched"], ", ".join(RISK_CLASSES)))
        else:
            rp.unmatched = data["unmatched"]
    classes = data.get("classes", {})
    if not isinstance(classes, dict):
        problems.append("%s: 'classes' must be a table" % where)
        classes = {}
    for key in sorted(classes):
        if key not in RISK_CLASSES:
            problems.append("%s: [classes] has unknown key '%s' (allowed: %s)" % (where, key, ", ".join(RISK_CLASSES)))
            continue
        if not _str_list(classes[key]):
            problems.append("%s: [classes] %s must be a list of non-empty strings" % (where, key))
            continue
        check_globs(classes[key], "[classes] %s" % key)
        rp.classes[key] = list(classes[key])
    if "reviews" not in data:
        problems.append("%s: missing required [reviews] table" % where)
        reviews = {}
    else:
        reviews = data["reviews"]
        if not isinstance(reviews, dict):
            problems.append("%s: 'reviews' must be a table" % where)
            reviews = {}
        else:
            for key in RISK_CLASSES:
                if key not in reviews:
                    problems.append("%s: [reviews] is missing key %s" % (where, key))
    for key in sorted(reviews):
        if key not in RISK_CLASSES:
            problems.append("%s: [reviews] has unknown key '%s' (allowed: %s)" % (where, key, ", ".join(RISK_CLASSES)))
            continue
        if not _str_list(reviews[key]):
            problems.append("%s: [reviews] %s must be a list of non-empty strings" % (where, key))
            continue
        check_reviewers(reviews[key], "[reviews] %s" % key)
        rp.reviews[key] = list(reviews[key])
    paths = data.get("paths", {})
    if not isinstance(paths, dict):
        problems.append("%s: 'paths' must be a table of domain tables" % where)
        paths = {}
    for gl in paths:  # file order
        ctx = '[paths."%s"]' % gl
        table = paths[gl]
        if not isinstance(table, dict):
            problems.append("%s: %s must be a table" % (where, ctx))
            continue
        if not gl.strip():
            problems.append("%s: %s has an empty glob" % (where, ctx))
            continue
        check_globs([gl], ctx)
        ok = True
        for key in sorted(table):
            if key not in RISK_DOMAIN_KEYS:
                problems.append("%s: %s has unknown key '%s' (allowed: %s)"
                                % (where, ctx, key, ", ".join(RISK_DOMAIN_KEYS)))
        risk = table.get("risk")
        if risk is not None and risk not in RISK_CLASSES:
            problems.append("%s: %s risk = %r is not one of: %s" % (where, ctx, risk, ", ".join(RISK_CLASSES)))
            ok = False
        revs = table.get("reviews", [])
        if not _str_list(revs):
            problems.append("%s: %s reviews must be a list of non-empty strings" % (where, ctx))
            ok = False
        else:
            check_reviewers(revs, "%s reviews" % ctx)
        chks = table.get("checks", [])
        if not _str_list(chks):
            problems.append("%s: %s checks must be a list of non-empty strings" % (where, ctx))
            ok = False
        if ok:
            rp.domains.append((gl, risk, list(revs), list(chks)))
    for table, defaults, glob_keys in (("tests", TESTS_DEFAULTS, ("globs",)),
                                       ("dependencies", DEPENDENCIES_DEFAULTS, ("manifests",))):
        if table not in data:
            continue
        value = data[table]
        if not isinstance(value, dict):
            problems.append("%s: '%s' must be a table" % (where, table))
            continue
        allowed = [k for k, _ in defaults]
        for key in sorted(value):
            if key not in allowed:
                problems.append("%s: [%s] has unknown key '%s' (allowed: %s)"
                                % (where, table, key, ", ".join(allowed)))
                continue
            if not _str_list(value[key]):
                problems.append("%s: [%s] %s must be a list of non-empty strings" % (where, table, key))
                continue
            if key in glob_keys:
                check_globs(value[key], "[%s] %s" % (table, key))
            getattr(rp, table)[key] = list(value[key])
    if "signal_code" in data:
        value, problem = check_signal_code(data["signal_code"])
        if problem:
            problems.append(problem)
        else:
            rp.signal_code = value
    return rp, problems


def check_signal_code(value):
    """Return ([glob], None) for a valid `signal_code` value, or (None, problem)."""
    where = RISK_PATHS_REL
    if not _str_list(value):
        return None, "%s: signal_code must be a list of non-empty strings" % where
    for gl in value:
        if gl.startswith("!"):
            return None, ("%s: signal_code glob %r starts with '!' — exclusions are not supported here"
                          % (where, gl))
    return list(value), None


def load_risk_paths(root, reviewer_ids):
    """Return (RiskPaths or None, [problem]); a missing file is a problem."""
    path = os.path.join(root, RISK_PATHS_REL)
    if not os.path.isfile(path):
        return None, ["%s: missing — required reviews are not configured" % RISK_PATHS_REL]
    # tomllib gets the untranslated text, so tomllib alone decides what a newline is.
    return parse_risk_paths(read_text(path, newline=""), reviewer_ids)


# --------------------------------------------------------------------------
# governance/enforcement.toml: warn-only mode per check (model S-003 §5)


ENFORCEMENT_REL = "governance/enforcement.toml"
ENFORCEMENT_MODES = ("warn", "enforce")

# Every check model S-001 to model S-005, model S-009 and model S-013 define, by its fixed name; `check_all.sh --list-checks` prints them.
CHECK_NAMES = (
    "surface_guard.map",               # check: the map's structure, humans and exempt blocks
    "surface_guard.ownership",         # check: every tracked file has exactly one owner
    "surface_guard.diff",              # diff AGENT: changes inside the agent's surface
    "surface_guard.range.authorship",  # diff --range: agent identity, humans, reviewers never commit
    "surface_guard.range.trailers",    # diff --range: Agent-Session and Spec trailers
    "surface_guard.range.paths",       # diff --range: each commit inside its author's surface
    "surface_guard.range.branch",      # diff --range: the build/<id>/<task> branch rule
    "surface_guard.range.independence",  # diff --range: test-author independence
    "surface_guard.range.spec",        # diff --range: no builder commit names a superseded spec
    "surface_guard.charters",          # charters --check: generated Surface sections
    "ledger_check.entries",            # the ledger's entries are well-formed
    "ledger_check.append_only",        # the ledger is appended to, never edited
    "digest.check",                    # the digest and packs are generated and within budget
    "governance_checks.sprints",
    "governance_checks.questions",
    "governance_checks.reviewers",
    "governance_checks.builders",
    "governance_checks.scope",
    "review_check.config",             # risk-paths.toml is valid (it defines the required reviews)
    "review_check.lint",               # verdict files are well-formed and from known reviewers
    "review_check.verdicts",           # every required non-owner verdict is present and PASS
    "review_check.owner",              # the owner's required verdict (R3, domains, flags)
    "review_check.pinning",            # added dependencies are pinned
    "spec_check.status",
    "spec_check.frozen",
    "spec_check.predates",
    "spec_check.facts",                # a spec being frozen lists its facts and known limits with evidence
    "enforcement.lint",                # governance/enforcement.toml itself is valid
    # model S-009: the v3 checks; they run only when governance/v3.toml exists.
    "v3_checks.scope",                 # scope --base: each commit's paths inside its spec's Areas touched
    "v3_checks.ready",                 # ready: docs/PROJECT.md Part 1 complete once a spec is frozen
    "v3_checks.trace",                 # trace: every criterion of a frozen spec traces to a value target
    "v3_checks.freeze",                # freeze --base: a PASS plan review at or before the freezing commit
    "v3_checks.joins",                 # joins: every join of a frozen spec has a marked test
    "v3_checks.holdouts",              # holdouts --base: HOLDOUTS.md changes carry a ledger entry
    # model S-013: the Orchestrator's records, on the default branch (v3 only) and inside the merge gate.
    "record-decisions",                # decisions --base: owner answers by a person, or a proxy with its words
    "record-merges",                   # merges --base: each merge re-derived from its own tree
    "record-routing",                  # routing: the dispatch log's chain and routes
    "record-build-cap",                # build-cap: the build count against ROUTING.toml's build_cap (reports)
    "record-grants",                   # grants: reports only, until the grant format is defined
    "gate-packs",                      # the merge gate: every recorded pack within the role's reads
    "gate-handback",                   # the merge gate: a passing check run before any review
    "gate-freeze",                     # the merge gate: no build dispatch before its spec froze
)

# Never warn-only, whatever the file says (§5), plus the two gates without which the
# owner requirement or the enforcement file could be switched off: risk-paths.toml's
# validity and enforcement.toml's own lint. Parse and usage errors (exit 2) are never
# findings, so they can't be warned either.
NEVER_WARN = ("surface_guard.map", "ledger_check.append_only", "review_check.owner",
              "review_check.config", "enforcement.lint",
              # model S-013 AC1: none of the record checks is warn-only (two only report), nor the gate's.
              "record-decisions", "record-merges", "record-routing", "record-build-cap", "record-grants",
              "gate-packs", "gate-handback", "gate-freeze")

# Checks that are warn-only below a tier unless enforcement.toml names them (model S-005 AC5):
# check name -> (the first tier at which it is enforced, the ledger entry its warn-only mode cites).
# The ledger entry is the model's, so it is cited with the "model" prefix.
TIER_WARN_DEFAULTS = {
    "spec_check.facts": ("T2", "model L-0052"),
}
# Tier defaults that do not apply in a v3 project (model S-009 AC6): there the facts check is
# enforced at every tier unless enforcement.toml sets it to warn-only.
V3_NO_TIER_DEFAULT = ("spec_check.facts",)


class Enforcement(object):
    def __init__(self):
        self.warn = {}        # check name -> ledger id
        self.explicit = set()  # check names the file sets (warn or enforce)
        self.problems = []    # lint problems; when any, nothing is warned

    def ledger_for(self, name):
        return self.warn.get(name)


def parse_enforcement(text, ledger_ids):
    """Return an Enforcement. Lint problems are listed in .problems (and then nothing warns)."""
    where = ENFORCEMENT_REL
    enf = Enforcement()
    data, err = load_toml(text, where)
    if err:
        enf.problems.append(err)
        return enf
    p = enf.problems
    for key in sorted(data):
        if key != "checks":
            p.append("%s: unknown top-level key '%s' (allowed: checks)" % (where, key))
    checks = data.get("checks", {})
    if not isinstance(checks, dict):
        p.append("%s: 'checks' must be a table" % where)
        checks = {}
    warn, explicit = {}, set()
    for name in sorted(checks):
        ctx = '%s: [checks] "%s"' % (where, name)
        value = checks[name]
        if name not in CHECK_NAMES:
            p.append("%s is not a check name (list them with check_all.sh --list-checks)" % ctx)
            continue
        if name in NEVER_WARN:
            p.append("%s can never be warn-only; remove it" % ctx)
            continue
        if not isinstance(value, dict):
            p.append("%s must be a table such as { mode = \"warn\", ledger = \"L-0042\" }" % ctx)
            continue
        for key in sorted(value):
            if key not in ("mode", "ledger"):
                p.append("%s has unknown key '%s' (allowed: mode, ledger)" % (ctx, key))
        mode, lid = value.get("mode"), value.get("ledger")
        if mode not in ENFORCEMENT_MODES:
            p.append("%s: mode %r is not one of: %s" % (ctx, mode, ", ".join(ENFORCEMENT_MODES)))
        if not isinstance(lid, str) or not LEDGER_ID_RE.match(lid):
            p.append("%s: ledger %r must be a ledger id such as L-0042" % (ctx, lid))
        elif lid not in ledger_ids:
            p.append("%s: ledger %s is not an entry in %s" % (ctx, lid, LEDGER_REL))
        elif mode in ENFORCEMENT_MODES:
            explicit.add(name)
            if mode == "warn":
                warn[name] = lid
    if not p:
        enf.warn = warn
        enf.explicit = explicit
    return enf


def apply_tier_defaults(enf, tier, v3=False):
    """Warn a TIER_WARN_DEFAULTS check below its tier, unless the file names it or has problems.

    With `v3` (the project has governance/v3.toml), the V3_NO_TIER_DEFAULT checks keep no
    tier default (model S-009 AC6); an explicit mode in the file still applies."""
    if enf.problems:
        return enf
    for name, (from_tier, lid) in sorted(TIER_WARN_DEFAULTS.items()):
        if v3 and name in V3_NO_TIER_DEFAULT:
            continue
        if name not in enf.explicit and TIERS.index(tier) < TIERS.index(from_tier):
            enf.warn[name] = lid
    return enf


def load_enforcement(root):
    """Read governance/enforcement.toml: the one place every tool learns each check's mode.

    A missing file enforces everything. Read errors (encoding, the line rule,
    nesting) are UsageErrors (exit 2). Lint problems are kept in .problems;
    `review_check lint` reports them, and while any exists every check is
    enforced."""
    path = os.path.join(root, ENFORCEMENT_REL)
    if not os.path.isfile(path):
        return Enforcement()
    text = read_text(path, newline="")
    ledger = os.path.join(root, LEDGER_REL)
    ids = set(e.id for e in parse_ledger(read_text(ledger))[1]) if os.path.isfile(ledger) else set()
    return parse_enforcement(text, ids)


def report(root, findings, notes, ok_msg, enforcement=None, out=None, errors=False):
    """Print a tool's result under enforcement.toml and return its exit code.

    `findings` is a list of (check name, message). Findings of a warn-only
    check print as `WARN: <message>` and don't fail; a `WARN-ONLY:` line then
    summarises them for check_all.sh. Anything else prints as before and fails.
    With `errors` (usage errors already printed), no OK line is printed and the
    result is 2 unless a finding failed.
    """
    out = out or sys.stdout
    enf = enforcement if enforcement is not None else load_enforcement(root)
    for name, _ in findings:
        if name not in CHECK_NAMES:  # pragma: no cover - a programming error
            raise ValueError("unknown check name %r" % name)
    if enf.problems:
        notes = list(notes) + ["NOTE: %s has problems (see review_check lint); every check is enforced"
                               % ENFORCEMENT_REL]
    warned = [(n, m) for n, m in findings if enf.ledger_for(n)]
    failed = [m for n, m in findings if not enf.ledger_for(n)]
    for n in notes:
        print(n, file=out)
    for m in failed:
        print(m, file=out)
    for _, m in warned:
        print("WARN: %s" % m, file=out)
    if failed:
        print("FAIL: %d violation(s)" % len(failed), file=out)
        return 1
    if warned:
        ids = sorted(set(enf.ledger_for(n) for n, _ in warned), key=id_sort_key)
        print("WARN-ONLY: %d finding(s), warn-only per %s" % (len(warned), ", ".join(ids)), file=out)
    if errors:
        return 2
    print("OK: %s" % ok_msg, file=out)
    return 0


def list_checks():
    for name in CHECK_NAMES:
        print(name + ("  (never warn-only)" if name in NEVER_WARN else ""))


if __name__ == "__main__":
    if sys.argv[1:] == ["list-checks"]:
        list_checks()
        sys.exit(0)
    print("usage: govlib.py list-checks", file=sys.stderr)
    sys.exit(2)
