#!/usr/bin/env python3
"""Check that every event the site pushes to the dataLayer has a tag in Tag Manager.

Standard library only. Usage (from anywhere in the repo):

    python3 .agents/check-gtm-coverage.py                 # live container
    python3 .agents/check-gtm-coverage.py --file X.json   # local container file(s)

Code side: event names are collected from every .js and .html file in the
repo (outside .git and .agents): object literals with an `event` key and a
string value (dataLayer.push({event: '...'}) and payload objects pushed
later), trackEvent('...') calls and gtag('event', '...') calls. Tag Manager
built-in events (gtm.*) are ignored.

Container side: the event names that Custom Event triggers match, for
triggers that fire at least one tag. --file accepts, and may be repeated to
merge, any of:
  - a GTM container export (Admin > Export Container; JSON with
    containerVersion.tag / containerVersion.trigger, or bare tag / trigger lists)
  - a downloaded gtm.js (https://www.googletagmanager.com/gtm.js?id=...)
  - a JSON file holding the gtm.js "resource" object (predicates / rules)
Without --file the published container is fetched from googletagmanager.com
(a script download, not an analytics hit).

Prints three lists: pushed with a tag, pushed with no tag, tagged but never
pushed. Exit 0 when every pushed event has a tag, 1 when any does not, 2 when
the container cannot be read.
"""

import argparse
import json
import os
import re
import sys
import urllib.request

CONTAINER_ID = "GTM-M686VJGG"
GTM_URL = "https://www.googletagmanager.com/gtm.js?id="

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {".git", ".agents", "node_modules"}

NAME = r"[A-Za-z0-9_.\-]+"
CODE_PATTERNS = [
    # {event: 'x'} / {'event': "x"} anywhere (dataLayer.push and payload objects)
    re.compile(r"""(?<![\w$.])['"]?event['"]?\s*:\s*(['"`])(""" + NAME + r""")\1"""),
    # trackEvent('x', ...)
    re.compile(r"""\btrackEvent\s*\(\s*(['"`])(""" + NAME + r""")\1"""),
    # gtag('event', 'x', ...)
    re.compile(r"""\bgtag\s*\(\s*['"]event['"]\s*,\s*(['"`])(""" + NAME + r""")\1"""),
]
COMMENT_LINE = re.compile(r"^\s*(//|/\*|\*)")


class ContainerError(Exception):
    pass


# --------------------------------------------------------------------- code

def pushed_events(root):
    """Return {event_name: [file:line, ...]} for events the code pushes."""
    found = {}
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for fn in sorted(filenames):
            if not fn.endswith((".js", ".html")):
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, root)
            try:
                with open(path, encoding="utf-8", errors="replace") as fh:
                    lines = fh.readlines()
            except OSError:
                continue
            for no, line in enumerate(lines, 1):
                if COMMENT_LINE.match(line):
                    continue
                for pat in CODE_PATTERNS:
                    for m in pat.finditer(line):
                        name = m.group(2)
                        if name.startswith("gtm."):
                            continue
                        found.setdefault(name, []).append("%s:%d" % (rel, no))
    return found


# ---------------------------------------------------------------- container

class Matchers:
    """Event-name conditions of triggers that fire at least one tag."""

    def __init__(self):
        self.exact = set()      # literal names
        self.other = []         # (description, predicate function)

    def add_exact(self, name):
        if name and not name.startswith("gtm."):
            self.exact.add(name)

    def add_other(self, desc, fn):
        self.other.append((desc, fn))

    def matches(self, name):
        if name in self.exact:
            return True
        return any(fn(name) for _, fn in self.other)

    def merge(self, other):
        self.exact |= other.exact
        self.other += other.other


