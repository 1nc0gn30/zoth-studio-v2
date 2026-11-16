#!/usr/bin/env python3
"""Layer A fixer — widen schema.org '@type' to include WebApplication.

Hermes 24h mission, Phase 2. The fleet's entry docs carry a valid
`<script type="application/ld+json">` node whose software entity is declared as
`"@type": "SoftwareApplication"` only. The mission's Layer A invariant requires
the doc to be declared as a `WebApplication` as well. This tool edits the
existing block in place — it never injects a second JSON-LD block — so the
result stays one valid graph with the FAQPage node untouched.

Safety: one tool per invocation, idempotent (skips when already widened),
non-destructive (timestamped backup), and self-validating (the edited block is
re-parsed as JSON and re-probed with parity_probe.probe_layer_a).

Usage:
  python3 docs/tools/ldtype_upgrade.py promptmaster-studio [--dry-run]
  python3 docs/tools/ldtype_upgrade.py --all --dry-run
"""
import argparse
import json
import os
import re
import shutil
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parity_probe as P  # noqa: E402

BACKUP_DIR = "~/.hermes/cache/scratch/backups-24h"
NEW_TYPE = '["WebApplication", "SoftwareApplication"]'
# the exact key/value pair the fleet emits, with any inner/outer spacing
PAT = re.compile(r'("@type"\s*:\s*)"SoftwareApplication"')
BLOCK = re.compile(r'(<script[^>]+application/ld\+json[^>]*>)(.*?)(</script>)', re.S | re.I)


def upgrade(entry, dry_run=False):
    html = open(entry, encoding="utf-8", errors="replace").read()
    blocks = list(BLOCK.finditer(html))
    if not blocks:
        return {"action": "no-ldjson", "entry": entry}
    out, chunks, cursor, changed, already = [], [], 0, 0, 0
    for m in blocks:
        body = m.group(2)
        if "WebApplication" in body:
            already += 1
            continue
        if not PAT.search(body):
            continue
        new_body, n = PAT.subn(lambda mm: mm.group(1) + NEW_TYPE, body)
        try:
            json.loads(new_body)  # never write a block that stops parsing
        except json.JSONDecodeError as e:
            return {"action": "abort-invalid-json", "entry": entry, "error": str(e)}
        chunks.append((m.start(2), m.end(2), new_body))
        changed += n
    if not changed:
        return {"action": "skip", "entry": entry,
                "reason": "no '\"@type\": \"SoftwareApplication\"' pair inside a JSON-LD block",
                "webapp_blocks": already}
    if dry_run:
        return {"action": "would-upgrade", "entry": entry, "occurrences": changed,
                "backup": None}
    new_html = html
    for s, e, body in reversed(chunks):
        new_html = new_html[:s] + body + new_html[e:]
    os.makedirs(BACKUP_DIR, exist_ok=True)
    bkp = os.path.join(BACKUP_DIR, os.path.basename(entry) + ".pre-ldtype." + time.strftime("%Y%m%d%H%M%S"))
    shutil.copy2(entry, bkp)
    open(entry, "w", encoding="utf-8").write(new_html)
    return {"action": "upgraded", "entry": entry, "occurrences": changed, "backup": bkp}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tool", nargs="?")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    tools = P.parse_tools()
    sel = tools if a.all else [t for t in tools if t["id"] == a.tool]
    if not sel:
        print(json.dumps({"error": "unknown tool id", "id": a.tool}))
        return 2
    rc = 0
    for t in sel:
        repo = P.local_repo_dir(t)
        entry = P.find_entry(repo)
        if not entry:
            print(json.dumps({"id": t["id"], "action": "no-entry", "repo": repo}))
            rc = max(rc, 3)
            continue
        r = upgrade(entry, a.dry_run)
        r["id"] = t["id"]
        if r["action"] in ("upgraded", "would-upgrade"):
            r["gap_after"] = P.probe_layer_a(repo).get("a_gap")
        print(json.dumps(r))
        if r["action"].startswith("abort"):
            rc = max(rc, 5)
    return rc


if __name__ == "__main__":
    sys.exit(main())
