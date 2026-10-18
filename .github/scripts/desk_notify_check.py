#!/usr/bin/env python3
"""desk_notify_check — the notification workflows' check (spec S-001, Workflow 3, "Its own check").

Reads .github/workflows/desk-notify.yml and desk-notify-ready.yml and fails, with a named reason for
each fault, when:
  - desk-notify has a trigger other than Workflow 3's (`pull_request_target` and `pull_request`
    named apart), or a trigger set wider than Workflow 3's;
  - its permissions differ from Workflow 3's six;
  - its job has no `notify` Environment, or its gate lacks the switch or the origin gate, or admits
    a triggering event beyond Workflow 3's (the gate is evaluated, not matched as text);
  - a workflow-level `concurrency` appears, or the job's is missing;
  - a checkout has `persist-credentials` other than false or a `ref` other than the default branch;
  - an action is not pinned by a 40-character sha;
  - any `run:` line or block holds `${{`;
  - desk-notify-ready has a trigger other than its own, a secret, an Environment, a checkout, or
    permissions other than `{}`.
Beyond Workflow 3's list, as the same rules' safer readings: desk-notify has one job, `notify`; its
secrets appear only in the env of the step that runs the sender; it uses only checkout, setup-node
and upload-artifact (so no artifact is downloaded); and no checkout names another repository.

  desk_notify_check.py [NOTIFY_YML READY_YML]

The paths default to this repository's .github/workflows/. desk-build runs it on every pull request,
beside its test (test_desk_notify_check.py). Python 3 standard library only: the runner has no
PyYAML, so it reads a YAML subset itself, and anything outside that subset (anchors, aliases, tags,
multi-line plain or quoted scalars, several documents) fails as unreadable rather than being
guessed at. It reads files only and runs nothing from them.
"""
import itertools
import math
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKFLOWS = HERE.parent / "workflows"

# Workflow 3's values.
RUN_WORKFLOWS = {"governance", "orchestrator", "asks-merge", "pr-body", "desk-build", "desk-deploy",
                 "desk-notify-ready"}
RUN_TYPES = {"completed", "requested"}
CRON = "2-59/5 * * * *"
PERMISSIONS = {"contents": "read", "pull-requests": "read", "actions": "read", "checks": "read",
               "statuses": "read", "issues": "write"}
READY_TYPES = {"ready_for_review", "converted_to_draft", "closed"}
ALLOWED_ACTIONS = {"actions/checkout", "actions/setup-node", "actions/upload-artifact"}
DEFAULT_BRANCH_REF = "${{ github.event.repository.default_branch }}"
SENDER = "src/notify/run.mjs"
PINNED = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:/[^@\s]+)?@[0-9a-f]{40}$")
SECRETS_WORD = re.compile(r"\bsecrets\b", re.IGNORECASE)


# ---------------------------------------------------------------------------------------------
# A YAML subset reader. Block mappings and sequences, flow collections on one line, plain, single-
# and double-quoted scalars on one line, and literal and folded block scalars. Everything else is a
# YamlError, so the check fails closed instead of reading a file differently from GitHub.

class YamlError(Exception):
    pass


_BOOL = {"true": True, "True": True, "TRUE": True, "false": False, "False": False, "FALSE": False}
_NULL = {"", "~", "null", "Null", "NULL"}
_INT = re.compile(r"^[-+]?[0-9]+$")


def _plain(text, lineno):
    if text[:1] in ("&", "*", "!", "%", "@", "`", "|", ">", "?") or text.startswith("- "):
        raise YamlError(f"line {lineno}: unsupported YAML ({text[:1]!r})")
    if text in _BOOL:
        return _BOOL[text]
    if text in _NULL:
        return None
    if _INT.match(text):
        return int(text)
    return text


def _quoted(text, pos, lineno):
    """A quoted scalar starting at text[pos]; returns (value, next position)."""
    q = text[pos]
    out = []
    i = pos + 1
    while i < len(text):
        c = text[i]
        if q == "'":
            if c == "'":
                if text[i + 1:i + 2] == "'":
                    out.append("'")
                    i += 2
                    continue
                return "".join(out), i + 1
            out.append(c)
        else:
            if c == "\\":
                nxt = text[i + 1:i + 2]
                esc = {'"': '"', "\\": "\\", "n": "\n", "t": "\t", "/": "/", "0": "\0", " ": " "}
                if nxt not in esc:
                    raise YamlError(f"line {lineno}: unsupported escape in a double-quoted scalar")
                out.append(esc[nxt])
                i += 2
                continue
            if c == '"':
                return "".join(out), i + 1
            out.append(c)
        i += 1
    raise YamlError(f"line {lineno}: a quoted scalar does not end on its line")