def _op(kind, value, ignore_case=False, negate=False):
    """Build a matcher for a GTM comparison; None when unsupported."""
    value = str(value)
    flags = re.I if ignore_case else 0
    norm = (lambda s: s.lower()) if ignore_case else (lambda s: s)
    if kind in ("equals", "_eq"):
        fn = lambda s: norm(s) == norm(value)
    elif kind in ("contains", "_cn"):
        fn = lambda s: norm(value) in norm(s)
    elif kind in ("starts_with", "_sw"):
        fn = lambda s: norm(s).startswith(norm(value))
    elif kind in ("ends_with", "_ew"):
        fn = lambda s: norm(s).endswith(norm(value))
    elif kind in ("match_regex", "_re"):
        try:
            rx = re.compile(value, flags)
        except re.error:
            return None
        fn = lambda s: rx.search(s) is not None
    else:
        return None
    if negate:
        return lambda s, f=fn: not f(s)
    return fn


def parse_gtm_resource(res):
    """gtm.js resource: predicates + rules (+ macros) -> Matchers."""
    macros = res.get("macros", [])
    predicates = res.get("predicates", [])
    rules = res.get("rules", [])
    event_macros = {i for i, m in enumerate(macros) if isinstance(m, dict) and m.get("function") == "__e"}

    def event_pred(idx):
        if not (0 <= idx < len(predicates)):
            return None
        p = predicates[idx]
        arg0 = p.get("arg0")
        if not (isinstance(arg0, list) and len(arg0) == 2 and arg0[0] == "macro" and arg0[1] in event_macros):
            return None
        return p

    out = Matchers()
    for rule in rules:
        ifs, unless, adds = [], [], False
        for clause in rule:
            if not clause:
                continue
            if clause[0] == "if":
                ifs += clause[1:]
            elif clause[0] == "unless":
                unless += clause[1:]
            elif clause[0] == "add" and len(clause) > 1:
                adds = True
        if not adds:
            continue
        blocked = set()
        for idx in unless:
            p = event_pred(idx)
            if p and p.get("function") == "_eq" and not p.get("negate"):
                blocked.add(str(p.get("arg1")))
        for idx in ifs:
            p = event_pred(idx)
            if not p:
                continue
            func, val = p.get("function"), p.get("arg1")
            if func == "_eq" and not p.get("negate") and not p.get("ignore_case"):
                if str(val) not in blocked:
                    out.add_exact(str(val))
            else:
                fn = _op(func, val, bool(p.get("ignore_case")), bool(p.get("negate")))
                if fn:
                    out.add_other("%s %s" % (func, val), lambda s, f=fn, b=frozenset(blocked): f(s) and s not in b)
    return out


def _param(params, key):
    for p in params or []:
        if p.get("key") == key:
            return p.get("value")
    return None


def parse_gtm_export(cv):
    """GTM export containerVersion (tag / trigger lists) -> Matchers."""
    tags = cv.get("tag") or []
    triggers = {str(t.get("triggerId")): t for t in (cv.get("trigger") or [])}
    firing = set()
    for tag in tags:
        if tag.get("paused"):
            continue
        for tid in tag.get("firingTriggerId") or []:
            firing.add(str(tid))
    out = Matchers()
    for tid in sorted(firing):
        trig = triggers.get(tid)
        if not trig or str(trig.get("type", "")).upper() != "CUSTOM_EVENT":
            continue
        for cond in trig.get("customEventFilter") or []:
            params = cond.get("parameter")
            arg0, arg1 = _param(params, "arg0"), _param(params, "arg1")
            if arg0 is None or "event" not in str(arg0).lower():
                continue
            kind = str(cond.get("type", "")).lower()
            negate = str(_param(params, "negate")).lower() == "true"
            icase = str(_param(params, "ignore_case")).lower() == "true"
            if kind == "equals" and not negate and not icase:
                out.add_exact(str(arg1))
            else:
                fn = _op(kind, arg1, icase, negate)
                if fn:
                    out.add_other("%s %s" % (kind, arg1), fn)
    return out


