#!/usr/bin/env python3
"""Phase 2 probe — per-tool Layer A/D evidence for "The Particular Invariant".

Hermes 24h mission. Read-only: measures, never writes to any repo.

For one tool id (or --all) it resolves the repo dir, the standalone web entry
document, and reports the exact Layer A deficiencies (ld+json, WebApplication,
FAQPage, OpenGraph, <img> without alt, canonical Stripe support link) plus the
Layer D README sections. Output is JSON on stdout so the sweep log can consume it.

Usage:
  python3 docs/tools/parity_probe.py zoth-bolt
  python3 docs/tools/parity_probe.py --all
"""
import argparse
import json
import os
import re
import sys

ROOT = "~/NullAITech"
STUDIO = os.path.join(ROOT, "zoth-studio-v2")
TOOLS_JS = os.path.join(STUDIO, "src", "data", "toolsData.js")
STRIPE = "https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X"
ENTRY_NAMES = ("index.html", "standalone.html", "app.html", "public/index.html",
               "src/index.html", "web/index.html", "site/index.html", "docs/index.html")


def parse_tools():
    """Extract the tool records from toolsData.js by field regex (no node needed)."""
    src = open(TOOLS_JS, encoding="utf-8").read()
    tools = []
    for blk in re.findall(r"\{(?:[^{}]|\{[^{}]*\})*\}", src):
        tid = re.search(r"id:\s*'([^']+)'", blk)
        if not tid:
            continue
        rec = {"id": tid.group(1)}
        for key, pat in (("name", r"name:\s*'([^']*)'"),
                         ("repo", r"repo:\s*'([^']*)'"),
                         ("category", r"category:\s*'([^']*)'"),
                         ("version", r"version:\s*'([^']*)'"),
                         ("executionType", r"executionType:\s*'([^']*)'")):
            m = re.search(pat, blk)
            rec[key] = m.group(1) if m else ""
        m = re.search(r"localPort:\s*(\d+)", blk)
        rec["localPort"] = int(m.group(1)) if m else 0
        tools.append(rec)
    seen, out = set(), []
    for t in tools:
        if t["id"] in seen:
            continue
        seen.add(t["id"])
        out.append(t)
    return out


def local_repo_dir(t):
    """Resolve a tool's on-disk repo directory.

    toolsData.js `repo` is a GitHub owner/name slug (e.g. 'NullAITech/zoth-bot',
    '1nc0gn30/subsweep-lead-scanner'), NOT a filesystem path -- most of the fleet
    happens to also have a top-level dir named after the slug's basename, but the
    org prefix differs. So: prefer the slug path when it really is a directory,
    else fall back to ROOT/<id>, else ROOT/<basename>.
    """
    slug = (t.get("repo") or "").strip()
    cands = [slug, t["id"], slug.split("/")[-1] if slug else ""]
    for c in cands:
        if c and os.path.isdir(os.path.join(ROOT, c)):
            return os.path.join(ROOT, c)
    return os.path.join(ROOT, t["id"])


def _referenced_names(repo_dir):
    """Basenames of .html docs the repo's own source actually serves or embeds.

    A doc named in a `//go:embed dashboard.html`, an express `res.sendFile(...)`,
    or an `open("...html")` call is the real entry surface. Used to break ties in
    find_entry: the *served* doc beats an incidental sibling template.
    """
    names = set()
    exts = (".go", ".js", ".mjs", ".cjs", ".py", ".rs", ".ts", ".tsx", ".jsx", ".sh")
    for base, dirs, files in os.walk(repo_dir):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "dist", "build", ".venv", "vendor", "target")]
        if base.count(os.sep) - repo_dir.count(os.sep) > 3:
            dirs[:] = []
        for f in files:
            if os.path.splitext(f)[1] not in exts:
                continue
            try:
                txt = open(os.path.join(base, f), encoding="utf-8", errors="replace").read()
            except OSError:
                continue
            names.update(re.findall(r"([\w.-]+\.html)", txt))
    return names


def find_entry(repo_dir):
    for rel in ENTRY_NAMES:
        p = os.path.join(repo_dir, rel)
        if os.path.isfile(p):
            return p
    # Fallback for non-conventional layouts: prefer a doc the source actually
    # serves/embeds, then the largest document (a stub is never the real UI),
    # then the shortest path.
    cands = []
    for base, dirs, files in os.walk(repo_dir):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "dist", "build", ".venv")]
        if base.count(os.sep) - repo_dir.count(os.sep) > 2:
            dirs[:] = []
        for f in files:
            if f.endswith(".html"):
                cands.append(os.path.join(base, f))
    ref = _referenced_names(repo_dir)

    def _rank(p):
        rel = os.path.relpath(p, repo_dir).replace(os.sep, "/")
        served = 0 if (os.path.basename(p) in ref or rel in ref) else 1
        return (served, -os.path.getsize(p), len(rel))

    cands.sort(key=_rank)
    return cands[0] if cands else None