def _rest_is_blank(text, pos, lineno):
    rest = text[pos:]
    if rest.strip() and not rest.lstrip().startswith("#"):
        raise YamlError(f"line {lineno}: unexpected text after a value")
    if rest.strip() and not rest[:1].isspace():
        raise YamlError(f"line {lineno}: a comment must follow a space")


def _strip_comment(text):
    """A plain scalar's text up to an unquoted ' #'."""
    m = re.search(r"(^|\s)#", text)
    return text[:m.start()].rstrip() if m else text.rstrip()


def _flow(text, pos, lineno):
    """A flow collection starting at text[pos] ('[' or '{'); returns (value, next position)."""
    opener = text[pos]
    closer = "]" if opener == "[" else "}"
    out = [] if opener == "[" else {}
    i = pos + 1

    def skip(j):
        while j < len(text) and text[j] == " ":
            j += 1
        return j

    def item(j, stops):
        j = skip(j)
        if j >= len(text):
            raise YamlError(f"line {lineno}: a flow collection does not end on its line")
        c = text[j]
        if c in "[{":
            return _flow(text, j, lineno)
        if c in "'\"":
            return _quoted(text, j, lineno)
        k = j
        while k < len(text) and text[k] not in stops:
            k += 1
        raw = text[j:k].strip()
        if "#" in raw:
            raise YamlError(f"line {lineno}: a comment inside a flow collection")
        return _plain(raw, lineno), k

    i = skip(i)
    if text[i:i + 1] == closer:
        return out, i + 1
    while True:
        if opener == "[":
            val, i = item(i, ",]")
            out.append(val)
        else:
            key, i = item(i, ":,}")
            i = skip(i)
            if text[i:i + 1] != ":":
                raise YamlError(f"line {lineno}: a flow mapping entry without ':'")
            val, i = item(i + 1, ",}")
            if not isinstance(key, str):
                raise YamlError(f"line {lineno}: a flow mapping key that is not a string")
            if key in out:
                raise YamlError(f"line {lineno}: the key {key!r} appears twice")
            out[key] = val
        i = skip(i)
        c = text[i:i + 1]
        if c == ",":
            i += 1
            continue
        if c == closer:
            return out, i + 1
        raise YamlError(f"line {lineno}: a flow collection does not end on its line")