def parse_container_text(text, label):
    text = text.lstrip("﻿")
    stripped = text.lstrip()
    if stripped.startswith("{"):
        try:
            obj = json.loads(stripped)
        except ValueError as e:
            raise ContainerError("%s: not valid JSON (%s)" % (label, e))
        cv = obj.get("containerVersion", obj)
        if isinstance(cv, dict) and ("tag" in cv or "trigger" in cv):
            return parse_gtm_export(cv)
        res = obj.get("resource", obj)
        if isinstance(res, dict) and "predicates" in res and "rules" in res:
            return parse_gtm_resource(res)
        raise ContainerError("%s: JSON is neither a GTM export nor a gtm.js resource" % label)
    # gtm.js: var data = {"resource": {...}, ...}
    m = re.search(r'"resource"\s*:\s*\{', text)
    if not m:
        raise ContainerError("%s: no container resource found (is this a gtm.js file?)" % label)
    try:
        res, _ = json.JSONDecoder().raw_decode(text, m.end() - 1)
    except ValueError as e:
        raise ContainerError("%s: could not decode container resource (%s)" % (label, e))
    return parse_gtm_resource(res)


def load_container(files, container_id, timeout):
    if files:
        merged = Matchers()
        for f in files:
            try:
                with open(f, encoding="utf-8", errors="replace") as fh:
                    merged.merge(parse_container_text(fh.read(), f))
            except OSError as e:
                raise ContainerError("%s: %s" % (f, e))
        return merged, ", ".join(files)
    url = GTM_URL + container_id
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            text = r.read().decode("utf-8", errors="replace")
    except Exception as e:  # network, HTTP, TLS
        raise ContainerError("could not fetch %s (%s)" % (url, e))
    return parse_container_text(text, url), url


# --------------------------------------------------------------------- main

def main(argv=None):
    ap = argparse.ArgumentParser(description="Fail when the code pushes a dataLayer event that no Tag Manager tag fires on.")
    ap.add_argument("--file", action="append", default=[], metavar="PATH",
                    help="container file: GTM export JSON, gtm.js, or gtm.js resource JSON (repeat to merge)")
    ap.add_argument("--container", default=CONTAINER_ID, help="container id to fetch when no --file (default %(default)s)")
    ap.add_argument("--root", default=REPO_ROOT, help="repo root to scan (default: this repo)")
    ap.add_argument("--timeout", type=float, default=20, help="fetch timeout in seconds (default %(default)s)")
    ap.add_argument("-v", "--verbose", action="store_true", help="show where each event is pushed")
    args = ap.parse_args(argv)

    pushed = pushed_events(args.root)
    try:
        matchers, source = load_container(args.file, args.container, args.timeout)
    except ContainerError as e:
        print("error: %s" % e, file=sys.stderr)
        return 2

    names = sorted(pushed)
    tagged = [n for n in names if matchers.matches(n)]
    untagged = [n for n in names if not matchers.matches(n)]
    unused = sorted(matchers.exact - set(names))

    def section(title, items, where=False):
        print("%s (%d)" % (title, len(items)))
        for n in items:
            line = "  " + n
            if where and n in pushed:
                line += "    " + ", ".join(pushed[n])
            print(line)
        print()

    print("Container: %s" % source)
    print("Code: %d events pushed in %s\n" % (len(names), args.root))
    section("Pushed with a tag", tagged, args.verbose)
    section("Pushed with NO tag", untagged, True)
    section("Tagged but never pushed", unused)
    if matchers.other:
        print("Non-literal event conditions (checked against pushed names, cannot list unused):")
        for desc, _ in matchers.other:
            print("  " + desc)
        print()
    if untagged:
        print("FAIL: %d of %d pushed events have no tag in the container." % (len(untagged), len(names)))
        return 1
    print("OK: all %d pushed events have a tag." % len(names))
    return 0


if __name__ == "__main__":
    sys.exit(main())