def _stripe_in_sources(repo_dir):
    """True when an SPA renders the support link from its bundle, not the shell.

    Vite/React tools keep the tip block in src/ (e.g. App.tsx) and ship it in
    dist/assets/*.js, so a raw grep of public/index.html finds nothing while the
    deployed page really does have the link. Absence of a shell anchor alone is
    therefore not evidence of a missing support link.
    """
    exts = (".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue", ".svelte", ".html")
    for base, dirs, files in os.walk(repo_dir):
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", ".venv", "vendor")]
        if base.count(os.sep) - repo_dir.count(os.sep) > 3:
            dirs[:] = []
        for f in files:
            if os.path.splitext(f)[1] not in exts:
                continue
            try:
                if STRIPE in open(os.path.join(base, f), encoding="utf-8", errors="replace").read():
                    return os.path.relpath(os.path.join(base, f), repo_dir)
            except OSError:
                continue
    return ""


def _strip_comments(html):
    """Drop HTML/JS comments so a documented <img> inside a code comment is not
    counted as real markup (false-positive source of img-alt violations)."""
    h = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    h = re.sub(r"/\*.*?\*/", "", h, flags=re.S)
    return re.sub(r"^[ \t]*//.*$", "", h, flags=re.M)


def probe_layer_a(repo_dir):
    entry = find_entry(repo_dir)
    res = {"entry": entry, "repo": repo_dir, "repo_exists": os.path.isdir(repo_dir)}
    if not entry:
        res.update({"has_entry": False})
        return res
    html = open(entry, encoding="utf-8", errors="replace").read()
    live = _strip_comments(html)
    m = re.search(r"<title>(.*?)</title>", html, re.S | re.I)
    stripe_anchor = len(re.findall(r"<a\b[^>]*" + re.escape(STRIPE), live, re.I))
    stripe_src = "" if stripe_anchor else _stripe_in_sources(repo_dir)
    res.update({
        "has_entry": True,
        "bytes": len(html),
        "has_ldjson": bool(re.search(r'<script[^>]+application/ld\+json', html, re.I)),
        "has_webapp": '"WebApplication"' in html or "'WebApplication'" in html,
        "has_faq": '"FAQPage"' in html or "'FAQPage'" in html,
        "og_tags": len(re.findall(r'<meta[^>]+property=["\']og:', html, re.I)),
        "twitter_tags": len(re.findall(r'<meta[^>]+name=["\']twitter:', html, re.I)),
        "img_total": len(re.findall(r"<img\b", live, re.I)),
        "img_missing_alt": len(re.findall(r"<img\b(?![^>]*\balt=)[^>]*>", live, re.I)),
        "has_stripe": STRIPE in html,
        "stripe_anchor": stripe_anchor,
        "stripe_in_sources": stripe_src,
        "support_ok": bool(stripe_anchor or stripe_src),
        "title": (m.group(1).strip()[:120] if m else ""),
    })
    res["a_gap"] = ([] if all([res["has_ldjson"], res["has_webapp"], res["has_faq"],
                               res["og_tags"] >= 2, res["img_missing_alt"] == 0,
                               res["support_ok"]])
                    else [k for k, ok in (("ld+json", res["has_ldjson"]),
                                          ("WebApplication", res["has_webapp"]),
                                          ("FAQPage", res["has_faq"]),
                                          ("og-tags", res["og_tags"] >= 2),
                                          ("img-alt", res["img_missing_alt"] == 0),
                                          ("support-link", res["support_ok"])) if not ok])
    return res


def probe_layer_d(repo_dir):
    rd = os.path.join(repo_dir, "README.md")
    if not os.path.isfile(rd):
        return {"readme": rd, "has_readme": False, "gap": ["README missing"]}
    txt = open(rd, encoding="utf-8", errors="replace").read()
    low = txt.lower()
    checks = {
        "what_it_does": bool(re.search(r"^#{1,3}.*(what it does|overview|features)", low, re.M)),
        "port": ("port" in low) and bool(re.search(r"\b\d{4}\b", txt)),
        "cli_usage": "--help" in txt,
        "studio_route": "/tools/" in low,
    }
    return {"readme": rd, "has_readme": True, "bytes": len(txt), "checks": checks,
            "gap": [k for k, v in checks.items() if not v]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tool", nargs="?")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--layer", choices=["A", "D", "both"], default="both")
    args = ap.parse_args()

    tools = parse_tools()
    if args.all:
        sel = tools
    else:
        sel = [t for t in tools if t["id"] == args.tool]
        if not sel:
            print(json.dumps({"error": "unknown tool id", "id": args.tool,
                              "known": len(tools)}, indent=2))
            return 2

    out = []
    for t in sel:
        repo_dir = local_repo_dir(t)
        rec = dict(t)
        if args.layer in ("A", "both"):
            rec["A"] = probe_layer_a(repo_dir)
        if args.layer in ("D", "both"):
            rec["D"] = probe_layer_d(repo_dir)
        out.append(rec)
    print(json.dumps(out if args.all else out[0], indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