class _Reader:
    def __init__(self, text):
        if re.search(r"^[ ]*\t", text, re.MULTILINE):
            raise YamlError("a tab in indentation")
        self.lines = text.split("\n")
        self.i = 0

    @staticmethod
    def _indent(line):
        return len(line) - len(line.lstrip(" "))

    def _content(self):
        """The index of the next line that is not blank or a comment, or None."""
        j = self.i
        while j < len(self.lines):
            s = self.lines[j].strip()
            if s and not s.startswith("#"):
                return j
            j += 1
        return None

    def document(self):
        j = self._content()
        if j is not None and self.lines[j].strip() == "---":
            self.i = j + 1
        j = self._content()
        if j is None:
            return None
        if self._indent(self.lines[j]) != 0:
            raise YamlError(f"line {j + 1}: the document does not start at column 0")
        value = self._node(0)
        j = self._content()
        if j is not None:
            raise YamlError(f"line {j + 1}: unexpected text (another document, or bad indentation)")
        return value

    def _node(self, indent):
        j = self._content()
        line = self.lines[j]
        s = line.strip()
        if s == "-" or s.startswith("- "):
            return self._seq(indent)
        return self._map(indent)

    @staticmethod
    def _split_key(text, lineno):
        """(key, rest) when text is `key: rest` or `key:`, else None."""
        if not text or text[0] in "[{":
            return None
        if text[0] in "'\"":
            key, k = _quoted(text, 0, lineno)
            while k < len(text) and text[k] == " ":
                k += 1
            if text[k:k + 1] == ":" and (k + 1 == len(text) or text[k + 1] == " "):
                return key, text[k + 1:].strip()
            return None
        m = re.search(r":(?=\s|$)", text)
        if not m:
            return None
        hash_at = re.search(r"\s#", text)
        if hash_at and hash_at.start() < m.start():
            return None
        key = text[:m.start()].rstrip()
        if not key or key[0] in "&*!%@`|>?-" and not re.match(r"^-[A-Za-z0-9]", key):
            raise YamlError(f"line {lineno}: unsupported mapping key {key!r}")
        if key == "<<":
            raise YamlError(f"line {lineno}: merge keys are not supported")
        return key, text[m.end():].strip()

    def _value(self, rest, indent, lineno):
        """The value after `key:` or `- `, where the key or dash sits at column `indent`."""
        if rest == "" or rest.startswith("#"):
            j = self._content()
            if j is None:
                return None
            nxt = self.lines[j]
            n = self._indent(nxt)
            s = nxt.strip()
            if n > indent:
                return self._node(n)
            if n == indent and (s == "-" or s.startswith("- ")) and self._in_map:
                return self._seq(n)
            return None
        if rest[0] in "|>":
            return self._block(rest, indent, lineno)
        if rest[0] in "[{":
            val, k = _flow(rest, 0, lineno)
            _rest_is_blank(rest, k, lineno)
            self._no_continuation(indent, lineno)
            return val
        if rest[0] in "'\"":
            val, k = _quoted(rest, 0, lineno)
            _rest_is_blank(rest, k, lineno)
            self._no_continuation(indent, lineno)
            return val
        val = _plain(_strip_comment(rest), lineno)
        self._no_continuation(indent, lineno)
        return val

    def _no_continuation(self, indent, lineno):
        j = self._content()
        if j is not None and self._indent(self.lines[j]) > indent:
            raise YamlError(f"line {j + 1}: a multi-line scalar or bad indentation after line {lineno}")

    def _block(self, header, indent, lineno):
        m = re.match(r"^([|>])([-+]?)(\s+#.*)?\s*$", header)
        if not m:
            raise YamlError(f"line {lineno}: unsupported block scalar header {header!r}")
        style, chomp = m.group(1), m.group(2)
        body = []
        content_indent = None
        j = self.i
        while j < len(self.lines):
            line = self.lines[j]
            if not line.strip():
                body.append("")
                j += 1
                continue
            n = self._indent(line)
            if content_indent is None:
                if n <= indent:
                    break
                content_indent = n
            if n < content_indent:
                if n > indent:
                    raise YamlError(f"line {j + 1}: a block scalar line indented less than its first")
                break
            body.append(line[content_indent:])
            j += 1
        self.i = j
        while body and body[-1] == "" and chomp != "+":
            body.pop()
        if style == "|":
            text = "\n".join(body)
        else:
            parts = []
            for k, line in enumerate(body):
                if k == 0:
                    parts.append(line)
                elif line == "" or body[k - 1] == "" or line.startswith(" ") or body[k - 1].startswith(" "):
                    parts.append("\n" + line)
                else:
                    parts.append(" " + line)
            text = "".join(parts)
        if chomp != "-" and body:
            text += "\n"
        return text

    _in_map = False

    def _map(self, indent):
        out = {}
        while True:
            j = self._content()
            if j is None:
                return out
            line = self.lines[j]
            n = self._indent(line)
            if n < indent:
                return out
            if n > indent:
                raise YamlError(f"line {j + 1}: bad indentation")
            s = line.strip()
            if s == "-" or s.startswith("- "):
                return out
            kv = self._split_key(s, j + 1)
            if kv is None:
                raise YamlError(f"line {j + 1}: expected `key: value`")
            key, rest = kv
            if key in out:
                raise YamlError(f"line {j + 1}: the key {key!r} appears twice")
            self.i = j + 1
            saved = self._in_map
            self._in_map = True
            out[key] = self._value(rest, indent, j + 1)
            self._in_map = saved

    def _seq(self, indent):
        out = []
        while True:
            j = self._content()
            if j is None:
                return out
            line = self.lines[j]
            n = self._indent(line)
            if n < indent:
                return out
            if n > indent:
                raise YamlError(f"line {j + 1}: bad indentation")
            s = line.strip()
            if not (s == "-" or s.startswith("- ")):
                return out
            item = s[1:]
            col = indent + 1 + (len(item) - len(item.lstrip(" ")))
            item = item.strip()
            saved = self._in_map
            self._in_map = False
            if item and (self._split_key(item, j + 1) is not None or item == "-" or item.startswith("- ")):
                # `- key: value ...`: the item is a node starting at the item's own column.
                self.lines[j] = " " * col + item
                self.i = j
                out.append(self._node(col))
            else:
                self.i = j + 1
                out.append(self._value(item, indent, j + 1))
            self._in_map = saved


