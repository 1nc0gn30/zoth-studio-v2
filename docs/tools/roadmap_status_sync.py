#!/usr/bin/env python3
"""Sync the status column of ZOTH_STUDIO_80_TOOLS_ROADMAP.md with the evidence in
docs/SOVEREIGN_ECOSYSTEM_ATLAS.md.

Rationale: the roadmap is hand-maintained and had drifted into asserting
"5-Layer Verified" for tools whose Layer C (CLI surfaces) or Layer E (visual
capture) is demonstrably not green in the atlas matrix. The atlas is generated
from real probe output, so it is the source of truth; this tool makes the
roadmap's status cell a projection of it instead of a claim.

Usage:
  python3 docs/tools/roadmap_status_sync.py --check   # report drift, exit 1 if any
  python3 docs/tools/roadmap_status_sync.py           # rewrite the status column
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ST = Path(__file__).resolve().parents[2]
ATLAS = ST / "docs" / "SOVEREIGN_ECOSYSTEM_ATLAS.md"
ROADMAP = ST / "ZOTH_STUDIO_80_TOOLS_ROADMAP.md"

LAYERS = ("A", "B", "C", "D", "E")
LAYER_NAME = {
    "A": "standalone app",
    "B": "Studio route",
    "C": "CLI surfaces",
    "D": "docs",
    "E": "visual capture",
}
# Roadmap status strings
VERIFIED = "✅ 5-Layer Verified"


def parse_atlas() -> dict[str, dict[str, str]]:
    """id -> {layer: 'ok' | 'drift' | 'missing'} from the atlas matrix table."""
    out: dict[str, dict[str, str]] = {}
    row_re = re.compile(r"^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|(.*)\|\s*$")
    for line in ATLAS.read_text(encoding="utf-8").splitlines():
        m = row_re.match(line)
        if not m:
            continue
        tool_id, rest = m.group(1), m.group(2)
        cells = [c.strip() for c in rest.split("|")]
        # cells: category, version, port, exec, then five layer cells
        layer_cells = cells[-5:]
        if len(layer_cells) != 5:
            continue
        status: dict[str, str] = {}
        for layer, cell in zip(LAYERS, layer_cells):
            bare = cell.strip("`")
            if bare == layer:
                status[layer] = "ok"
            elif bare == f"^{layer}^":
                status[layer] = "drift"
            else:
                status[layer] = "missing"
        if set(status) == set(LAYERS):
            out[tool_id] = status
    return out


def verdict(status: dict[str, str]) -> str:
    bad = [l for l in LAYERS if status.get(l) != "ok"]
    if not bad:
        return VERIFIED
    parts = []
    for layer in bad:
        kind = status.get(layer, "missing")
        if kind == "drift":
            parts.append(f"Layer {layer} drift ({LAYER_NAME[layer]})")
        else:
            parts.append(f"Layer {layer} unverified ({LAYER_NAME[layer]})")
    return "⚠️ " + " · ".join(parts)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report only, never write")
    args = ap.parse_args()

    atlas = parse_atlas()
    if not atlas:
        print("FAIL: no tool rows parsed from the atlas matrix", file=sys.stderr)
        return 2

    lines = ROADMAP.read_text(encoding="utf-8").splitlines(keepends=True)
    id_re = re.compile(r"^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|")
    status_re = re.compile(r"^\s*(?:✅|⚠️|installed|pending|in progress|n/a)")
    changed, unmatched, unknown = [], [], []
    out_lines = []
    for line in lines:
        m = id_re.match(line)
        if not m:
            out_lines.append(line)
            continue
        tool_id = m.group(1)
        cells = line.split("|")
        idx = next((i for i, c in enumerate(cells) if i >= 7 and status_re.match(c)), None)
        if idx is None:
            unmatched.append(tool_id)
            out_lines.append(line)
            continue
        status = atlas.get(tool_id)
        if status is None:
            unknown.append(tool_id)
            out_lines.append(line)
            continue
        want = verdict(status)
        have = cells[idx].strip()
        if have != want:
            changed.append((tool_id, have, want))
            lead = cells[idx][: len(cells[idx]) - len(cells[idx].lstrip())]
            trail = cells[idx][len(cells[idx].rstrip()):]
            cells[idx] = f"{lead}{want}{trail}"
            out_lines.append("|".join(cells))
        else:
            out_lines.append(line)

    total_rows = sum(1 for l in lines if id_re.match(l))
    print(f"atlas tools parsed: {len(atlas)}")
    print(f"roadmap rows matched: {total_rows}  (no status cell: {len(unmatched)}; no atlas entry: {len(unknown)})")
    print(f"status cells corrected: {len(changed)}")
    from collections import Counter
    print("new verdict distribution:", dict(Counter(verdict(v) for v in atlas.values())))
    for tool_id, have, want in changed[:12]:
        print(f"  {tool_id}: {have!r} -> {want!r}")
    if len(changed) > 12:
        print(f"  ... {len(changed) - 12} more")
    if unknown:
        print("  rows with no atlas entry:", ", ".join(unknown[:12]))

    if args.check:
        return 1 if changed else 0
    if changed:
        ROADMAP.write_text("".join(out_lines), encoding="utf-8")
        print(f"wrote {ROADMAP}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