def read_yaml(text):
    return _Reader(text).document()


# ---------------------------------------------------------------------------------------------
# GitHub expressions, the subset a gate needs: ( ) ! == != && || , string literals, numbers,
# true/false/null and known context paths. Anything else (a function, an index, a comparison by
# order, an unknown context path) is an ExprError, so an unreadable gate fails.

class ExprError(Exception):
    pass


GATE_PATHS = {
    "vars.desk_notify_on", "github.event_name", "github.repository", "github.ref", "github.event.action",
    "github.event.repository.full_name", "github.event.repository.name",
    "github.event.workflow_run.name", "github.event.workflow_run.event", "github.event.workflow_run.path",
    "github.event.workflow_run.head_branch", "github.event.workflow_run.conclusion",
    "github.event.workflow_run.head_repository.full_name", "github.event.workflow_run.head_repository.name",
    "github.event.workflow_run.head_repository.owner.login",
    "github.event.workflow_run.repository.full_name",
}

_TOKEN = re.compile(r"""\s*(?:
    (?P<op>&&|\|\||==|!=|<=|>=|[()!<>\[\],])
  | '(?P<str>(?:[^']|'')*)'
  | (?P<num>-?[0-9]+(?:\.[0-9]+)?)
  | (?P<name>[A-Za-z_][A-Za-z0-9_-]*(?:\.[A-Za-z_*][A-Za-z0-9_-]*)*)
)""", re.VERBOSE)


def _tokens(expr):
    out = []
    pos = 0
    expr = expr.rstrip()
    while pos < len(expr):
        m = _TOKEN.match(expr, pos)
        if not m or m.end() == pos:
            raise ExprError(f"unreadable at {expr[pos:pos + 20]!r}")
        pos = m.end()
        if m.group("op"):
            out.append(("op", m.group("op")))
        elif m.group("str") is not None:
            out.append(("lit", m.group("str").replace("''", "'")))
        elif m.group("num"):
            out.append(("lit", float(m.group("num"))))
        else:
            name = m.group("name")
            low = name.lower()
            if low in ("true", "false"):
                out.append(("lit", low == "true"))
            elif low == "null":
                out.append(("lit", None))
            else:
                out.append(("path", low))
    return out


def parse_expr(expr):
    """An `if:` value → a tree. A whole `${{ … }}` wrapper is removed; any other `${{` is refused
    (GitHub would read the value as a string, always true)."""
    s = expr.strip()
    m = re.match(r"^\$\{\{(.*)\}\}$", s, re.DOTALL)
    if m and "${{" not in m.group(1) and "}}" not in m.group(1):
        s = m.group(1)
    if "${{" in s or "}}" in s:
        raise ExprError("`${{` inside the expression")
    toks = _tokens(s)
    pos = 0

    def peek():
        return toks[pos] if pos < len(toks) else (None, None)

    def take():
        nonlocal pos
        pos += 1
        return toks[pos - 1]

    def p_or():
        node = p_and()
        while peek() == ("op", "||"):
            take()
            node = ("||", node, p_and())
        return node

    def p_and():
        node = p_cmp()
        while peek() == ("op", "&&"):
            take()
            node = ("&&", node, p_cmp())
        return node

    def p_cmp():
        node = p_not()
        while peek() in (("op", "=="), ("op", "!=")):
            op = take()[1]
            node = (op, node, p_not())
        if peek()[0] == "op" and peek()[1] in ("<", ">", "<=", ">="):
            raise ExprError("a comparison by order")
        return node

    def p_not():
        if peek() == ("op", "!"):
            take()
            return ("!", p_not())
        return p_primary()

    def p_primary():
        kind, val = take() if pos < len(toks) else (None, None)
        if kind == "op" and val == "(":
            node = p_or()
            if peek() != ("op", ")"):
                raise ExprError("a '(' without its ')'")
            take()
            return node
        if kind == "lit":
            return ("lit", val)
        if kind == "path":
            if peek() == ("op", "("):
                raise ExprError(f"a function call ({val})")
            if peek() == ("op", "["):
                raise ExprError("an index")
            if val not in GATE_PATHS:
                raise ExprError(f"a context the check does not model ({val})")
            return ("path", val)
        raise ExprError("an incomplete expression")

    tree = p_or()
    if pos != len(toks):
        raise ExprError(f"unexpected {toks[pos][1]!r}")
    return tree


def _num(v):
    if v is None:
        return 0.0
    if isinstance(v, bool):
        return 1.0 if v else 0.0
    if isinstance(v, (int, float)):
        return float(v)
    t = v.strip()
    if t == "":
        return 0.0
    try:
        return float(t)
    except ValueError:
        return math.nan


def _eq(a, b):
    """GitHub's `==`: strings ignore case; other kinds are compared as numbers."""
    if isinstance(a, str) and isinstance(b, str):
        return a.casefold() == b.casefold()
    if a is None and b is None:
        return True
    if type(a) is type(b) and not isinstance(a, str):
        return a == b
    return _num(a) == _num(b)


def _truthy(v):
    if v is None or v is False:
        return False
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return not (v == 0 or math.isnan(v))
    if isinstance(v, str):
        return v != ""
    return True


def evaluate(tree, ctx):
    kind = tree[0]
    if kind == "lit":
        return tree[1]
    if kind == "path":
        return ctx.get(tree[1])
    if kind == "!":
        return not _truthy(evaluate(tree[1], ctx))
    if kind == "&&":
        left = evaluate(tree[1], ctx)
        return evaluate(tree[2], ctx) if _truthy(left) else left
    if kind == "||":
        left = evaluate(tree[1], ctx)
        return left if _truthy(left) else evaluate(tree[2], ctx)
    if kind == "==":
        return _eq(evaluate(tree[1], ctx), evaluate(tree[2], ctx))
    if kind == "!=":
        return not _eq(evaluate(tree[1], ctx), evaluate(tree[2], ctx))
    raise ExprError(kind)


REPO = "owner/Service-Desk"
ASKS_MERGE_PATH = ".github/workflows/asks-merge.yml"
ORIGIN_EVENTS = ("push", "pull_request", "workflow_dispatch", "schedule")


def reference_gate(ctx):
    """Workflow 3's gate, word for word: what the file's gate may admit, at most."""
    if not _eq(ctx.get("vars.desk_notify_on"), "true"):
        return False
    if not _eq(ctx.get("github.event_name"), "workflow_run"):
        return True
    wr_event = ctx.get("github.event.workflow_run.event")
    return (_eq(ctx.get("github.event.workflow_run.head_repository.full_name"), ctx.get("github.repository"))
            and (_eq(ctx.get("github.event.action"), "completed")
                 or _eq(ctx.get("github.event.workflow_run.name"), "desk-deploy"))
            and (any(_eq(wr_event, e) for e in ORIGIN_EVENTS)
                 or (_eq(wr_event, "workflow_run")
                     and _eq(ctx.get("github.event.workflow_run.path"), ASKS_MERGE_PATH))))


def gate_contexts():
    """Every case the gate is tried on: the switch on and off, this repository's runs and a fork's
    (a fork named like this one, on a branch named main), each action, workflow name, triggering
    event and path, and the four non-workflow_run events."""
    switches = ("true", "", "false")
    base = {"github.repository": REPO, "github.ref": "refs/heads/main",
            "github.event.repository.full_name": REPO, "github.event.repository.name": "Service-Desk"}
    for switch, event in itertools.product(switches, ("push", "schedule", "workflow_dispatch")):
        yield dict(base, **{"vars.desk_notify_on": switch, "github.event_name": event})
    origins = (
        ("same", REPO, "Service-Desk", "owner"),
        ("fork", "someone/Service-Desk", "Service-Desk", "someone"),
        ("none", None, None, None),
    )
    names = sorted(RUN_WORKFLOWS) + ["other"]
    events = ORIGIN_EVENTS + ("workflow_run", "pull_request_target", "issue_comment", None)
    paths = (ASKS_MERGE_PATH, ".github/workflows/governance.yml", ".github/workflows/other.yml", None)
    for switch, origin, action, name, wr_event, path, branch in itertools.product(
            switches, origins, ("completed", "requested"), names, events, paths, ("main", "feature")):
        ctx = dict(base)
        ctx.update({
            "vars.desk_notify_on": switch, "github.event_name": "workflow_run", "github.event.action": action,
            "github.event.workflow_run.name": name, "github.event.workflow_run.event": wr_event,
            "github.event.workflow_run.path": path, "github.event.workflow_run.head_branch": branch,
            "github.event.workflow_run.conclusion": "success",
            "github.event.workflow_run.head_repository.full_name": origin[1],
            "github.event.workflow_run.head_repository.name": origin[2],
            "github.event.workflow_run.head_repository.owner.login": origin[3],
            "github.event.workflow_run.repository.full_name": REPO,
            "_origin": origin[0],
        })
        yield ctx


def check_gate(expr, name="desk-notify.yml"):
    """The gate's reasons: (code, message) pairs."""
    if expr is None:
        expr = "true"
    if not isinstance(expr, (str, bool)):
        return [("notify-gate-unreadable", f"{name}: the notify job's `if:` is not an expression")]
    try:
        tree = parse_expr(str(expr).lower() if isinstance(expr, bool) else expr)
    except ExprError as exc:
        return [("notify-gate-unreadable", f"{name}: the notify job's `if:` cannot be read: {exc}")]
    switch = origin = beyond = False
    for ctx in gate_contexts():
        if not _truthy(evaluate(tree, ctx)):
            continue
        if not _eq(ctx["vars.desk_notify_on"], "true"):
            switch = True
        elif ctx.get("_origin") in ("fork", "none"):
            origin = True
        elif not reference_gate(ctx):
            beyond = True
    out = []
    if switch:
        out.append(("notify-switch", f"{name}: the notify job runs without the switch (vars.DESK_NOTIFY_ON == 'true')"))
    if origin:
        out.append(("notify-origin-gate", f"{name}: the notify job admits a workflow_run run from another repository "
                                          "(the origin gate is missing)"))
    if beyond:
        out.append(("notify-gate-admits-more", f"{name}: the notify job's gate admits a triggering event beyond "
                                               "Workflow 3's"))
    return out


# ---------------------------------------------------------------------------------------------
# The rules.

def _norm(s):
    return " ".join(str(s).split())


def _triggers(doc):
    on = doc.get("on") if isinstance(doc, dict) else None
    if isinstance(on, str):
        return {on: None}
    if isinstance(on, list):
        return {str(t): None for t in on}
    if isinstance(on, dict):
        return on
    return {}


def _jobs(doc):
    jobs = doc.get("jobs") if isinstance(doc, dict) else None
    return jobs if isinstance(jobs, dict) else {}


def _steps(job):
    steps = job.get("steps") if isinstance(job, dict) else None
    return [s for s in steps if isinstance(s, dict)] if isinstance(steps, list) else []


def _walk(node, path=()):
    """Every (path, key-or-None, scalar) in a tree, keys included."""
    if isinstance(node, dict):
        for k, v in node.items():
            yield path, k, None
            yield from _walk(v, path + (k,))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from _walk(v, path + (i,))
    else:
        yield path, None, node


def _common(doc, name):
    """Rules on both files: pinned actions, checkouts, and `${{` in run:."""
    out = []
    for job_id, job in _jobs(doc).items():
        uses = [("job", job.get("uses"))] if isinstance(job, dict) and "uses" in job else []
        uses += [("step", s.get("uses")) for s in _steps(job) if "uses" in s]
        for _, ref in uses:
            if not isinstance(ref, str) or not PINNED.match(ref):
                out.append(("action-not-pinned", f"{name}: job {job_id} uses {ref!r}, not pinned by a "
                                                 "40-character sha"))
        for step in _steps(job):
            run = step.get("run")
            if run is not None and "${{" in str(run):
                out.append(("run-expression", f"{name}: job {job_id} has `${{{{` in a run: line or block"))
            ref = step.get("uses")
            if isinstance(ref, str) and ref.split("@")[0].lower() == "actions/checkout":
                w = step.get("with") if isinstance(step.get("with"), dict) else {}
                if w.get("persist-credentials") not in (False, "false"):
                    out.append(("checkout-persist-credentials", f"{name}: job {job_id} has a checkout whose "
                                                                "persist-credentials is not false"))
                if "ref" in w and _norm(w.get("ref")) != DEFAULT_BRANCH_REF:
                    out.append(("checkout-ref", f"{name}: job {job_id} has a checkout of {w.get('ref')!r}, "
                                                "not the default branch"))
                if "repository" in w:
                    out.append(("checkout-repository", f"{name}: job {job_id} checks out another repository"))
    return out


def check_notify(text, name="desk-notify.yml"):
    try:
        doc = read_yaml(text)
    except YamlError as exc:
        return [("yaml-unreadable", f"{name}: {exc}")]
    if not isinstance(doc, dict):
        return [("yaml-unreadable", f"{name}: not a mapping")]
    out = []

    # Triggers.
    for trig, conf in _triggers(doc).items():
        if trig == "pull_request_target":
            out.append(("notify-trigger-pull_request_target", f"{name}: has the trigger pull_request_target"))
        elif trig == "pull_request":
            out.append(("notify-trigger-pull_request", f"{name}: has the trigger pull_request"))
        elif trig == "workflow_run":
            ok = (isinstance(conf, dict) and set(conf) <= {"workflows", "types", "branches", "branches-ignore"}
                  and isinstance(conf.get("workflows"), list) and set(map(str, conf["workflows"])) <= RUN_WORKFLOWS
                  and isinstance(conf.get("types"), list) and set(map(str, conf["types"])) <= RUN_TYPES)
            if not ok:
                out.append(("notify-trigger-other", f"{name}: its workflow_run trigger names a workflow or type "
                                                    "beyond Workflow 3's"))
        elif trig == "push":
            ok = (isinstance(conf, dict) and set(conf) <= {"branches", "paths", "paths-ignore"}
                  and conf.get("branches") == ["main"])
            if not ok:
                out.append(("notify-trigger-other", f"{name}: its push trigger is not main only"))
        elif trig == "schedule":
            if conf != [{"cron": CRON}]:
                out.append(("notify-trigger-other", f"{name}: its schedule is not Workflow 3's ({CRON})"))
        elif trig == "workflow_dispatch":
            ok = conf is None or (isinstance(conf, dict) and set(conf) <= {"inputs"} and (
                conf.get("inputs") is None or (isinstance(conf["inputs"], dict) and set(conf["inputs"]) <= {"test"})))
            if not ok:
                out.append(("notify-trigger-other", f"{name}: its workflow_dispatch has an input other than test"))
        else:
            out.append(("notify-trigger-other", f"{name}: has the trigger {trig}, not one of Workflow 3's"))

    # Permissions.
    perms = doc.get("permissions")
    if not (isinstance(perms, dict) and {k: str(v) for k, v in perms.items()} == PERMISSIONS):
        out.append(("notify-permissions", f"{name}: its permissions differ from Workflow 3's"))

    # Concurrency.
    if "concurrency" in doc:
        out.append(("notify-workflow-concurrency", f"{name}: has a workflow-level concurrency"))

    jobs = _jobs(doc)
    if set(jobs) != {"notify"}:
        out.append(("notify-jobs", f"{name}: its jobs are not exactly one, notify"))
    job = jobs.get("notify") if isinstance(jobs.get("notify"), dict) else {}
    if "permissions" in job and not (isinstance(job["permissions"], dict)
                                     and {k: str(v) for k, v in job["permissions"].items()} == PERMISSIONS):
        out.append(("notify-permissions", f"{name}: the notify job's permissions differ from Workflow 3's"))
    env = job.get("environment")
    if not (env == "notify" or (isinstance(env, dict) and env.get("name") == "notify")):
        out.append(("notify-environment", f"{name}: the notify job does not run in the notify Environment"))
    conc = job.get("concurrency")
    if not (conc == "desk-notify" or (isinstance(conc, dict) and conc.get("group") == "desk-notify"
                                      and conc.get("cancel-in-progress", False) is False
                                      and set(conc) <= {"group", "cancel-in-progress"})):
        out.append(("notify-job-concurrency", f"{name}: the notify job's concurrency (group desk-notify, "
                                              "cancel-in-progress false) is missing"))
    out += check_gate(job.get("if"), name)

    # Actions used, and where secrets appear.
    for job_id, j in jobs.items():
        for step in _steps(j):
            ref = step.get("uses")
            if isinstance(ref, str) and ref.split("@")[0].lower() not in ALLOWED_ACTIONS:
                out.append(("notify-action-not-allowed", f"{name}: job {job_id} uses {ref.split('@')[0]}; only "
                                                         "checkout, setup-node and upload-artifact are allowed"))
    raw_steps = job.get("steps") if isinstance(job.get("steps"), list) else []
    send_steps = {i for i, s in enumerate(raw_steps) if isinstance(s, dict) and SENDER in str(s.get("run") or "")}
    for path, key, value in _walk(doc):
        hit = key == "secrets" or (key is not None and SECRETS_WORD.search(str(key)) and "${{" in str(key)) \
            or (key is None and isinstance(value, str) and "${{" in value and SECRETS_WORD.search(value))
        if not hit:
            continue
        allowed = (key is None and len(path) == 6 and path[:3] == ("jobs", "notify", "steps")
                   and path[3] in send_steps and path[4] == "env")
        if not allowed:
            out.append(("notify-secret-outside-send-step", f"{name}: a secret outside the env of the step "
                                                           "that runs the sender"))
    return out + _common(doc, name)


def check_ready(text, name="desk-notify-ready.yml"):
    try:
        doc = read_yaml(text)
    except YamlError as exc:
        return [("yaml-unreadable", f"{name}: {exc}")]
    if not isinstance(doc, dict):
        return [("yaml-unreadable", f"{name}: not a mapping")]
    out = []
    trig = _triggers(doc)
    conf = trig.get("pull_request")
    if not (set(trig) == {"pull_request"} and isinstance(conf, dict)
            and set(conf) <= {"types", "branches", "branches-ignore", "paths", "paths-ignore"}
            and isinstance(conf.get("types"), list) and set(map(str, conf["types"])) <= READY_TYPES):
        out.append(("ready-trigger", f"{name}: its triggers are not pull_request {sorted(READY_TYPES)}"))
    if doc.get("permissions", None) != {} or "permissions" not in doc:
        out.append(("ready-permissions", f"{name}: its permissions are not {{}}"))
    for job_id, job in _jobs(doc).items():
        if isinstance(job, dict) and "permissions" in job and job["permissions"] != {}:
            out.append(("ready-permissions", f"{name}: job {job_id}'s permissions are not {{}}"))
        if isinstance(job, dict) and "environment" in job:
            out.append(("ready-environment", f"{name}: job {job_id} runs in an Environment"))
        for step in _steps(job):
            ref = step.get("uses")
            if isinstance(ref, str) and ref.split("@")[0].lower() == "actions/checkout":
                out.append(("ready-checkout", f"{name}: job {job_id} has a checkout"))
    for _, key, value in _walk(doc):
        if key == "secrets" or (isinstance(key, str) and "${{" in key and SECRETS_WORD.search(key)) \
                or (key is None and isinstance(value, str) and "${{" in value and SECRETS_WORD.search(value)):
            out.append(("ready-secret", f"{name}: holds a secret"))
            break
    return out + _common(doc, name)


def main(argv):
    if len(argv) not in (0, 2) or any(a.startswith("-") for a in argv):
        print(__doc__, file=sys.stderr)
        return 2
    notify = Path(argv[0]) if argv else WORKFLOWS / "desk-notify.yml"
    ready = Path(argv[1]) if argv else WORKFLOWS / "desk-notify-ready.yml"
    reasons = []
    for path, fn in ((notify, check_notify), (ready, check_ready)):
        try:
            text = path.read_text(encoding="utf-8")
        except OSError as exc:
            reasons.append(("missing", f"{path}: cannot be read ({exc.strerror})"))
            continue
        reasons += fn(text, path.name)
    for code, message in reasons:
        print(f"::error::{code}: {message}")
    if reasons:
        return 1
    print("desk notify check: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
